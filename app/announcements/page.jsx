import Link from 'next/link';
import '../page.css';
import './page.css';

export const dynamic = 'force-dynamic';
import Layout from '../components/Layout';
import { fetchAnnouncements } from '../../lib/announcements.js';
import { IconScroll } from '../components/Icons';

const TYPE_META = {
  info: { label: '通知', color: '#5f7f67' },
  warning: { label: '提醒', color: '#c04a1a' },
  update: { label: '更新', color: '#4a7fb5' },
  event: { label: '活动', color: '#d4883a' },
  interpretation: { label: '解读', color: '#8b6914' },
};

export default async function AnnouncementsPage() {
  const { announcements } = await fetchAnnouncements({ activeOnly: true });

  return (
    <Layout>
      <main className="main-content">
        <section className="announcements-page-intro">
          <Link href="/" className="back-link">← 返回首页</Link>
          <h1 className="announcements-page-title">公告 & 解读</h1>
          <p className="announcements-page-subtitle">
            官方公告解读、版本更新通知——一站掌握诛仙世界最新动态。
          </p>
        </section>

        {announcements.length > 0 ? (
          <div className="announcements-full-grid">
            {announcements.map((item) => {
              const meta = TYPE_META[item.type] || TYPE_META.info;
              return (
                <Link
                  key={item.id}
                  href={`/announcements/${item.id}`}
                  className="announcement-full-card"
                >
                  {item.cover_image ? (
                    <div className="announcement-full-cover">
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="announcement-full-cover announcement-full-cover-empty">
                      <IconScroll color="#e6e2da" size={28} />
                    </div>
                  )}
                  <div className="announcement-full-body">
                    <span className="announcement-full-tag" style={{ color: meta.color, borderColor: meta.color }}>
                      {meta.label}
                    </span>
                    <h3 className="announcement-full-title">{item.title}</h3>
                    {item.content ? (
                      <p className="announcement-full-excerpt">{item.content}</p>
                    ) : null}
                    <span className="announcement-full-date">
                      {new Date(item.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon"><IconScroll size={32} color="#ccc" /></span>
            <p className="empty-state-text">暂无公告内容。</p>
          </div>
        )}
      </main>
    </Layout>
  );
}
