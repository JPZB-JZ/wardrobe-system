import { ClothingItem } from '../types'
import { genId } from '../utils'

// 预设图片 - 使用在线占位图服务
const PLACEHOLDER_URL = 'https://placehold.co/200x200'

// 预设衣物数据（使用固定 ID，避免刷新后 ID 变化导致图片丢失）
export const PRESET_ITEMS: ClothingItem[] = [
  { id: 'preset_001', name: '真丝混纺衬衫', category: 'top', color: '#f5f5f5', colorName: '白', colorFamily: 'neutral', pattern: '纯色', fabric: '丝绸', thickness: 2, styles: ['通勤', '正式'], occasions: ['上班', '正式场合'], seasons: ['春', '夏', '秋'], formality: 4, brand: 'Theory', price: 1280, image: `${PLACEHOLDER_URL}/f5f5f5/666?text=Shirt`, fav: false, wearCount: 12, lastWorn: Date.now() - 86400000 * 2, wearLog: {}, createdAt: Date.now() - 86400000 * 30 },
  { id: 'preset_002', name: '高腰阔腿裤', category: 'bottom', color: '#1a1c1d', colorName: '黑', colorFamily: 'neutral', pattern: '纯色', fabric: '涤纶', thickness: 3, styles: ['通勤', '极简'], occasions: ['上班', '日常'], seasons: ['春', '夏', '秋', '冬'], formality: 3, brand: 'COS', price: 890, image: `${PLACEHOLDER_URL}/1a1c1d/fff?text=Pants`, fav: true, wearCount: 18, lastWorn: Date.now() - 86400000, wearLog: {}, createdAt: Date.now() - 86400000 * 25 },
  { id: 'preset_003', name: '羊毛大衣', category: 'outer', color: '#92400e', colorName: '棕', colorFamily: 'earth', pattern: '纯色', fabric: '羊毛', thickness: 5, styles: ['正式', '复古'], occasions: ['上班', '正式场合'], seasons: ['秋', '冬'], formality: 5, brand: 'Max Mara', price: 5800, image: `${PLACEHOLDER_URL}/92400e/fff?text=Coat`, fav: true, wearCount: 8, lastWorn: Date.now() - 86400000 * 5, wearLog: {}, createdAt: Date.now() - 86400000 * 60 },
  { id: 'preset_004', name: '碎花连衣裙', category: 'dress', color: '#c46d9c', colorName: '粉', colorFamily: 'warm', pattern: '碎花', fabric: '雪纺', thickness: 2, styles: ['甜美', '文艺'], occasions: ['约会', '日常'], seasons: ['春', '夏'], formality: 2, brand: 'Reformation', price: 1680, image: `${PLACEHOLDER_URL}/c46d9c/fff?text=Dress`, fav: false, wearCount: 5, lastWorn: Date.now() - 86400000 * 10, wearLog: {}, createdAt: Date.now() - 86400000 * 20 },
  { id: 'preset_005', name: '白色运动鞋', category: 'shoes', color: '#f5f5f5', colorName: '白', colorFamily: 'neutral', pattern: '纯色', fabric: '尼龙', thickness: 2, styles: ['运动', '休闲'], occasions: ['运动', '日常'], seasons: ['春', '夏', '秋', '冬'], formality: 1, brand: 'New Balance', price: 899, image: `${PLACEHOLDER_URL}/f5f5f5/666?text=Shoes`, fav: true, wearCount: 25, lastWorn: Date.now(), wearLog: {}, createdAt: Date.now() - 86400000 * 90 },
  { id: 'preset_006', name: '真皮尖头高跟鞋', category: 'shoes', color: '#1a1c1d', colorName: '黑', colorFamily: 'neutral', pattern: '纯色', fabric: '皮革', thickness: 2, styles: ['正式', '通勤'], occasions: ['上班', '正式场合'], seasons: ['春', '夏', '秋', '冬'], formality: 5, brand: 'Stuart Weitzman', price: 2980, image: `${PLACEHOLDER_URL}/1a1c1d/fff?text=Heels`, fav: false, wearCount: 6, lastWorn: Date.now() - 86400000 * 14, wearLog: {}, createdAt: Date.now() - 86400000 * 45 },
  { id: 'preset_007', name: '条纹针织衫', category: 'top', color: '#3b82f6', colorName: '蓝', colorFamily: 'cool', pattern: '条纹', fabric: '针织', thickness: 3, styles: ['休闲', '文艺'], occasions: ['日常', '居家'], seasons: ['春', '秋', '冬'], formality: 2, brand: 'Uniqlo', price: 199, image: `${PLACEHOLDER_URL}/3b82f6/fff?text=Knit`, fav: false, wearCount: 15, lastWorn: Date.now() - 86400000 * 3, wearLog: {}, createdAt: Date.now() - 86400000 * 40 },
  { id: 'preset_008', name: '牛仔半裙', category: 'bottom', color: '#3b82f6', colorName: '蓝', colorFamily: 'cool', pattern: '纯色', fabric: '牛仔', thickness: 3, styles: ['休闲', '街头'], occasions: ['日常', '约会'], seasons: ['春', '夏', '秋'], formality: 2, brand: 'Levi\'s', price: 599, image: `${PLACEHOLDER_URL}/3b82f6/fff?text=Skirt`, fav: false, wearCount: 10, lastWorn: Date.now() - 86400000 * 7, wearLog: {}, createdAt: Date.now() - 86400000 * 35 },
  { id: 'preset_009', name: '珍珠耳环', category: 'accessory', color: '#f5f5f5', colorName: '白', colorFamily: 'neutral', pattern: '纯色', fabric: '其他', thickness: 1, styles: ['正式', '甜美'], occasions: ['正式场合', '约会'], seasons: ['春', '夏', '秋', '冬'], formality: 4, brand: 'Mikimoto', price: 3200, image: `${PLACEHOLDER_URL}/f5f5f5/666?text=Jewelry`, fav: true, wearCount: 4, lastWorn: Date.now() - 86400000 * 20, wearLog: {}, createdAt: Date.now() - 86400000 * 50 },
  { id: 'preset_010', name: '运动背心', category: 'top', color: '#6b7280', colorName: '灰', colorFamily: 'neutral', pattern: '纯色', fabric: '尼龙', thickness: 1, styles: ['运动'], occasions: ['运动'], seasons: ['春', '夏', '秋', '冬'], formality: 1, brand: 'lululemon', price: 480, image: `${PLACEHOLDER_URL}/6b7280/fff?text=Tank`, fav: false, wearCount: 20, lastWorn: Date.now() - 86400000 * 1, wearLog: {}, createdAt: Date.now() - 86400000 * 15 },
]

// 兼容新代码
export const PRESET_ITEMS_DATA = PRESET_ITEMS.map(({ id, image, ...rest }) => rest)
export function generatePresetItems(): ClothingItem[] {
  return PRESET_ITEMS.map(item => ({ ...item, id: genId() }))
}
