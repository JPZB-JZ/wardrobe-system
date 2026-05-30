// 衣物数据类型定义 - 完整版

// === 品类 ===
export type Category = 'top' | 'bottom' | 'dress' | 'outer' | 'shoes' | 'accessory' | 'bag'

export const CATEGORY_MAP: Record<Category, string> = {
  top: '上装', bottom: '下装', dress: '连衣裙/套装',
  outer: '外套', shoes: '鞋子', accessory: '配饰', bag: '包包'
}

// === 风格标签 ===
export const STYLES = [
  '休闲', '通勤', '正式', '运动', '街头', '文艺', '甜美', '中性', '复古', '极简'
] as const
export type Style = typeof STYLES[number]

// === 场合 ===
export const OCCASIONS = [
  '日常', '上班', '约会', '聚会', '运动', '旅行', '正式场合', '居家'
] as const
export type Occasion = typeof OCCASIONS[number]

// === 季节 ===
export const SEASONS = ['春', '夏', '秋', '冬'] as const
export type Season = typeof SEASONS[number]

// === 面料 ===
export const FABRICS = [
  '棉', '麻', '丝绸', '羊毛', '羊绒', '涤纶', '尼龙', '牛仔',
  '皮革', '人造革', '雪纺', '针织', '灯芯绒', '天鹅绒', '蕾丝', '其他'
] as const
export type Fabric = typeof FABRICS[number]

// === 图案 ===
export const PATTERNS = [
  '纯色', '条纹', '格纹', '碎花', '波点', '几何', '印花', '渐变',
  '动物纹', '格子', '迷彩', '其他'
] as const
export type Pattern = typeof PATTERNS[number]

// === 颜色（扩展版，含色系分类）===
export interface ColorInfo {
  hex: string        // hex 值
  name: string       // 显示名
  family: ColorFamily // 色系归属
}

export type ColorFamily = 'neutral' | 'warm' | 'cool' | 'earth'

export const COLORS: ColorInfo[] = [
  // 中性色
  { hex: '#1a1c1d', name: '黑', family: 'neutral' },
  { hex: '#f5f5f5', name: '白', family: 'neutral' },
  { hex: '#6b7280', name: '灰', family: 'neutral' },
  { hex: '#d4c5a9', name: '米', family: 'neutral' },
  // 暖色
  { hex: '#dc2626', name: '红', family: 'warm' },
  { hex: '#f97316', name: '橙', family: 'warm' },
  { hex: '#eab308', name: '黄', family: 'warm' },
  { hex: '#c46d9c', name: '粉', family: 'warm' },
  { hex: '#be185d', name: '玫红', family: 'warm' },
  { hex: '#f5e6d3', name: '奶油', family: 'warm' },
  // 冷色
  { hex: '#3b82f6', name: '蓝', family: 'cool' },
  { hex: '#1e3a5f', name: '藏青', family: 'cool' },
  { hex: '#06b6d4', name: '青', family: 'cool' },
  { hex: '#8e6dbf', name: '紫', family: 'cool' },
  { hex: '#22c55e', name: '绿', family: 'cool' },
  { hex: '#14532d', name: '墨绿', family: 'cool' },
  // 大地色
  { hex: '#92400e', name: '棕', family: 'earth' },
  { hex: '#78350f', name: '深棕', family: 'earth' },
  { hex: '#d2b48c', name: '卡其', family: 'earth' },
  { hex: '#8b6914', name: '驼色', family: 'earth' },
  { hex: '#6b4c3b', name: '咖啡', family: 'earth' },
]

// === 衣物完整数据 ===
export interface ClothingItem {
  id: string
  // 基本信息
  name: string
  brand?: string
  price?: number
  image?: string
  // 分类属性
  category: Category
  // 外观属性
  color: string           // 主色 hex
  colorName: string       // 主色名
  colorFamily: ColorFamily // 色系
  secondaryColor?: string  // 辅助色 hex（有花纹时）
  pattern: Pattern        // 图案
  // 材质属性
  fabric: Fabric          // 面料
  thickness: 1 | 2 | 3 | 4 | 5  // 厚度：1=极薄 5=极厚
  // 风格属性
  styles: Style[]         // 风格标签（可多选）
  occasions: Occasion[]   // 适用场合（可多选）
  seasons: Season[]       // 适用季节（可多选）
  formality: 1 | 2 | 3 | 4 | 5  // 正式度：1=极休闲 5=极正式
  // 温度适用范围
  tempMin?: number        // 最低适用温度
  tempMax?: number        // 最高适用温度
  // 使用数据
  fav: boolean
  wearCount: number
  lastWorn: number
  wearLog: Record<string, number>
  createdAt: number
  // AI 备注
  aiDescription?: string  // AI 识别后的描述
  aiTags?: string[]       // AI 生成的标签
}

// === 搭配数据 ===
export interface Outfit {
  id: string
  name: string
  items: ClothingItem[]
  score: number
  reason?: string         // 搭配理由
  occasion?: Occasion
  style?: Style
  createdAt: number
}

// === AI 配置 ===
export interface AiConfig {
  key: string
  model: string
}

// === 天气 ===
export interface WeatherInfo {
  temp: string
  desc: string
  city?: string
}

// === 工具函数 ===
// 将衣物数据格式化为 AI 可读的描述
export function itemToAiDescription(item: ClothingItem): string {
  const parts = [
    `【${CATEGORY_MAP[item.category]}】${item.name}`,
    `颜色：${item.colorName}（${item.colorFamily === 'warm' ? '暖色系' : item.colorFamily === 'cool' ? '冷色系' : item.colorFamily === 'earth' ? '大地色系' : '中性色'}）`,
    `图案：${item.pattern}`,
    `面料：${item.fabric}`,
    `厚度：${'●'.repeat(item.thickness)}${'○'.repeat(5 - item.thickness)}`,
    `风格：${item.styles.join('、')}`,
    `场合：${item.occasions.join('、')}`,
    `季节：${item.seasons.join('')}`,
    `正式度：${'★'.repeat(item.formality)}${'☆'.repeat(5 - item.formality)}`,
  ]
  if (item.tempMin !== undefined && item.tempMax !== undefined) {
    parts.push(`适用温度：${item.tempMin}°~${item.tempMax}°`)
  }
  if (item.brand) parts.push(`品牌：${item.brand}`)
  if (item.wearCount) parts.push(`已穿${item.wearCount}次`)
  if (item.aiTags?.length) parts.push(`标签：${item.aiTags.join('、')}`)
  return parts.join('\n')
}

// 将整个衣橱格式化发送给 AI
export function wardrobeToAiPrompt(items: ClothingItem[], weather?: WeatherInfo): string {
  let prompt = `我的衣橱有 ${items.length} 件衣物：\n\n`
  items.forEach((item, i) => {
    prompt += `--- 第${i + 1}件 (ID: ${item.id}) ---\n`
    prompt += itemToAiDescription(item) + '\n\n'
  })
  if (weather) {
    prompt += `\n当前天气：${weather.temp} ${weather.desc}\n`
  }
  return prompt
}