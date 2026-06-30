'use client';

export default function Error({ error, reset }) {
  return (
    <div className="container">
      <main className="main-content" style={{ textAlign: 'center', padding: '120px 0' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>页面加载出错</h2>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          {error?.message || '发生未知错误，请稍后重试。'}
        </p>
        <button
          onClick={reset}
          style={{
            display: 'inline-block',
            background: 'var(--text)',
            color: 'var(--bg)',
            padding: '12px 32px',
            fontSize: '15px',
            letterSpacing: '0.1em',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          重新加载
        </button>
      </main>
    </div>
  );
}
