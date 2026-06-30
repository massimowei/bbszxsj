import Link from 'next/link';
import '../page.css';
import Layout from '../components/Layout';

export default function ToolsPage() {
  const tools = [
    {
      id: 'dps-simulator',
      name: '配装模拟',
      icon: '⚔️',
      desc: 'FYRAKK - 包含配装、生产手册、团本与秘境统计模拟等。',
      author: {
        text: '（QQ群：1037096179）',
      },
      disabled: false,
      externalLink: 'https://fyrakk.com/'
    },
    {
      id: 'gpu-performance',
      name: '显卡性能查询',
      icon: '🖥️',
      desc: '查询各型号显卡的性能排行与数据。',
      author: {
        text: '（超能网）',
        link: 'https://www.expreview.com/'
      },
      disabled: false,
      externalLink: 'https://gpu.exprank.com/'
    },
    {
      id: 'cpu-performance',
      name: 'CPU性能查询',
      icon: '⚙️',
      desc: '查询各型号CPU的性能排行与数据。',
      author: {
        text: '（超能网）',
        link: 'https://www.expreview.com/'
      },
      disabled: false,
      externalLink: 'https://cpu.exprank.com/'
    },
    {
      id: 'map-tool',
      name: '地图工具',
      icon: '🗺️',
      desc: '包含探索的各种内容',
      author: {
        text: '（B站 相思别离愁）',
        link: 'https://space.bilibili.com/332607940'
      },
      disabled: false,
      externalLink: 'https://zx.lcx.cab/'
    }
  ];

  return (
    <Layout>
      <main className="main-content" style={{ padding: '20px 0' }}>
        <section className="guides-section">
          <header style={{ marginBottom: '40px' }}>
            <h1 className="hero-title" style={{ textAlign: 'left', marginBottom: '12px', fontSize: '36px' }}>辅助工具</h1>
            <p style={{ color: '#666', fontSize: '15px', letterSpacing: '0.05em' }}>
              各路大神制作的超级实用工具网站友链。
            </p>
          </header>

          <div className="guides-grid">
            {tools.map(tool => {
              if (tool.externalLink) {
                return (
                  <a
                    key={tool.id}
                    href={tool.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="guide-card"
                    style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                  >
                    <span className="guide-tag">外部工具 ↗</span>
                    <h3 className="guide-title">{tool.icon} {tool.name}</h3>
                    <p className="guide-excerpt">{tool.desc}</p>
                    {tool.author && (
                      <span style={{ fontSize: '12px', color: '#999' }}>{tool.author.text}</span>
                    )}
                  </a>
                );
              }

              return (
                <Link key={tool.id} href={`/tools/${tool.id}`} className="guide-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <span className="guide-tag">本地工具</span>
                  <h3 className="guide-title">{tool.icon} {tool.name}</h3>
                  <p className="guide-excerpt">{tool.desc}</p>
                  <span className="guide-link">立即使用 →</span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </Layout>
  );
}
