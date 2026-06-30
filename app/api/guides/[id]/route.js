import { NextResponse } from 'next/server';
import { getDbPool } from '../../../../lib/db.js';
import { ensureCategory } from '../../../../lib/guides.js';
import { checkAuth } from '../../../admin/actions.js';

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const pool = getDbPool();
    const result = await pool.query('SELECT * FROM guides WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch guide:', error);
    return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { title, game, category, emoji, date, excerpt, recommend, content, sort_order, status, cover_image, banner_image } =
      body;

    const pool = getDbPool();

    // Fetch existing guide to merge with updates (fixes COALESCE issue)
    const existingRes = await pool.query('SELECT * FROM guides WHERE id = $1', [id]);
    const existing = existingRes.rows[0];
    if (!existing) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    await ensureCategory(pool, category ?? existing.category);

    const mergedTitle = title ?? existing.title;
    const mergedGame = game ?? existing.game;
    const mergedCategory = category ?? existing.category;
    const mergedEmoji = emoji ?? existing.emoji;
    const mergedDate = date ?? existing.date;
    const mergedExcerpt = excerpt ?? existing.excerpt;
    const mergedRecommend = recommend ?? existing.recommend;
    const mergedContent = content ?? existing.content;
    const mergedSortOrder = sort_order ?? existing.sort_order;
    const mergedStatus = status === undefined ? existing.status : (status === 'published' ? 'published' : 'draft');
    const mergedCoverImage = cover_image === undefined ? existing.cover_image : cover_image;
    const mergedBannerImage = banner_image === undefined ? existing.banner_image : banner_image;

    const result = await pool.query(
      `UPDATE guides SET
         title = $1,
         game = $2,
         category = $3,
         emoji = $4,
         date = $5,
         excerpt = $6,
         recommend = $7,
         content = $8,
         sort_order = $9,
         status = $10,
         cover_image = $11,
         banner_image = $12,
         updated_at = now()
       WHERE id = $13
       RETURNING *`,
      [
        mergedTitle,
        mergedGame,
        mergedCategory,
        mergedEmoji,
        mergedDate,
        mergedExcerpt,
        mergedRecommend,
        mergedContent,
        mergedSortOrder,
        mergedStatus,
        mergedCoverImage,
        mergedBannerImage,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update guide:', error);
    return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const pool = getDbPool();
    const result = await pool.query('DELETE FROM guides WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Guide deleted successfully' });
  } catch (error) {
    console.error('Failed to delete guide:', error);
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 });
  }
}
