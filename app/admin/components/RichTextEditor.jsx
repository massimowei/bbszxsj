'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { DOMParser as ProseMirrorDOMParser } from '@tiptap/pm/model';

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

/* ── Detect HTML code pasted as plain text ── */
function looksLikeHtml(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  return /<(\/)?[a-zA-Z][\w\-]*(\s[^>]*)?>/.test(trimmed) && trimmed.includes('>');
}

/* ── Minimal client-side Markdown → HTML converter ──
   Handles common patterns used in guide content. No new dependencies. */
function simpleMarkdownToHtml(md) {
  if (!md) return '';

  let html = md
    // Code blocks first
    .replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeHtml(code.trim())}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

  // Headings
  html = html
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold / italic / underline
  html = html
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Horizontal rules
  html = html.replace(/^(---|\*\*\*|___)$/gim, '<hr />');

  // Blockquotes (single line)
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Lists (single line items)
  html = html.replace(/^[-*] (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

  // Paragraphs: split by blank lines
  const blocks = html.split(/\n\s*\n/);
  html = blocks
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      // Already block-level element
      if (/^<(h[1-6]|blockquote|pre|ul|ol|hr|li)/i.test(block)) return block;
      // Preserve single line breaks inside paragraphs
      block = block.replace(/\n/g, '<br />');
      return `<p>${block}</p>`;
    })
    .join('\n');

  // Wrap consecutive <li> elements
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) => {
    if (/<li[^>]*value=/i.test(match)) return `<ol>\n${match}</ol>`;
    return `<ul>\n${match}</ul>`;
  });

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function insertHtmlAtSelection(view, html) {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(html, 'text/html');
  const slice = ProseMirrorDOMParser.fromSchema(view.state.schema).parseSlice(doc.body);
  view.dispatch(view.state.tr.replaceSelection(slice));
}

/* ── Source paste modal ── */
function SourcePasteModal({ open, onClose, onInsert }) {
  const [source, setSource] = useState('');
  const [format, setFormat] = useState('html'); // 'html' | 'markdown'

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = source;
    if (!raw.trim()) return;
    const html = format === 'markdown' ? simpleMarkdownToHtml(raw) : raw;
    onInsert(html);
    setSource('');
    onClose();
  };

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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          background: '#fcfaf6',
          borderRadius: 16,
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e8e4da',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: '#2d2a26' }}>粘贴源码</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: '#8a7d70',
              borderRadius: 6,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 20px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#6f665d' }}>格式：</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#2d2a26' }}>
            <input
              type="radio"
              name="source-format"
              value="html"
              checked={format === 'html'}
              onChange={() => setFormat('html')}
            />
            HTML
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#2d2a26' }}>
            <input
              type="radio"
              name="source-format"
              value="markdown"
              checked={format === 'markdown'}
              onChange={() => setFormat('markdown')}
            />
            Markdown
          </label>
        </div>

        <div style={{ padding: '0 20px 20px', flex: 1, minHeight: 0 }}>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={
              format === 'html'
                ? '在此粘贴 HTML 源码，例如 <h2>前言</h2><p>正文内容</p>...'
                : '在此粘贴 Markdown 源码，例如 ## 前言\n\n正文内容...'
            }
            style={{
              width: '100%',
              height: '50vh',
              minHeight: 240,
              resize: 'vertical',
              padding: 14,
              border: '1px solid #ddd9cf',
              borderRadius: 10,
              background: '#fff',
              fontSize: 13,
              lineHeight: 1.7,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
              outline: 'none',
            }}
          />
          <div style={{ marginTop: 10, fontSize: 12, color: '#8a7d70', lineHeight: 1.7 }}>
            {format === 'html'
              ? '提示：粘贴的 HTML 会被解析为富文本。如果当前已有内容，将插入到光标位置。'
              : '提示：Markdown 会先转换成 HTML，再插入编辑器。支持标题、加粗、斜体、链接、列表、引用、代码块等常用语法。'}
          </div>
        </div>

        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #e8e4da',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              border: '1px solid #ddd9cf',
              borderRadius: 8,
              background: '#fbfaf7',
              color: '#5d554d',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: 'inherit',
            }}
          >
            取消
          </button>
          <button
            type="submit"
            style={{
              padding: '8px 18px',
              border: '1px solid #5f7f67',
              borderRadius: 8,
              background: '#5f7f67',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: 'inherit',
            }}
          >
            确认插入
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [showSourcePaste, setShowSourcePaste] = useState(false);

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
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (!text || !looksLikeHtml(text)) return false;

        event.preventDefault();
        insertHtmlAtSelection(view, text);
        return true;
      },
    },
    immediatelyRender: false,
  });

  const handleInsertSource = useCallback(
    (html) => {
      if (!editor) return;
      editor.chain().focus().insertContent(html, { parseOptions: { preserveWhitespace: false } }).run();
    },
    [editor]
  );

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
    <>
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 12,
          background: '#fbfaf7',
        }}
      >
        {/* ── Sticky Toolbar ── */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            padding: '8px 10px',
            borderBottom: '1px solid #e8e4da',
            background: '#f7f5ef',
            alignItems: 'center',
            borderRadius: '12px 12px 0 0',
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

          {/* Source paste */}
          <ToolBtn
            onClick={() => {
              setShowSourcePaste(true);
              setShowImagePanel(false);
              setShowLinkPanel(false);
            }}
            active={false}
            title="粘贴 HTML / Markdown 源码"
          >
            {'</>'}
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

      <SourcePasteModal
        open={showSourcePaste}
        onClose={() => setShowSourcePaste(false)}
        onInsert={handleInsertSource}
      />
    </>
  );
}
