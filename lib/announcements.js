import { getDbPool } from './db.js';

let tableEnsured = false;

async function ensureTable() {
  if (tableEnsured) return;
  const pool = getDbPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'update', 'event', 'interpretation')),
      cover_image TEXT DEFAULT '',
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
    CREATE INDEX IF NOT EXISTS idx_announcements_sort_order ON announcements(sort_order);
  `);

  /* Migration: add cover_image column if it doesn't exist */
  try {
    await pool.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT ''`);
  } catch (migrateErr) {
    console.error('Migration cover_image:', migrateErr.message);
  }

  /* Migration: expand type CHECK constraint to include 'interpretation' */
  try {
    await pool.query(`
      ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_type_check;
      ALTER TABLE announcements ADD CONSTRAINT announcements_type_check
        CHECK (type IN ('info', 'warning', 'update', 'event', 'interpretation'));
    `);
  } catch (migrateErr2) {
    console.error('Migration type_check:', migrateErr2.message);
  }

  tableEnsured = true;
}

export async function fetchAnnouncements({ activeOnly = true } = {}) {
  try {
    await ensureTable();
    const pool = getDbPool();
    const where = activeOnly ? 'WHERE is_active = true' : '';
    const result = await pool.query(
      `SELECT * FROM announcements ${where} ORDER BY sort_order ASC, created_at DESC`
    );
    return { announcements: result.rows, dbError: null };
  } catch (dbErr) {
    console.error('DB fetch announcements failed:', dbErr);
    return { announcements: [], dbError: dbErr.message };
  }
}

export async function fetchAnnouncementById(id) {
  await ensureTable();
  const pool = getDbPool();
  const result = await pool.query('SELECT * FROM announcements WHERE id = $1', [id]);
  return result.rows[0] || null;
}

// Re-export for API routes
export { ensureTable };
