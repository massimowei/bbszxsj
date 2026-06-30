import Link from 'next/link';
import Image from 'next/image';
import '../../page.css';
import Layout from '../../components/Layout';
import { fetchGuideById } from '../../../lib/guides.js';
import MarkdownRenderer from './MarkdownRenderer';
import FavoriteButton from './FavoriteButton';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { guide } = await fetchGuideById(id, true);

  if (!guide) return { title: '攻略未找到' };

  const title = guide.title ? `${guide.title}｜诛仙世界攻略小站` : '诛仙世界攻略小站';
  const description = guide.excerpt || '诛仙世界攻略小站，持续更新的副本与职业指南。';
  const image = guide.banner_image || guide.cover_image || null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function GuideDetailPage({ params }) {
  const { id } = await params;
  const { guide } = await fetchGuideById(id, true);

  if (!guide) {
    return (
      <Layout>
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2>攻略未找到</h2>
          <Link href="/guides">返回列表</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="main-content" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <Link href="/guides" style={{ color: '#999', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>
          ← 返回列表
        </Link>

        {guide.banner_image ? (
          <div style={{ marginBottom: '28px', position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
            <Image
              src={guide.banner_image}
              alt={guide.title}
              fill
              sizes="(max-width: 800px) 100vw, 800px"
              priority
              style={{ objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border)' }}
            />
          </div>
        ) : null}

        <h1 style={{ fontSize: '36px', marginBottom: '16px', color: 'var(--text)' }}>
          {guide.title} {guide.emoji}
        </h1>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', color: '#666', fontSize: '14px', marginBottom: '48px' }}>
          <span>分类：{guide.category}</span>
          <span>更新时间：{guide.date ? new Date(guide.date).toLocaleDateString() : '未知'}</span>
          <FavoriteButton guideId={guide.id} />
        </div>

        <div style={{ padding: '32px 0' }}>
          <MarkdownRenderer content={guide.content} />
        </div>
      </main>
    </Layout>
  );
}
