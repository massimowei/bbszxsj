import ActionButton from './ActionButton';

export default function ConfirmDialog({
  item,
  guide,
  title = '确定移除此篇攻略？',
  message,
  confirmLabel = '确认删除',
  onCancel,
  onConfirm,
  loading,
}) {
  const target = item || guide;
  if (!target) return null;

  const displayMessage =
    message || `《${target.title || '未命名'}》将从列表中删除，此操作无法撤回。`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(45, 42, 38, 0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fbfaf7',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 18px 40px -12px rgba(37, 31, 26, 0.18)',
        }}
      >
        <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#8a7d70', marginBottom: '10px' }}>
          删除确认
        </div>
        <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{title}</h3>
        <p style={{ margin: 0, color: '#6f665d', lineHeight: 1.8 }}>{displayMessage}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px', flexWrap: 'wrap' }}>
          <ActionButton variant="secondary" onClick={onCancel} disabled={loading}>
            取消
          </ActionButton>
          <ActionButton variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? '删除中...' : confirmLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
