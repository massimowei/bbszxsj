'use client';

import { useState, useRef, useCallback } from 'react';

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';

export default function ImageUpload({ value, onChange, hint, label }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const uploadFile = useCallback(async (file) => {
    if (!file) return;

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError(`不支持 ${file.type}，仅支持 JPG/PNG/GIF/WebP`);
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`文件 ${(file.size / 1024 / 1024).toFixed(1)}MB，上限 5MB`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '上传失败');
        return;
      }

      onChange(data.url);
    } catch (e) {
      console.error('Upload error:', e);
      setError('上传出错，请重试');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const removeImage = () => onChange('');

  // Determine if current value is an uploaded path or external URL
  const isLocalUpload = value && value.startsWith('/uploads/');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* URL input — always available for manual URL entry */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hint || '粘贴图片 URL 或拖拽上传'}
          style={{
            width: '100%',
            minHeight: '44px',
            padding: '0 14px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: '#fdfcf9',
            color: 'var(--text)',
            fontSize: '15px',
            fontFamily: 'inherit',
          }}
        />
        {value ? (
          <button
            onClick={removeImage}
            style={{
              padding: '0 10px',
              minHeight: '44px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: '#fdfcf9',
              color: '#999',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
            title="清除"
          >
            ✕
          </button>
        ) : null}
      </div>

      {/* Drag & drop upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        style={{
          border: dragOver ? '2px dashed #8b6914' : '2px dashed var(--border)',
          borderRadius: '12px',
          padding: '20px 16px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragOver ? '#f5f0e6' : '#fdfcf9',
          transition: 'all 0.2s ease',
          color: '#8a7d70',
          fontSize: '14px',
          lineHeight: 1.6,
        }}
      >
        {uploading ? (
          <span style={{ color: '#8b6914' }}>上传中...</span>
        ) : (
          <>
            <span style={{ display: 'block', marginBottom: '4px', fontSize: '15px', color: '#5d554d' }}>
              点击选择图片 或 拖拽到此处
            </span>
            <span>JPG / PNG / GIF / WebP，上限 5MB</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Error message */}
      {error ? (
        <div style={{ color: '#c0392b', fontSize: '13px', padding: '4px 0' }}>{error}</div>
      ) : null}

      {/* Preview thumbnail */}
      {value ? (
        <div
          style={{
            borderRadius: '10px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            maxHeight: '200px',
            background: '#f5f3ee',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={isLocalUpload ? value : value}
            alt="预览"
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: '200px',
              objectFit: 'contain',
              margin: '0 auto',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
