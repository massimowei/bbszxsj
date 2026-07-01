'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

/* Extended sanitize schema: allow iframe (B站), <u> (rich text underline), style/class attrs */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'iframe',
    'u',
  ],
  attributes: {
    ...defaultSchema.attributes,
    iframe: [
      'src', 'width', 'height', 'scrolling', 'border',
      'frameBorder', 'framespacing', 'allowFullScreen', 'allow', 'style', 'class',
    ],
    img: [
      ...(defaultSchema.attributes?.img || []),
      'width', 'height', 'loading',
    ],
    '*': [
      ...(defaultSchema.attributes?.['*'] || []),
      'style', 'className',
    ],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: ['http', 'https'],
  },
};

export default function MarkdownRenderer({ content }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          a: ({ node, ...props }) => {
            const href = props.href || '';

            /* Bilibili video links → embedded player */
            const bvidMatch = href.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
            if (bvidMatch) {
              const bvid = bvidMatch[1];
              return (
                <div style={{ margin: '32px 0' }}>
                  <div style={{
                    position: 'relative', width: '100%', paddingBottom: '56.25%',
                    background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}>
                    <iframe
                      src={`//player.bilibili.com/player.html?bvid=${bvid}&autoplay=0`}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      scrolling="no" border="0" frameBorder="no" framespacing="0"
                      allowFullScreen={true}
                    />
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '13px', color: '#999', marginTop: '12px' }}>
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#999', borderBottom: '1px dashed #ccc' }}>
                      在 Bilibili 上观看原视频 ↗
                    </a>
                  </div>
                </div>
              );
            }

            return (
              <a {...props} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }} />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
