/**
 * 统一 SVG 墨线图标库 — 东方极简风格
 * 特征：stroke 1.6px, round caps, 使用 CSS 变量颜色
 * 用法：import { IconSearch, IconScroll, ... } from '../components/Icons';
 */

import React from 'react';

const svgProps = (size = 20, color = 'currentColor') => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: '1.6',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

/* ── 导航 / 通用 ── */

export function IconLogo({ size = 28, color = '#2d2a26' }) {
  return (
    <svg {...svgProps(size, color)} viewBox="0 0 32 32">
      {/* 印章式方块 + "Z" 笔画 */}
      <rect x="3" y="3" width="26" height="26" rx="4" />
      <path d="M9 10 L23 10 L9 22 L23 22" strokeWidth="2.2" />
      {/* 左上角墨点装饰 */}
      <circle cx="8" cy="8" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

export function IconSearch({ size = 20, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <circle cx="10" cy="10" r="7" />
      <line x1="15" y1="15" x2="21" y2="21" strokeWidth="2" />
    </svg>
  );
}

export function IconHome({ size = 20, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <path d="M3 12 L12 3 L21 12" />
      <path d="M5 11 V20 A1 1 0 0 0 6 21 H18 A1 1 0 0 0 19 20 V11" />
      <line x1="9" y1="21" x2="9" y2="14" />
      <line x1="15" y1="21" x2="15" y2="14" />
    </svg>
  );
}

/* ── 快速入口卡片 ── */

export function IconScroll({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="18" height="22" rx="2" />
      <line x1="10" y1="9" x2="18" y2="9" />
      <line x1="10" y1="13" x2="16" y2="13" />
      <line x1="10" y1="17" x2="14" y2="17" />
      <path d="M5 6 C3 6, 2 7, 2 8.5 C2 10, 3 11, 5 11" />
      <path d="M5 17 C3 17, 2 18, 2 19.5 C2 21, 3 22, 5 22" />
    </svg>
  );
}

export function IconCalendar({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="22" height="20" rx="2" />
      <line x1="3" y1="11" x2="25" y2="11" />
      <line x1="9" y1="3" x2="9" y2="7" />
      <line x1="19" y1="3" x2="19" y2="7" />
      <circle cx="9" cy="16" r="1.5" fill={color} stroke="none" />
      <circle cx="14" cy="16" r="1.5" fill={color} stroke="none" />
      <circle cx="19" cy="16" r="1.5" fill={color} stroke="none" />
      <circle cx="9" cy="21" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

export function IconCompass({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="14" r="11" />
      <path d="M14 3 L14 7" />
      <path d="M14 21 L14 25" />
      <path d="M3 14 L7 14" />
      <path d="M21 14 L25 14" />
      <path d="M11 11 L17 17" strokeWidth="2" />
      <circle cx="14" cy="14" r="2" fill={color} stroke="none" />
    </svg>
  );
}

export function IconGather({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="4" />
      <circle cx="18" cy="10" r="4" />
      <path d="M4 22 C4 18, 7 16, 10 16 C13 16, 14 17, 14 17 C14 17, 15 16, 18 16 C21 16, 24 18, 24 22" />
    </svg>
  );
}

/* ── 游戏相关图标（用于攻略标记符号选择器）── */

export function IconSword({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <path d="M14.5 17.5L20 23 M20 23l2 -2 M20 23l-2 2" strokeWidth="2"/>
      <polyline points="6 13, 12 7, 16 11, 10 17" />
      <line x1="4" y1="15" x2="8" y2="11" />
      <line x1="14" y1="5" x2="18" y2="9" />
    </svg>
  );
}

export function IconShield({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <path d="M12 3L4 7v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V7l-8-4z" />
      <polyline points="9 12 11 14 15 10" strokeWidth="2" />
    </svg>
  );
}

export function IconWand({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <path d="M15 4l4 4-12 12-4 1 1-4z" strokeWidth="1.8"/>
      <path d="M18 7l3 3" />
      <circle cx="5" cy="19" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

export function IconFlame({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <path d="M12 2c0 4-3 6-3 10a5 5 0 0010 0c0-4-3-6-3-10 0 3 3 5 3 9a6 6 0 01-12 0c0-4 3-6 5-9z" />
      <path d="M12 22v-4" strokeWidth="1.2"/>
    </svg>
  );
}

export function IconDungeon({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <path d="M4 20V10l8-6 8 6v10H4z" />
      <rect x="9" y="14" width="6" height="6" rx="1" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <circle cx="12" cy="7" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

export function IconBoss({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
      <path d="M2 12h3M19 12h3" strokeWidth="1.4"/>
      <path d="M7 5l2-2M15 3l2 2" strokeWidth="1.4"/>
    </svg>
  );
}

export function IconCoin({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v12" strokeWidth="1.4"/>
      <text x="12" y="16" textAnchor="middle" fontSize="9" fill={color} stroke="none" fontWeight="600">文</text>
    </svg>
  );
}

export function IconStar({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function IconHeart({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <path d="M12 21C12 21 3 13.5 3 8.5A4.5 4.5 0 0 1 7.5 4c1.5 0 2.9.7 3.9 1.8C12.1 4.7 13.5 4 15 4A4.5 4.5 0 0 1 19.5 8.5c0 5-9 12.5-9 12.5z" />
    </svg>
  );
}

export function IconClock({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" strokeWidth="1.8" />
    </svg>
  );
}

export function IconBook({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="10" y1="8" x2="16" y2="8" strokeWidth="1.2"/>
      <line x1="10" y1="12" x2="14" y2="12" strokeWidth="1.2"/>
    </svg>
  );
}

export function IconTarget({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill={color} stroke="none" />
    </svg>
  );
}

export function IconBolt({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function IconLeaf({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <path d="M11 20A7 7 0 0 1 9.8 6.2C12.6 3.4 18 2 20 4c-2 0-6 2-7.5 5A7 7 0 0 1 11 20z" />
      <path d="M4 22c2-3 4-5.5 7-7.5" strokeWidth="1.4"/>
    </svg>
  );
}

export function IconGem({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <polygon points="12 2 22 8.5 12 22 2 8.5" />
      <polyline points="2 8.5 12 14 22 8.5" strokeWidth="1.2"/>
      <line x1="12" y1="14" x2="12" y2="22" strokeWidth="1.2"/>
    </svg>
  );
}

export function IconMapPin({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
      <circle cx="12" cy="9" r="2.5" fill={color} stroke="none" />
    </svg>
  );
}

export function IconFlag({ size = 24, color = 'currentColor' }) {
  return (
    <svg {...svgProps(size, color)}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

/* ── 图标选择器用完整注册表 ── */
export const GUIDE_ICONS = [
  { id: '', label: '无', component: null },
  { id: '⚔️', label: '战斗', component: IconSword },
  { id: '🛡️', label: '防御', component: IconShield },
  { id: '🪄', label: '法术', component: IconWand },
  { id: '🔥', label: '火焰', component: IconFlame },
  { id: '🏰', label: '副本', component: IconDungeon },
  { id: '👹', label: '首领', component: IconBoss },
  { id: '💰', label: '金钱', component: IconCoin },
  { id: '⭐', label: '推荐', component: IconStar },
  { id: '❤️', label: '生存', component: IconHeart },
  { id: '⏰', label: '日常', component: IconClock },
  { id: '📖', label: '指南', component: IconBook },
  { id: '🎯', label: '目标', component: IconTarget },
  { id: '⚡', label: '爆发', component: IconBolt },
  { id: '🌿', label: '自然', component: IconLeaf },
  { id: '💎', label: '稀有', component: IconGem },
  { id: '📍', label: '位置', component: IconMapPin },
  { id: '🚩', label: '任务', component: IconFlag },
];
