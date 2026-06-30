import { NextResponse } from 'next/server';
import { getDbPool } from '../../../../lib/db.js';
import { checkAuth } from '../../../admin/actions.js';

function normalizeName(value) {
  if (!value) return '';
  return String(value).trim();
}

export async function PUT(request, { params }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const { id } = await params;
  const categoryId = Number(id);

  if (!Number.isFinite(categoryId)) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const pool = getDbPool();

    const existingRes = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
    const existing = existingRes.rows[0];
    if (!existing) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    const nextName = body?.name === undefined ? existing.name : normalizeName(body?.name);
    const nextSortOrder =
      body?.sort_order === undefined || body?.sort_order === null ? existing.sort_order : Number(body?.sort_order);

    if (!nextName) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
    }
    if (!Number.isFinite(nextSortOrder)) {
      return NextResponse.json({ error: '排序值必须是数字' }, { status: 400 });
    }

    await pool.query('BEGIN');

    const result = await pool.query(
      'UPDATE categories SET name = $1, sort_order = $2, updated_at = now() WHERE id = $3 RETURNING *',
      [nextName, nextSortOrder, categoryId]
    );

    if (existing.name !== nextName) {
      await pool.query('UPDATE guides SET category = $1, updated_at = now() WHERE category = $2', [nextName, existing.name]);
    }

    await pool.query('COMMIT');

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update category:', error);
    if (error?.code === '23505') {
      return NextResponse.json({ error: '该分类已存在' }, { status: 409 });
    }
    try {
      const pool = getDbPool();
      await pool.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Failed to rollback:', rollbackError);
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const { id } = await params;
  const categoryId = Number(id);

  if (!Number.isFinite(categoryId)) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 });
  }

  try {
    const pool = getDbPool();
    const existingRes = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
    const existing = existingRes.rows[0];
    if (!existing) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    const usedRes = await pool.query('SELECT COUNT(*)::int AS count FROM guides WHERE category = $1', [existing.name]);
    if ((usedRes.rows[0]?.count ?? 0) > 0) {
      return NextResponse.json({ error: '该分类仍有攻略，请先迁移或合并后再删除。' }, { status: 400 });
    }

    await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
