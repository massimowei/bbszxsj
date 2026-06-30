import { NextResponse } from 'next/server';
import { fetchAnnouncements, ensureTable } from '../../../lib/announcements.js';
import { checkAuth } from '../../admin/actions.js';
import { getDbPool } from '../../../lib/db.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') !== 'false';
  const { announcements } = await fetchAnnouncements({ activeOnly });
  return NextResponse.json(announcements);
}

export async function POST(request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  await ensureTable();
  const pool = getDbPool();
  const body = await request.json();
  const { title, content, type, cover_image, is_active, sort_order } = body;
  if (!title) {
    return NextResponse.json({ error: '标题必填' }, { status: 400 });
  }
  const result = await pool.query(
    `INSERT INTO announcements (title, content, type, cover_image, is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [title, content || '', type || 'info', cover_image || '', is_active !== false, sort_order || 0]
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
