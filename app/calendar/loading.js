export default function Loading() {
  return (
    <div style={{ padding: '24px 0 60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', color: '#8a7d70', marginBottom: '12px' }}>活动日历</div>
        <div style={{ height: '38px', width: '280px', borderRadius: '8px', background: '#e6e2da', marginBottom: '12px' }} />
        <div style={{ height: '20px', width: '400px', borderRadius: '4px', background: '#e6e2da' }} />
      </div>
      <div style={{ height: '80px', borderRadius: '16px', background: '#e6e2da', marginBottom: '24px' }} />
      <div style={{ height: '80px', borderRadius: '16px', background: '#e6e2da', marginBottom: '28px' }} />
      <div style={{ display: 'grid', gap: '32px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div style={{ height: '24px', width: '160px', borderRadius: '4px', background: '#e6e2da', marginBottom: '16px' }} />
            <div style={{ display: 'grid', gap: '12px' }}>
              {[0, 1, 2].map((j) => (
                <div key={j} style={{ height: '72px', borderRadius: '14px', background: '#e6e2da' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
