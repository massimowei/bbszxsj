import Link from 'next/link';
import Image from 'next/image';
import './page.css';
import Layout from './components/Layout';
import { fetchGuides } from '../lib/guides.js';
import { fetchAnnouncements } from '../lib/announcements.js';
import {
  IconScroll,
  IconCalendar,
  IconCompass,
  IconGather,
} from './components/Icons';

/* Announcement type markers — ink dot + label */
const TYPE_META = {
  info: { label: '通知', color: '#5f7f67' },
  warning: { label: '提醒', color: '#c04a1a' },
  update: { label: '更新', color: '#4a7fb5' },
  event: { label: '活动', color: '#d4883a' },
  interpretation: { label: '解读', color: '#8b6914' },
};

export default async function Home() {
  const { guides } = await fetchGuides({ limit: 3 });
  const recommendGuides = guides.filter((g) => g.recommend && g.status === 'published').slice(0, 3);
  const { announcements } = await fetchAnnouncements({ activeOnly: true });

  /* Split: regular announcements vs interpretations */
  const interpretations = announcements.filter((a) => a.type === 'interpretation').slice(0, 4);
  const regularAnnouncements = announcements.filter((a) => a.type !== 'interpretation').slice(0, 3);

  return (
    <Layout>
      <main className="main-content">
        {/* Hero */}
        <section className="hero-section">
          <h1 className="hero-title">诛仙世界攻略小站</h1>
          <p className="hero-subtitle">
            萌新回流的起点，S4 赛季持续更新。<br />
            副本攻略、职业指南、活动追踪——一站掌握。
          </p>
          <div className="hero-actions">
            <Link href="/guides" className="btn-primary">
              开始探索
            </Link>
            <a href="https://qm.qq.com/q/1GHdQ1xXik" target="_blank" rel="noopener noreferrer" className="btn-outline">
              加入回流群
            </a>
          </div>
        </section>

        {/* Quick Entry Cards */}
        <section className="quick-entry-section">
          <div className="quick-entry-grid">
            <Link href="/guides" className="quick-card">
              <div className="quick-card-icon"><IconScroll color="#2d2a26" /></div>
              <div className="quick-card-title">攻略大全</div>
              <div className="quick-card-desc">副本攻略、职业指南、配装整理</div>
            </Link>
            <Link href="/calendar" className="quick-card">
              <div className="quick-card-icon"><IconCalendar color="#2d2a26" /></div>
              <div className="quick-card-title">活动日历</div>
              <div className="quick-card-desc">日常/周常/限时活动追踪，标记完成</div>
            </Link>
            <Link href="/tools" className="quick-card">
              <div className="quick-card-icon"><IconCompass color="#2d2a26" /></div>
              <div className="quick-card-title">辅助工具</div>
              <div className="quick-card-desc">实用小工具，助力日常游戏</div>
            </Link>
            <a href="https://qm.qq.com/q/1GHdQ1xXik" target="_blank" rel="noopener noreferrer" className="quick-card">
              <div className="quick-card-icon"><IconGather color="#2d2a26" /></div>
              <div className="quick-card-title">回流群</div>
              <div className="quick-card-desc">萌新回流互帮互助，一起征战</div>
            </a>
          </div>
        </section>

        {/* ── Official Announcement Interpretation (always visible) ── */}
        <section className="interpretation-section">
          <h2 className="section-title">官方公告解读</h2>
          {interpretations.length > 0 ? (
            <div className="interpretation-grid">
              {interpretations.map((item) => (
                <div key={item.id} className="interpretation-card">
                  {item.cover_image ? (
                    <div className="interpretation-cover">
                      <Image
                        src={item.cover_image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 480px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className="interpretation-cover interpretation-cover-empty">
                      <IconScroll color="#e6e2da" size={36} />
                    </div>
                  )}
                  <div className="interpretation-body">
                    <span className="interpretation-tag" style={{ color: TYPE_META.interpretation.color }}>
                      {TYPE_META.interpretation.label}
                    </span>
                    <h3 className="interpretation-title">{item.title}</h3>
                    {item.content ? <p className="interpretation-excerpt">{item.content}</p> : null}
                    <span className="interpretation-date">{new Date(item.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon"><IconScroll size={32} color="#ccc" /></span>
              <p className="empty-state-text">暂无公告解读。管理员可在后台「公告管理」中添加解读内容。</p>
            </div>
          )}
        </section>

        {/* ── Announcements ── */}
        {regularAnnouncements.length > 0 ? (
          <section className="announcements-section">
            <h2 className="section-title">公告栏</h2>
            <div className="announcements-list">
              {regularAnnouncements.map((a) => {
                const meta = TYPE_META[a.type] || TYPE_META.info;
                return (
                  <div key={a.id} className="announcement-item" style={{ borderLeftColor: meta.color }}>
                    <span className="announcement-dot" style={{ background: meta.color }} />
                    <span className="announcement-type" style={{ color: meta.color }}>{meta.label}</span>
                    <span className="announcement-title">{a.title}</span>
                    {a.content ? <span className="announcement-content">{a.content}</span> : null}
                    <span className="announcement-date">{new Date(a.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* ── Hot Guides ── */}
        {recommendGuides.length > 0 ? (
          <section className="hot-guides-section">
            <h2 className="section-title">热门攻略</h2>
            <div className="hot-guides-grid">
              {recommendGuides.map((guide) => (
                <div className="hot-guide-card" key={guide.id}>
                  {guide.cover_image ? (
                    <div className="hot-guide-cover">
                      <Image
                        src={guide.cover_image}
                        alt={guide.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 330px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className="hot-guide-cover hot-guide-cover-empty">
                      <IconScroll color="#e6e2da" size={24} />
                    </div>
                  )}
                  <div className="hot-guide-info">
                    <span className="guide-tag">{guide.category}</span>
                    <h3 className="hot-guide-title">{guide.title}</h3>
                    <p className="hot-guide-excerpt">{guide.excerpt}</p>
                    <Link href={`/guides/${guide.id}`} className="guide-link">阅读详情 →</Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="hot-guides-more">
              <Link href="/guides">查看全部攻略 →</Link>
            </div>
          </section>
        ) : null}
      </main>
    </Layout>
  );
}
