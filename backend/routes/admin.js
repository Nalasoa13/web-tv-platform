import express from 'express';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware de vérification JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token invalide' });
  }
};

// Authentification admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      'SELECT id, email, password FROM admin_users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer/modifier une émission
router.post('/schedule', verifyToken, async (req, res) => {
  try {
    const { title, description, startTime, endTime, channel, videoUrl, isLive } = req.body;
    const id = uuidv4();
    
    await pool.query(
      `INSERT INTO schedule (id, title, description, start_time, end_time, channel, video_url, is_live)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, title, description, startTime, endTime, channel, videoUrl, isLive]
    );
    
    res.status(201).json({ id, message: 'Émission créée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer/modifier une vidéo VOD
router.post('/vod', verifyToken, async (req, res) => {
  try {
    const { title, description, thumbnail, videoUrl, duration, category } = req.body;
    const id = uuidv4();
    
    await pool.query(
      `INSERT INTO vod (id, title, description, thumbnail, video_url, duration, category, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, title, description, thumbnail, videoUrl, duration, category, false]
    );
    
    res.status(201).json({ id, message: 'Vidéo créée (en attente de publication)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Publier une vidéo
router.put('/vod/:id/publish', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE vod SET published = true WHERE id = $1', [id]);
    res.json({ message: 'Vidéo publiée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Modérer les commentaires
router.get('/comments/pending', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, video_id, username, content, created_at FROM comments 
       WHERE approved = false ORDER BY created_at ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Approuver un commentaire
router.put('/comments/:id/approve', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE comments SET approved = true WHERE id = $1', [id]);
    res.json({ message: 'Commentaire approuvé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Rejeter un commentaire
router.delete('/comments/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Statistiques
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const views = await pool.query('SELECT SUM(views) as total_views FROM vod');
    const likes = await pool.query('SELECT SUM(likes) as total_likes FROM vod');
    const comments = await pool.query('SELECT COUNT(*) as total_comments FROM comments WHERE approved = true');
    const videos = await pool.query('SELECT COUNT(*) as total_videos FROM vod WHERE published = true');
    
    res.json({
      totalViews: views.rows[0].total_views || 0,
      totalLikes: likes.rows[0].total_likes || 0,
      totalComments: comments.rows[0].total_comments || 0,
      totalVideos: videos.rows[0].total_videos || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
