-- Aura Style 智能衣橱 - 数据库设计
-- 用于后端 SQLite / MySQL 存储（当前前端用 localStorage，后续迁移）

-- 衣物表（核心数据）
CREATE TABLE clothing_items (
  id TEXT PRIMARY KEY,
  -- 基本信息
  name TEXT NOT NULL,
  brand TEXT DEFAULT '',
  price REAL DEFAULT 0,
  image TEXT DEFAULT '',           -- base64 或 URL
  -- 分类
  category TEXT NOT NULL,          -- top/bottom/dress/outer/shoes/accessory/bag
  -- 外观属性
  color TEXT NOT NULL,             -- 主色 hex
  color_name TEXT NOT NULL,        -- 颜色中文名
  color_family TEXT NOT NULL,      -- neutral/warm/cool/earth
  secondary_color TEXT,            -- 辅助色 hex
  pattern TEXT DEFAULT '纯色',     -- 图案类型
  -- 材质
  fabric TEXT DEFAULT '棉',        -- 面料
  thickness INTEGER DEFAULT 3,     -- 厚度 1-5
  -- 风格
  styles TEXT DEFAULT '[]',        -- JSON数组：风格标签
  occasions TEXT DEFAULT '[]',     -- JSON数组：适用场合
  seasons TEXT DEFAULT '[]',       -- JSON数组：适用季节
  formality INTEGER DEFAULT 3,     -- 正式度 1-5
  -- 温度
  temp_min INTEGER,                -- 最低适用温度
  temp_max INTEGER,                -- 最高适用温度
  -- 使用数据
  fav INTEGER DEFAULT 0,           -- 收藏
  wear_count INTEGER DEFAULT 0,    -- 穿着次数
  last_worn INTEGER DEFAULT 0,     -- 上次穿着时间戳
  -- AI 数据
  ai_description TEXT,             -- AI 生成描述
  ai_tags TEXT DEFAULT '[]',       -- JSON数组：AI标签
  -- 时间
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 穿着日志表
CREATE TABLE wear_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL,
  worn_date TEXT NOT NULL,         -- YYYY-MM-DD
  created_at INTEGER NOT NULL,
  FOREIGN KEY (item_id) REFERENCES clothing_items(id) ON DELETE CASCADE
);

-- 搭配方案表
CREATE TABLE outfits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  item_ids TEXT NOT NULL,          -- JSON数组：衣物ID列表
  score INTEGER DEFAULT 0,
  reason TEXT,                     -- 搭配理由
  color_harmony TEXT,              -- 配色方案说明
  occasion TEXT,
  style TEXT,
  is_ai_generated INTEGER DEFAULT 0,  -- 是否AI生成
  created_at INTEGER NOT NULL
);

-- 用户设置表
CREATE TABLE user_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 索引
CREATE INDEX idx_items_category ON clothing_items(category);
CREATE INDEX idx_items_color_family ON clothing_items(color_family);
CREATE INDEX idx_items_formality ON clothing_items(formality);
CREATE INDEX idx_wear_logs_date ON wear_logs(worn_date);
CREATE INDEX idx_wear_logs_item ON wear_logs(item_id);

-- 初始设置
INSERT INTO user_settings (key, value) VALUES
  ('ai_key', ''),
  ('ai_model', 'deepseek-chat'),
  ('weather_city', ''),
  ('theme', 'light');