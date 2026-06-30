import '../page.css';
import Layout from '../components/Layout';

export const dynamic = 'force-dynamic';
import { fetchGuides } from '../../lib/guides.js';
import GuideSearchAndFavorites from './GuideSearchAndFavorites';

export default async function GuidesPage() {
  const { guides, dbError } = await fetchGuides({});

  return (
    <Layout>
      <main className="main-content">
        <section className="guides-section">
          <h1 className="hero-title" style={{ textAlign: 'left', marginBottom: '16px' }}>攻略全集</h1>
          <p style={{ marginBottom: '48px', color: '#666' }}>
            {dbError ? '⚠️ 提示：数据库暂未连接，当前展示为本地预览数据。' : '为您整理的全职业与副本指南。搜索、收藏，随时回看。'}
          </p>
          <GuideSearchAndFavorites guides={guides} />
        </section>
      </main>
    </Layout>
  );
}
