import { getDbPool } from './db.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const FALLBACK_JSON_PATH = path.join(process.cwd(), '.old', 'src_old', 'content', 'guides', 'guides.json');

const GUIDES_ORDER_CLAUSE =
  'ORDER BY g.recommend DESC, c.sort_order ASC NULLS LAST, g.sort_order ASC NULLS LAST, g.updated_at DESC, g.id DESC';

/**
 * Fetch published guides from DB, with fallback to local JSON for preview.
 * @param {Object} options
 * @param {number} [options.limit] - Max number of guides to return
 * @param {boolean} [options.publishedOnly=true] - Only return published guides
 * @returns {Promise<{ guides: Array, dbError: string|null }>}
 */
export async function fetchGuides({ limit, publishedOnly = true } = {}) {
  const pool = getDbPool();
  try {
    const whereClause = publishedOnly ? "WHERE g.status = 'published'" : '';
    const limitClause = limit ? `LIMIT ${Number(limit)}` : '';
    const result = await pool.query(
      `SELECT g.*, c.sort_order AS category_sort_order
       FROM guides g
       LEFT JOIN categories c ON c.name = g.category
       ${whereClause}
       ${GUIDES_ORDER_CLAUSE}
       ${limitClause}`
    );
    return { guides: result.rows, dbError: null };
  } catch (error) {
    console.error('Database not available, falling back to local JSON:', error.message);
    try {
      const data = await fs.readFile(FALLBACK_JSON_PATH, 'utf8');
      let guides = JSON.parse(data);
      if (limit) guides = guides.slice(0, limit);
      return { guides, dbError: error.message };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return { guides: [], dbError: error.message };
    }
  }
}

/**
 * Fetch a single guide by ID from DB, with fallback to local JSON.
 * @param {string|number} id
 * @param {boolean} [publishedOnly=true]
 * @returns {Promise<{ guide: Object|null, dbError: string|null }>}
 */
export async function fetchGuideById(id, publishedOnly = true) {
  const pool = getDbPool();
  try {
    const whereClause = publishedOnly ? "AND status = 'published'" : '';
    const result = await pool.query(`SELECT * FROM guides WHERE id = $1 ${whereClause}`, [id]);
    return { guide: result.rows[0] || null, dbError: null };
  } catch (error) {
    console.error('Database not available, falling back to local JSON:', error.message);
    try {
      const data = await fs.readFile(FALLBACK_JSON_PATH, 'utf8');
      const guides = JSON.parse(data);
      const guide = guides.find((g) => String(g.id) === String(id));
      return { guide: guide || null, dbError: error.message };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return { guide: null, dbError: error.message };
    }
  }
}

/**
 * Ensure a category exists in the database. Creates it if it doesn't.
 * @param {import('pg').Pool} pool
 * @param {string} categoryName
 */
export async function ensureCategory(pool, categoryName) {
  const normalized = categoryName ? String(categoryName).trim() : '';
  if (!normalized) return;
  try {
    const found = await pool.query('SELECT id FROM categories WHERE name = $1', [normalized]);
    if (found.rows.length > 0) return;
    const nextOrderResult = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM categories'
    );
    const nextOrder = nextOrderResult.rows[0]?.next_order ?? 1;
    await pool.query(
      'INSERT INTO categories (name, sort_order, updated_at) VALUES ($1, $2, now())',
      [normalized, nextOrder]
    );
  } catch (error) {
    console.error('Failed to ensure category:', normalized, error);
  }
}
