export default function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      <label style={{ fontSize: '14px', color: 'var(--text)' }}>{label}</label>
      {children}
      {hint ? <div style={{ fontSize: '12px', color: '#7a7168', lineHeight: 1.7 }}>{hint}</div> : null}
    </div>
  );
}
