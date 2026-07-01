import Link from 'next/link';
import '../../page.css';
import '../page.css';

export const dynamic = 'force-dynamic';
import Layout from '../../components/Layout';
import { fetchAnnouncementById } from '../../../lib/announcements.js';
import MarkdownRenderer from '../../guides/[id]/MarkdownRenderer';

const TYPE_META = {
  info: { label: '通知', color: '#5f7f67' },
  warning: { label: '提醒', color: '#c04a1a' },
  update: { label: '更新', color: '#4a7fb5' },
  event: { label: '活动', color: '#d4883a' },
  interpretation: { label: '解读', color: '#8b6914' },
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await fetchAnnouncementById(id);

  if (!item) return { title: '公告未找到' };

  const meta = TYPE_META[item.type] || TYPE_META.info;
  const title = `${item.title}｜${meta.label}｜诛仙世界攻略小站`;
  const description = item.content ? item.content.replace(/<[^>]*>/g, '').slice(0, 120) : meta.label;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: item.cover_image ? [{ url: item.cover_image }] : [],
    },
    twitter: {
      card: item.cover_image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: item.cover_image ? [item.cover_image] : [],
    },
  };
}

export default async function AnnouncementDetailPage({ params }) {
  const { id } = await params;
  const item = await fetchAnnouncementById(id);

  if (!item) {
    return (
      <Layout>
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2>公告未找到</h2>
          <Link href="/announcements">返回列表</Link>
        </div>
      </Layout>
    );
  }

  const meta = TYPE_META[item.type] || TYPE_META.info;

  return (
    <Layout>
      <main className="main-content" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <Link href="/announcements" className="back-link" style={{ marginBottom: '24px', display: 'inline-block' }}>
          ← 返回公告列表
        </Link>

        {item.cover_image ? (
          <div className="announcement-detail-cover">
            <img
              src={item.cover_image}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : null}

        <span className="announcement-detail-tag" style={{ color: meta.color, borderColor: meta.color }}>
          {meta.label}
        </span>
        <h1 className="announcement-detail-title">{item.title}</h1>
        <div className="announcement-detail-meta">
          {new Date(item.created_at).toLocaleDateString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </div>

        {item.content ? (
          <div className="announcement-detail-content">
            <MarkdownRenderer content={item.content} />
          </div>
        ) : (
          <div className="announcement-detail-empty">
            暂无详细内容。
          </div>
        )}
      </main>
    </Layout>
  );
}
