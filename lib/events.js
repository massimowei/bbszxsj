import { getDbPool } from './db.js';

// Auto-create game_events table on first use (idempotent)
let tableEnsured = false;

export async function ensureGameEventsTable() {
  if (tableEnsured) return;
  const pool = getDbPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        category TEXT DEFAULT 'daily',
        reset_type TEXT DEFAULT 'daily' CHECK (reset_type IN ('daily', 'weekly', 'none')),
        reset_day INTEGER DEFAULT 1,
        start_date DATE,
        end_date DATE,
        reward TEXT DEFAULT '',
        difficulty TEXT DEFAULT '',
        cover_image TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        version TEXT DEFAULT 'current',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_game_events_active ON game_events(is_active);
      CREATE INDEX IF NOT EXISTS idx_game_events_category ON game_events(category);
      CREATE INDEX IF NOT EXISTS idx_game_events_sort_order ON game_events(sort_order);
      CREATE INDEX IF NOT EXISTS idx_game_events_version ON game_events(version);
      CREATE INDEX IF NOT EXISTS idx_game_events_dates ON game_events(start_date, end_date);
    `);
    tableEnsured = true;
    console.log('game_events table ensured (created or already exists)');
  } catch (error) {
    console.error('Failed to ensure game_events table:', error.message);
    // Don't mark as ensured so it retries on next request
  }
}

/**
 * Fetch game events from DB.
 * @param {Object} options
 * @param {boolean} [options.activeOnly=true] - Only return active events
 * @param {string} [options.version] - Filter by game version
 * @returns {Promise<{ events: Array, dbError: string|null }>}
 */
export async function fetchEvents({ activeOnly = true, version } = {}) {
  await ensureGameEventsTable();
  const pool = getDbPool();
  try {
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (activeOnly) {
      conditions.push('is_active = true');
    }
    if (version) {
      conditions.push(`version = $${paramIdx++}`);
      params.push(version);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT * FROM game_events ${whereClause} ORDER BY sort_order ASC NULLS LAST, id ASC`,
      params
    );
    return { events: result.rows, dbError: null };
  } catch (error) {
    console.error('Database not available for events:', error.message);
    return { events: [], dbError: error.message };
  }
}

/**
 * Fetch a single event by ID.
 * @param {string|number} id
 * @returns {Promise<{ event: Object|null, dbError: string|null }>}
 */
export async function fetchEventById(id) {
  await ensureGameEventsTable();
  const pool = getDbPool();
  try {
    const result = await pool.query('SELECT * FROM game_events WHERE id = $1', [id]);
    return { event: result.rows[0] || null, dbError: null };
  } catch (error) {
    console.error('Database not available for event:', error.message);
    return { event: null, dbError: error.message };
  }
}
