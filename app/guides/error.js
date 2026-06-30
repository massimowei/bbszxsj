'use client';

import Link from 'next/link';

export default function Error({ error, reset }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>攻略列表加载出错</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        {error?.message || '发生未知错误，请稍后重试。'}
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            background: 'var(--text)',
            color: 'var(--bg)',
            padding: '10px 24px',
            fontSize: '14px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          重试
        </button>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            border: '1px solid var(--border)',
            padding: '10px 24px',
            fontSize: '14px',
            borderRadius: '4px',
            color: 'var(--text)',
          }}
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
