export default function ActionButton({
  children,
  variant = 'secondary',
  type = 'button',
  onClick,
  disabled = false,
}) {
  const palette = {
    primary: {
      background: '#5f7f67',
      color: '#f9f8f4',
      border: '1px solid #5f7f67',
    },
    secondary: {
      background: '#f9f8f4',
      color: 'var(--text)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: '#fff7f5',
      color: '#9d3d21',
      border: '1px solid #efd7cf',
    },
    ghost: {
      background: 'transparent',
      color: '#746b62',
      border: '1px solid var(--border)',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...palette[variant],
        minHeight: '44px',
        padding: '0 18px',
        borderRadius: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        letterSpacing: '0.04em',
        fontFamily: 'inherit',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
