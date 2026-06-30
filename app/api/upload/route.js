import { NextResponse } from 'next/server';
import { checkAuth } from '../../admin/actions.js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/* Compression targets — web-friendly defaults */
const MAX_WIDTH = 1920;           // covers 1080p / retina 960px viewport
const WEBP_QUALITY = 78;          // sweet spot: < 100 KB for most screenshots
const MIN_QUALITY = 58;           // fallback if still oversized

export async function POST(request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `不支持的文件类型：${file.type}，仅支持 JPG/PNG/GIF/WebP` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB），上限 5MB` },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const hash = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    const filename = `${timestamp}-${hash}.webp`;
    const meta = await sharp(inputBuffer).metadata();

    /* ── Compress via sharp ── */
    let pipeline = sharp(inputBuffer, { animated: meta.format === 'gif' });

    // Resize only if wider than target
    if (meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    // First pass at quality 78
    let outputBuffer = await pipeline
      .webp({ quality: WEBP_QUALITY, effort: 5 })
      .withMetadata({ exif: {} })                     // strip sensitive EXIF
      .toBuffer();

    // If still > 100 KB, re-compress harder
    if (outputBuffer.length > 100 * 1024) {
      outputBuffer = await sharp(inputBuffer)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: MIN_QUALITY, effort: 6 })
        .withMetadata({ exif: {} })
        .toBuffer();
    }

    await writeFile(path.join(UPLOAD_DIR, filename), outputBuffer);

    const originalKB = (file.size / 1024).toFixed(0);
    const resultKB = (outputBuffer.length / 1024).toFixed(0);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      size: outputBuffer.length,
      compressed: {
        originalKB: Number(originalKB),
        resultKB: Number(resultKB),
        format: 'webp',
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败，请重试' }, { status: 500 });
  }
}
