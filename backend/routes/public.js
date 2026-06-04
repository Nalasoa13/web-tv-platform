import express from 'express';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Récupérer la grille TV
router.get('/schedule', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, start_time, end_time, channel, video_url, is_live 
       FROM schedule ORDER BY start_time ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les vidéos VOD
router.get('/vod', async (req, res) => {
  try {
    const category = req.query.category;
    let query = 'SELECT id, title, description, thumbnail, video_url, duration, category, likes, views FROM vod WHERE published = true';
    const params = [];
    
    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer une vidéo spécifique
router.get('/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, title, description, thumbnail, video_url, duration, category, likes, views, created_at 
       FROM vod WHERE id = $1 AND published = true`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vidéo non trouvée' });
    }
    
    // Incrémenter les vues
    await pool.query('UPDATE vod SET views = views + 1 WHERE id = $1', [id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Rechercher des programmes
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Requête trop courte' });
    }
    
    const searchTerm = `%${q}%`;
    const result = await pool.query(
      `SELECT id, title, description, thumbnail, video_url, duration, category, 'vod' as type FROM vod 
       WHERE (title ILIKE $1 OR description ILIKE $1) AND published = true
       UNION
       SELECT id, title, description, NULL, video_url, NULL, NULL, 'schedule' as type FROM schedule
       WHERE title ILIKE $1 OR description ILIKE $1
       LIMIT 20`,
      [searchTerm]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les commentaires d'une vidéo
router.get('/comments/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const result = await pool.query(
      `SELECT id, username, content, created_at, likes FROM comments 
       WHERE video_id = $1 AND approved = true
       ORDER BY created_at DESC LIMIT 50`,
      [videoId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Générer un pseudonyme aléatoire
router.get('/generate-username', (req, res) => {
  const adjectives = ['Rapide', 'Heureux', 'Brave', 'Sage', 'Drôle', 'Brillant', 'Dynamique', 'Créatif'];
  const nouns = ['Panda', 'Aigle', 'Tigre', 'Phénix', 'Dragon', 'Loup', 'Renard', 'Ours'];
  const number = Math.floor(Math.random() * 1000);
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  res.json({ username: `${adjective}${noun}${number}` });
});

export default router;
