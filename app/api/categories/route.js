import { NextResponse } from 'next/server';
import { getDbPool } from '../../../lib/db.js';
import { checkAuth } from '../../admin/actions.js';

function normalizeName(value) {
  if (!value) return '';
  return String(value).trim();
}

export async function GET() {
  try {
    const pool = getDbPool();
    const result = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC, id ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body?.action === 'merge') {
      const fromId = Number(body.fromId);
      const toId = Number(body.toId);
      if (!Number.isFinite(fromId) || !Number.isFinite(toId) || fromId === toId) {
        return NextResponse.json({ error: '参数错误' }, { status: 400 });
      }

      const pool = getDbPool();
      await pool.query('BEGIN');
      const fromRes = await pool.query('SELECT * FROM categories WHERE id = $1', [fromId]);
      const toRes = await pool.query('SELECT * FROM categories WHERE id = $1', [toId]);

      const fromCategory = fromRes.rows[0];
      const toCategory = toRes.rows[0];

      if (!fromCategory || !toCategory) {
        await pool.query('ROLLBACK');
        return NextResponse.json({ error: '分类不存在' }, { status: 404 });
      }

      await pool.query('UPDATE guides SET category = $1, updated_at = now() WHERE category = $2', [
        toCategory.name,
        fromCategory.name,
      ]);
      await pool.query('DELETE FROM categories WHERE id = $1', [fromId]);
      await pool.query('COMMIT');

      return NextResponse.json({ success: true });
    }

    const name = normalizeName(body?.name);
    if (!name) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
    }

    const pool = getDbPool();
    const maxOrderResult = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM categories');
    const nextOrder = maxOrderResult.rows[0]?.next_order ?? 1;

    const result = await pool.query(
      'INSERT INTO categories (name, sort_order, updated_at) VALUES ($1, $2, now()) RETURNING *',
      [name, nextOrder]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    if (error?.code === '23505') {
      return NextResponse.json({ error: '该分类已存在' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
