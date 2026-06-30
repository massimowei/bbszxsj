import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} 诛仙世界攻略小站 · 东方极简版设计
        <Link href="/admin" style={{ marginLeft: '12px', fontSize: '12px', color: '#999', textDecoration: 'none' }}>后台管理</Link>
      </p>
      <p style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>免责声明：本站所有与诛仙世界相关的内容，均为完美世界公司版权所有。本站旨在作为粉丝网站，不隶属于游戏公司或受其认可。</p>
    </footer>
  );
}
