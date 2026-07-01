'use client';

import React, { useEffect, useCallback } from 'react';
import Image from 'next/image';
import MarkdownRenderer from '../../guides/[id]/MarkdownRenderer';

export default function PreviewModal({ open, onClose, title, bannerImage, content, category }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 16px 60px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fcfaf6',
          borderRadius: 16,
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: 820,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          animation: 'previewModalIn 0.2s ease-out',
        }}
      >
        {/* Header bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', borderBottom: '1px solid #e8e4da',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#8a7d70', letterSpacing: '0.05em' }}>前台预览</span>
            {category ? (
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 4,
                background: '#e8efe8', color: '#5f7f67',
              }}>
                {category}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32, height: 32, border: 'none', background: 'none',
              cursor: 'pointer', fontSize: 20, color: '#8a7d70',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6,
            }}
            title="关闭预览"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 32px 40px' }}>
          {/* Banner image */}
          {bannerImage ? (
            <div style={{
              position: 'relative', width: '100%', aspectRatio: '16/9',
              borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)',
              marginBottom: 28,
            }}>
              <Image
                src={bannerImage}
                alt={title || 'preview'}
                fill
                sizes="(max-width: 820px) 100vw, 820px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ) : null}

          {/* Title */}
          <h1 style={{
            fontSize: 32, lineHeight: 1.4, marginBottom: 24,
            color: '#2d2a26', letterSpacing: '0.02em',
          }}>
            {title || '未命名'}
          </h1>

          {/* Content */}
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <div style={{ color: '#b5ad9f', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
              正文暂无内容，请返回编辑。
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #e8e4da',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 24px', border: '1px solid #5f7f67', borderRadius: 8,
              background: '#fbfaf7', color: '#5f7f67', cursor: 'pointer',
              fontSize: 14, fontFamily: 'inherit',
            }}
          >
            关闭预览
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes previewModalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
