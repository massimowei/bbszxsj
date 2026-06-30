import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '诛仙世界攻略小站'
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f6f1',
          borderRadius: 12,
        }}
      >
        <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 外框 - 印章式 */}
          <rect x="4" y="4" width="92" height="92" rx="10" stroke="#2d2a26" strokeWidth="3" fill="none"/>
          {/* Z 笔画 */}
          <path d="M24 28 L76 28 L30 72 L78 72" stroke="#2d2a26" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* 墨点装饰 */}
          <circle cx="82" cy="22" r="3.5" fill="#b89a5c"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
