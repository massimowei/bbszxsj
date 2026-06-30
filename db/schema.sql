-- 诛仙世界攻略小站 数据库 Schema
-- 使用方法：psql -d zxsj -f db/schema.sql

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- 攻略表
CREATE TABLE IF NOT EXISTS guides (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  game TEXT DEFAULT '诛仙世界',
  category TEXT,
  emoji TEXT DEFAULT '',
  date TEXT,
  excerpt TEXT DEFAULT '',
  recommend BOOLEAN DEFAULT false,
  content TEXT,
  sort_order INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  cover_image TEXT,
  banner_image TEXT,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guides_status ON guides(status);
CREATE INDEX IF NOT EXISTS idx_guides_category ON guides(category);
CREATE INDEX IF NOT EXISTS idx_guides_recommend ON guides(recommend);
CREATE INDEX IF NOT EXISTS idx_guides_sort_order ON guides(sort_order);

-- 游戏活动事件表
CREATE TABLE IF NOT EXISTS game_events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'daily',
  reset_type TEXT DEFAULT 'daily' CHECK (reset_type IN ('daily', 'weekly', 'none')),
  reset_day INTEGER DEFAULT 1,
  start_date DATE,
  end_date DATE,
  reward TEXT DEFAULT '',
  difficulty TEXT DEFAULT '',
  cover_image TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  version TEXT DEFAULT 'current',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_events_active ON game_events(is_active);
CREATE INDEX IF NOT EXISTS idx_game_events_category ON game_events(category);
CREATE INDEX IF NOT EXISTS idx_game_events_sort_order ON game_events(sort_order);
CREATE INDEX IF NOT EXISTS idx_game_events_version ON game_events(version);
CREATE INDEX IF NOT EXISTS idx_game_events_dates ON game_events(start_date, end_date);

-- 公告表（含官方公告解读）
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'update', 'event', 'interpretation')),
  cover_image TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_sort_order ON announcements(sort_order);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
