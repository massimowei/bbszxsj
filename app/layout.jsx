import './globals.css';

export const metadata = {
  metadataBase: new URL('https://zxsj.example.com'),
  title: {
    default: '诛仙世界攻略小站',
    template: '%s｜诛仙世界攻略小站',
  },
  description: '诛仙世界S3赛季攻略、数据与工具站',
  openGraph: {
    title: '诛仙世界攻略小站',
    description: '诛仙世界S3赛季攻略、数据与工具站',
    type: 'website',
    locale: 'zh_CN',
    siteName: '诛仙世界攻略小站',
  },
  twitter: {
    card: 'summary',
    title: '诛仙世界攻略小站',
    description: '诛仙世界S3赛季攻略、数据与工具站',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
