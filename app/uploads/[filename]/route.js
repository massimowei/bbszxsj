import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/* Map common extensions to MIME */
const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

export async function GET(_request, { params }) {
  const { filename } = await params;

  /* Simple path-traversal guard */
  if (filename.includes('..') || filename.includes('/')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    const buffer = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mime = MIME_MAP[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
