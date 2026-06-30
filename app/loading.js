export default function Loading() {
  return (
    <div className="container">
      <nav className="navbar">
        <div className="navbar-brand">诛仙世界攻略站</div>
        <div className="nav-links">
          <span>首页</span>
          <span>攻略全集</span>
          <span>辅助工具</span>
        </div>
      </nav>
      <main className="main-content" style={{ textAlign: 'center', padding: '120px 0' }}>
        <div style={{ color: '#746b62', fontSize: '16px', letterSpacing: '0.1em' }}>加载中...</div>
      </main>
    </div>
  );
}
