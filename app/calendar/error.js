'use client';

import Layout from '../components/Layout';

export default function Error({ reset }) {
  return (
    <Layout>
      <main className="main-content" style={{ padding: '24px 0 60px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', color: '#8a7d70', marginBottom: '12px' }}>活动日历</div>
        <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>加载失败</h1>
        <p style={{ color: '#6f665d', marginBottom: '24px' }}>
          活动数据加载时出错，请稍后重试。
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            minHeight: '44px',
            padding: '0 24px',
            borderRadius: '10px',
            border: '1px solid #5f7f67',
            background: '#5f7f67',
            color: '#f9f8f4',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          重新加载
        </button>
      </main>
    </Layout>
  );
}
