'use client';

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function TinyEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  const imageUploadHandler = (blobInfo) =>
    new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', blobInfo.blob(), blobInfo.filename());
      fetch('/api/upload', { method: 'POST', body: formData })
        .then((res) => {
          if (!res.ok) throw new Error('Upload failed');
          return res.json();
        })
        .then((data) => {
          resolve(data.url);
        })
        .catch(() => {
          reject('图片上传失败，请重试');
        });
    });

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#fbfaf7',
      }}
    >
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        onInit={(_evt, editor) => (editorRef.current = editor)}
        value={value || ''}
        onEditorChange={(content) => {
          onChange?.(content);
        }}
        init={{
          license_key: 'gpl',
          height: 520,
          menubar: false,
          placeholder: placeholder || '开始撰写正文...',
          branding: false,
          statusbar: false,
          promotion: false,
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif;
              font-size: 15px;
              line-height: 1.85;
              color: #2d2a26;
              margin: 16px 18px;
            }
            h1 { font-size: 28px; margin: 1em 0 0.5em; line-height: 1.4; }
            h2 { font-size: 22px; margin: 1em 0 0.5em; line-height: 1.4; }
            h3 { font-size: 18px; margin: 0.8em 0 0.4em; line-height: 1.4; }
            h4 { font-size: 16px; margin: 0.6em 0 0.3em; }
            p { margin: 0 0 0.75em; }
            ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
            li { margin-bottom: 0.25em; }
            blockquote {
              border-left: 3px solid #5f7f67;
              margin: 0.75em 0;
              padding: 4px 16px;
              color: #5d554d;
              background: #f0ede5;
              border-radius: 0 6px 6px 0;
            }
            code {
              background: #e8e4da;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 0.9em;
              font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            }
            pre {
              background: #2d2a26;
              color: #e6e2da;
              padding: 14px 18px;
              border-radius: 8px;
              overflow-x: auto;
              font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
              font-size: 13px;
              line-height: 1.6;
            }
            pre code {
              background: none;
              padding: 0;
              color: inherit;
              font-size: inherit;
            }
            img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
            a { color: #5f7f67; text-decoration: underline; }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
              font-size: 14px;
            }
            th, td {
              border: 1px solid #d0ccc0;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background: #f0ede5;
              font-weight: 600;
              color: #2d2a26;
            }
            td { background: #fff; }
            tr:nth-child(even) td { background: #faf9f5; }
          `,
          toolbar:
            'undo redo | blocks | bold italic underline strikethrough | ' +
            'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist | blockquote | link image table | ' +
            'code | removeformat | fullscreen',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'preview', 'searchreplace', 'code', 'fullscreen',
            'insertdatetime', 'table', 'help', 'wordcount',
          ],
          table_toolbar:
            'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
            'tableinsertcolbefore tableinsertcolafter tabledeletecol',
          images_upload_handler: imageUploadHandler,
          images_file_types: 'jpg,jpeg,png,gif,webp,bmp,svg',
          link_default_target: '_blank',
          link_rel_list: [
            { title: '默认', value: '' },
            { title: 'Nofollow', value: 'nofollow' },
          ],
          paste_data_images: false,
          automatic_uploads: true,
          convert_urls: false,
          relative_urls: false,
          remove_script_host: false,
        }}
      />
    </div>
  );
}
