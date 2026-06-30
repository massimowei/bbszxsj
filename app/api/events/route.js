import { NextResponse } from 'next/server';
import { fetchEvents, ensureGameEventsTable } from '../../../lib/events.js';
import { getDbPool } from '../../../lib/db.js';
import { checkAuth } from '../../admin/actions.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version') || undefined;
  const activeOnly = searchParams.get('all') !== 'true';

  const { events, dbError } = await fetchEvents({ activeOnly, version });

  if (dbError) {
    return NextResponse.json([]);
  }

  return NextResponse.json(events);
}

export async function POST(request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  await ensureGameEventsTable();

  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      reset_type,
      reset_day,
      start_date,
      end_date,
      reward,
      difficulty,
      cover_image,
      is_active,
      sort_order,
      version,
    } = body;

    const pool = getDbPool();
    const nextSortOrderResult = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM game_events'
    );
    const nextSortOrder = nextSortOrderResult.rows[0]?.next_order ?? 1;

    const result = await pool.query(
      `INSERT INTO game_events (title, description, category, reset_type, reset_day, start_date, end_date, reward, difficulty, cover_image, is_active, sort_order, version, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())
       RETURNING *`,
      [
        title,
        description || '',
        category || 'daily',
        ['daily', 'weekly', 'none'].includes(reset_type) ? reset_type : 'daily',
        Number.isInteger(reset_day) ? reset_day : 1,
        start_date || null,
        end_date || null,
        reward || '',
        difficulty || '',
        cover_image || null,
        is_active !== false,
        Number.isInteger(sort_order) ? sort_order : nextSortOrder,
        version || 'current',
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event', detail: error.message }, { status: 500 });
  }
}
