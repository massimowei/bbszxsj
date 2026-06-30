export default function StatusNote({ note }) {
  if (!note) return null;

  const tone =
    note.type === 'error'
      ? { background: '#fff5f2', border: '#f0d8cf', color: '#9d3d21' }
      : { background: '#f4f0ea', border: 'var(--border)', color: '#5d554d' };

  return (
    <div
      style={{
        background: tone.background,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        borderRadius: '10px',
        padding: '12px 16px',
        fontSize: '13px',
        lineHeight: 1.7,
        marginBottom: '24px',
      }}
    >
      {note.text}
    </div>
  );
}
