# 诛仙世界攻略小站 (Zhu Xian World Guide)

基于 Next.js 15+ (App Router) 构建的诛仙世界游戏攻略与辅助工具平台。项目采用了“东方极简 (Kenya Hara式)”设计哲学，大量留白、温润诗意。

## ✨ 核心特性

- **东方极简设计**：温润、克制、呼吸感，提供极致的沉浸式阅读体验。
- **App Router 架构**：全面拥抱 Next.js 15+ Server Components 与 Server Actions。
- **动态 Markdown 渲染**：支持原生 HTML 与 B站视频无缝内嵌，定制化极简排版。
- **安全后台管理**：基于 Server Actions 与 HttpOnly Cookie 的轻量级凭证校验。
- **PostgreSQL 数据库**：原生 `pg` 驱动连接池，稳定可靠的攻略数据存储。

## 🛠 技术栈

- **框架**: Next.js (App Router), React 18
- **样式**: CSS Modules / Global CSS (CSS Variables)
- **数据库**: PostgreSQL (`pg`)
- **Markdown**: `react-markdown`, `rehype-raw`
- **部署**: Vercel (推荐)

## 🚀 快速开始

### 1. 环境准备
- Node.js 18+
- PostgreSQL 数据库

### 2. 安装依赖
```bash
npm install
```

### 3. 环境变量配置
复制 `.env.example` 并重命名为 `.env`，填写您的本地数据库和后台账号密码：
```env
DATABASE_URL="postgres://postgres:123456@localhost:5432/zxsj"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="password"
```

### 4. 启动开发服务器
```bash
npm run dev
```
访问 [http://localhost:3000](http://localhost:3000) 即可预览，后台管理请访问 `/admin`。

## 📂 目录结构

```text
├── app/                  # Next.js App Router 目录
│   ├── admin/            # 后台管理系统
│   ├── guides/           # 攻略大全与详情页
│   ├── tools/            # 辅助工具
│   ├── globals.css       # 全局样式与极简设计变量
│   ├── layout.jsx        # 根布局
│   └── page.jsx          # 首页
├── lib/                  # 核心工具库
│   └── db.js             # 数据库连接池
├── public/               # 静态资源 (图片/图标等)
└── .env.example          # 环境变量示例
```

## 🤝 声明
本站所有与诛仙世界相关的内容，均为完美世界公司版权所有。本站旨在作为粉丝网站，不隶属于游戏公司或受其认可。