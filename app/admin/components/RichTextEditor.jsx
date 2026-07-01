'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';

/* ── Inline toolbar button ── */
function ToolBtn({ active, onClick, title, children, disabled }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: active ? '1px solid #5f7f67' : '1px solid transparent',
        borderRadius: 6,
        background: active ? '#e8efe8' : 'transparent',
        color: active ? '#5f7f67' : '#5d554d',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 14,
        fontWeight: active ? 700 : 400,
        opacity: disabled ? 0.35 : 1,
        transition: 'background 0.15s, border-color 0.15s',
        lineHeight: 1,
        padding: 0,
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

/* ── Separator ── */
function Sep() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 1,
        height: 20,
        background: '#ddd9cf',
        margin: '0 4px',
        verticalAlign: 'middle',
      }}
    />
  );
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkPanel, setShowLinkPanel] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Image.configure({ allowBase64: false, inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener' } }),
      Underline,
      Placeholder.configure({ placeholder: placeholder || '开始撰写正文...' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 320px; padding: 0;',
      },
    },
    immediatelyRender: false,
  });

  /* ── Image upload ── */
  const handleFileUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        editor.chain().focus().setImage({ src: data.url }).run();
        setShowImagePanel(false);
      } catch {
        alert('图片上传失败，请重试');
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    },
    [editor]
  );

  const handleImageUrlSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      if (!imageUrl.trim() || !editor) return;
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl('');
      setShowImagePanel(false);
    },
    [editor, imageUrl]
  );

  /* ── Link ── */
  const handleLinkSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      if (!linkUrl.trim() || !editor) return;
      let href = linkUrl.trim();
      if (!/^https?:\/\//i.test(href)) href = 'https://' + href;
      editor.chain().focus().setLink({ href }).run();
      setLinkUrl('');
      setShowLinkPanel(false);
    },
    [editor, linkUrl]
  );

  if (!editor) return null;

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 12,
        background: '#fbfaf7',
        overflow: 'hidden',
      }}
    >
      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          padding: '8px 10px',
          borderBottom: '1px solid #e8e4da',
          background: '#f7f5ef',
          alignItems: 'center',
        }}
      >
        {/* Text style */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="加粗">B</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="斜体">I</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="下划线">U̲</ToolBtn>
        <Sep />

        {/* Headings */}
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="大标题">H2</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="中标题">H3</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="正文">¶</ToolBtn>
        <Sep />

        {/* Lists */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="无序列表">•≡</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="有序列表">1.</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="引用">❝</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="代码块">&lt;/&gt;</ToolBtn>
        <Sep />

        {/* Link */}
        <ToolBtn
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              setLinkUrl('');
              setShowLinkPanel((v) => !v);
              setShowImagePanel(false);
            }
          }}
          active={editor.isActive('link')}
          title="链接"
        >
          🔗
        </ToolBtn>

        {/* Image */}
        <ToolBtn
          onClick={() => {
            setShowImagePanel((v) => !v);
            setShowLinkPanel(false);
          }}
          active={false}
          title="插入图片"
        >
          🖼
        </ToolBtn>

        {/* Undo / Redo */}
        <Sep />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="撤销" disabled={!editor.can().undo()}>↩</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="重做" disabled={!editor.can().redo()}>↪</ToolBtn>
      </div>

      {/* ── Image insert panel ── */}
      {showImagePanel ? (
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #e8e4da', background: '#faf9f5' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '6px 14px',
                border: '1px solid #5f7f67',
                borderRadius: 6,
                background: '#fbfaf7',
                color: '#5f7f67',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'inherit',
              }}
            >
              {uploading ? '上传中...' : '选择本地图片'}
            </button>
            <span style={{ color: '#8a7d70', fontSize: 12 }}>或粘贴 URL</span>
            <form onSubmit={handleImageUrlSubmit} style={{ display: 'flex', gap: 6, flex: 1, minWidth: 200 }}>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  border: '1px solid #ddd9cf',
                  borderRadius: 6,
                  fontSize: 13,
                  background: '#fff',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  border: '1px solid #5f7f67',
                  borderRadius: 6,
                  background: '#5f7f67',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                插入
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* ── Link insert panel ── */}
      {showLinkPanel ? (
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #e8e4da', background: '#faf9f5' }}>
          <form onSubmit={handleLinkSubmit} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              style={{
                flex: 1,
                padding: '6px 10px',
                border: '1px solid #ddd9cf',
                borderRadius: 6,
                fontSize: 13,
                background: '#fff',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '6px 12px',
                border: '1px solid #5f7f67',
                borderRadius: 6,
                background: '#5f7f67',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'inherit',
              }}
            >
              设置链接
            </button>
          </form>
        </div>
      ) : null}

      {/* ── Editor area ── */}
      <div style={{ padding: '16px 18px' }}>
        <EditorContent editor={editor} />
        <style jsx global>{`
          .tiptap {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif;
            font-size: 15px;
            line-height: 1.85;
            color: #2d2a26;
          }
          .tiptap p { margin: 0 0 0.75em; }
          .tiptap h1 { font-size: 28px; margin: 1em 0 0.5em; line-height: 1.4; }
          .tiptap h2 { font-size: 22px; margin: 1em 0 0.5em; line-height: 1.4; }
          .tiptap h3 { font-size: 18px; margin: 0.8em 0 0.4em; line-height: 1.4; }
          .tiptap ul, .tiptap ol { padding-left: 1.5em; margin: 0.5em 0; }
          .tiptap li { margin-bottom: 0.25em; }
          .tiptap blockquote {
            border-left: 3px solid #5f7f67;
            margin: 0.75em 0;
            padding: 4px 16px;
            color: #5d554d;
            background: #f0ede5;
            border-radius: 0 6px 6px 0;
          }
          .tiptap code {
            background: #e8e4da;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          }
          .tiptap pre {
            background: #2d2a26;
            color: #e6e2da;
            padding: 14px 18px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: 13px;
            line-height: 1.6;
          }
          .tiptap pre code {
            background: none;
            padding: 0;
            color: inherit;
            font-size: inherit;
          }
          .tiptap img {
            max-width: 100%;
            border-radius: 8px;
            margin: 12px 0;
          }
          .tiptap a {
            color: #5f7f67;
            text-decoration: underline;
          }
          .tiptap p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            color: #b5ad9f;
            float: left;
            pointer-events: none;
            height: 0;
          }
        `}</style>
      </div>
    </div>
  );
}
