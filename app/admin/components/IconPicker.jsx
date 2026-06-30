'use client';

import React, { useState } from 'react';
import { GUIDE_ICONS } from '../../components/Icons';

export default function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const selectedIcon = GUIDE_ICONS.find((icon) => icon.id === value);
  const SelectedComponent = selectedIcon?.component;

  return (
    <div style={{ position: 'relative' }}>
      {/* Current selection display + toggle */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          border: '1px solid #e6e2da',
          borderRadius: '6px',
          cursor: 'pointer',
          background: '#fbfaf7',
          fontSize: '14px',
          minHeight: '38px',
        }}
      >
        {SelectedComponent ? (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <SelectedComponent size={20} color="#c04a1a" />
          </span>
        ) : (
          <span style={{ color: '#bbb', fontSize: '18px' }}>◇</span>
        )}
        <span style={{ flex: 1, color: value ? '#2d2a26' : '#999' }}>
          {selectedIcon ? `${selectedIcon.label} (${selectedIcon.id})` : '选择图标...'}
        </span>
        <span style={{ fontSize: '11px', color: '#aaa', letterSpacing: '0.05em' }}>
          {open ? '▲ 收起' : '▼ 展开'}
        </span>
      </div>

      {/* Icon grid */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: '4px',
            padding: '12px',
            border: '1px solid #e6e2da',
            borderRadius: '8px',
            background: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: '6px',
            }}
          >
            {GUIDE_ICONS.map((icon) => {
              const IconComp = icon.component;
              const isActive = value === icon.id;
              return (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => {
                    onChange(icon.id);
                    setOpen(false);
                  }}
                  title={`${icon.label}${icon.id ? ` (${icon.id})` : ''}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 6px',
                    border: isActive ? '1.5px solid #c04a1a' : '1px solid #e6e2da',
                    borderRadius: '6px',
                    background: isActive ? '#fdf3ef' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '11px',
                    color: isActive ? '#c04a1a' : '#666',
                  }}
                >
                  {IconComp ? (
                    <IconComp size={22} color={isActive ? '#c04a1a' : '#888'} />
                  ) : (
                    <span style={{ fontSize: '16px', lineHeight: 1 }}>—</span>
                  )}
                  <span style={{ letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{icon.label}</span>
                </button>
              );
            })}
          </div>
          {/* Manual text input fallback */}
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
            <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>或输入自定义 emoji：</div>
            <input
              type="text"
              value={value && !GUIDE_ICONS.find((i) => i.id === value) ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="粘贴 emoji..."
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #e6e2da',
                borderRadius: '5px',
                fontSize: '13px',
                background: '#fafafa',
                outline: 'none',
              }}
              onFocus={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
