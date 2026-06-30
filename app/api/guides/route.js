import { NextResponse } from 'next/server';
import { getDbPool } from '../../../lib/db.js';
import { ensureCategory } from '../../../lib/guides.js';
import { checkAuth } from '../../admin/actions.js';

export async function GET(request) {
  try {
    const pool = getDbPool();
    const result = await pool.query(
      `SELECT g.*, c.sort_order AS category_sort_order
       FROM guides g
       LEFT JOIN categories c ON c.name = g.category
       ORDER BY g.recommend DESC, c.sort_order ASC NULLS LAST, g.sort_order ASC NULLS LAST, g.updated_at DESC, g.id DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch guides from db:', error);

    if (error.code === '42P01') {
      return NextResponse.json([]);
    }

    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, game, category, emoji, date, excerpt, recommend, content, sort_order, status, cover_image, banner_image } =
      body;

    const pool = getDbPool();
    await ensureCategory(pool, category);
    const nextSortOrderResult = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM guides');
    const nextSortOrder = nextSortOrderResult.rows[0]?.next_order ?? 1;
    const result = await pool.query(
      `INSERT INTO guides (title, game, category, emoji, date, excerpt, recommend, content, sort_order, status, cover_image, banner_image, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())
       RETURNING *`,
      [
        title,
        game || '诛仙世界',
        category,
        emoji || '',
        date || new Date().toISOString().slice(0, 10),
        excerpt || '',
        Boolean(recommend),
        content,
        Number.isInteger(sort_order) ? sort_order : nextSortOrder,
        status === 'published' ? 'published' : 'draft',
        cover_image || null,
        banner_image || null,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create guide:', error);
    return NextResponse.json({ error: 'Failed to create guide' }, { status: 500 });
  }
}
