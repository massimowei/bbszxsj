import { NextResponse } from 'next/server';
import { getDbPool } from '../../../../lib/db.js';
import { ensureGameEventsTable } from '../../../../lib/events.js';
import { checkAuth } from '../../../admin/actions.js';

export async function GET(request, { params }) {
  await ensureGameEventsTable();
  const { id } = await params;
  try {
    const pool = getDbPool();
    const result = await pool.query('SELECT * FROM game_events WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  await ensureGameEventsTable();

  const { id } = await params;
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

    const existingRes = await pool.query('SELECT * FROM game_events WHERE id = $1', [id]);
    const existing = existingRes.rows[0];
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const merged = {
      title: title ?? existing.title,
      description: description ?? existing.description,
      category: category ?? existing.category,
      reset_type: reset_type ?? existing.reset_type,
      reset_day: reset_day ?? existing.reset_day,
      start_date: start_date === undefined ? existing.start_date : start_date,
      end_date: end_date === undefined ? existing.end_date : end_date,
      reward: reward ?? existing.reward,
      difficulty: difficulty ?? existing.difficulty,
      cover_image: cover_image === undefined ? existing.cover_image : cover_image,
      is_active: is_active === undefined ? existing.is_active : is_active,
      sort_order: sort_order ?? existing.sort_order,
      version: version ?? existing.version,
    };

    const result = await pool.query(
      `UPDATE game_events SET
         title = $1,
         description = $2,
         category = $3,
         reset_type = $4,
         reset_day = $5,
         start_date = $6,
         end_date = $7,
         reward = $8,
         difficulty = $9,
         cover_image = $10,
         is_active = $11,
         sort_order = $12,
         version = $13,
         updated_at = now()
       WHERE id = $14
       RETURNING *`,
      [
        merged.title,
        merged.description,
        merged.category,
        merged.reset_type,
        merged.reset_day,
        merged.start_date,
        merged.end_date,
        merged.reward,
        merged.difficulty,
        merged.cover_image,
        merged.is_active,
        merged.sort_order,
        merged.version,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  await ensureGameEventsTable();

  const { id } = await params;
  try {
    const pool = getDbPool();
    const result = await pool.query('DELETE FROM game_events WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
