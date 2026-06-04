import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'webtv'
});

async function runMigrations() {
  try {
    console.log('Démarrage des migrations...');
    
    // Table des utilisateurs administrateur
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Table admin_users créée');
    
    // Table de la grille TV
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedule (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        channel VARCHAR(100),
        video_url VARCHAR(500),
        is_live BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Table schedule créée');
    
    // Table des vidéos VOD
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vod (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail VARCHAR(500),
        video_url VARCHAR(500) NOT NULL,
        duration INTEGER,
        category VARCHAR(100),
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Table vod créée');
    
    // Table des commentaires
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY,
        video_id UUID NOT NULL REFERENCES vod(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Table comments créée');
    
    // Table des likes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id UUID PRIMARY KEY,
        video_id UUID NOT NULL REFERENCES vod(id) ON DELETE CASCADE,
        client_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(video_id, client_id)
      )
    `);
    console.log('✓ Table likes créée');
    
    // Créer un utilisateur admin par défaut
    const adminEmail = 'admin@webtv.local';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const existing = await pool.query(
      'SELECT id FROM admin_users WHERE email = $1',
      [adminEmail]
    );
    
    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO admin_users (id, email, password) VALUES (gen_random_uuid(), $1, $2)',
        [adminEmail, hashedPassword]
      );
      console.log(`✓ Utilisateur admin créé: ${adminEmail} / ${adminPassword}`);
    }
    
    console.log('\n✅ Migrations terminées avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  }
}

runMigrations();
