import { NextResponse } from 'next/server';
import { checkAuth } from '../../../admin/actions.js';
import { fetchAnnouncementById, ensureTable } from '../../../../lib/announcements.js';
import { getDbPool } from '../../../../lib/db.js';

export async function GET(request, { params }) {
  const { id } = await params;
  await ensureTable();
  const announcement = await fetchAnnouncementById(Number(id));
  if (!announcement) {
    return NextResponse.json({ error: '公告不存在' }, { status: 404 });
  }
  return NextResponse.json(announcement);
}

export async function PUT(request, { params }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const { id } = await params;
  await ensureTable();
  const pool = getDbPool();
  const existing = await fetchAnnouncementById(Number(id));
  if (!existing) {
    return NextResponse.json({ error: '公告不存在' }, { status: 404 });
  }
  const body = await request.json();
  const merged = {
    title: body.title ?? existing.title,
    content: body.content ?? existing.content,
    type: body.type ?? existing.type,
    cover_image: body.cover_image ?? existing.cover_image,
    is_active: body.is_active ?? existing.is_active,
    sort_order: body.sort_order ?? existing.sort_order,
  };
  const result = await pool.query(
    `UPDATE announcements SET title = $1, content = $2, type = $3, cover_image = $4, is_active = $5, sort_order = $6, updated_at = now()
     WHERE id = $7 RETURNING *`,
    [merged.title, merged.content, merged.type, merged.cover_image, merged.is_active, merged.sort_order, Number(id)]
  );
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(request, { params }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const { id } = await params;
  await ensureTable();
  const pool = getDbPool();
  await pool.query('DELETE FROM announcements WHERE id = $1', [Number(id)]);
  return NextResponse.json({ success: true });
}
