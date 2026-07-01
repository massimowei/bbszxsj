import Link from 'next/link';
import { IconLogo } from './Icons';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <span className="navbar-logo"><IconLogo size={24} /></span>
        诛仙世界攻略站
      </Link>
      <div className="nav-links">
        <Link href="/">首页</Link>
        <Link href="/guides">攻略全集</Link>
        <Link href="/calendar">活动日历</Link>
        <Link href="/announcements">公告解读</Link>
        <Link href="/tools">辅助工具</Link>
      </div>
    </nav>
  );
}
