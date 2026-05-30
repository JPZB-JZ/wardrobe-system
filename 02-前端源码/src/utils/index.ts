import { ClothingItem, Outfit } from '../types'

// 生成单套搭配（用于日历补录）
export function generateOutfit(
  items: ClothingItem[],
  baseItem?: ClothingItem,
  occasion?: string
): Outfit | null {
  if (items.length === 0) return null
  
  const outfitItems: ClothingItem[] = baseItem ? [baseItem] : []
  const categories = ['top', 'bottom', 'shoes', 'outer']
  
  for (const cat of categories) {
    if (outfitItems.some(i => i.category === cat)) continue
    const candidates = items.filter(i => i.category === cat)
    if (candidates.length > 0) {
      outfitItems.push(candidates[Math.floor(Math.random() * candidates.length)])
    }
  }
  
  return {
    id: Math.random().toString(36).slice(2),
    name: occasion || '日常搭配',
    items: outfitItems,
    score: Math.floor(Math.random() * 20) + 75,
    reason: occasion ? `适合${occasion}的${outfitItems.length}件搭配` : '日常休闲搭配',
    occasion: occasion as any,
    createdAt: Date.now(),
  }
}

// 搭配生成引擎
export function generateOutfits(items: ClothingItem[], count = 6) {
  const groups: Record<string, ClothingItem[]> = {
    top: [], bottom: [], dress: [], outer: [], shoes: [], accessory: []
  }
  items.forEach(i => { if (groups[i.category]) groups[i.category].push(i) })

  const combos: { items: ClothingItem[], score: number }[] = []

  // 上装 + 下装 + 鞋
  for (const t of groups.top) {
    for (const b of groups.bottom) {
      const shoes = groups.shoes.length ? groups.shoes : [undefined]
      for (const s of shoes) {
        combos.push({ items: [t, b, s].filter(Boolean) as ClothingItem[], score: 0 })
      }
    }
  }

  // 连衣裙 + 鞋
  for (const d of groups.dress) {
    const shoes = groups.shoes.length ? groups.shoes : [undefined]
    for (const s of shoes) {
      combos.push({ items: [d, s].filter(Boolean) as ClothingItem[], score: 0 })
    }
  }

  // 评分
  const now = Date.now()
  combos.forEach(c => {
    let score = 60
    c.items.forEach(i => {
      if (i.lastWorn && (now - i.lastWorn) > 7 * 86400000) score += 5
    })
    // 场合一致加分
    const occasions = c.items.flatMap(i => i.occasions || [])
    if (occasions.length > 1) score += 10
    // 颜色协调
    const uniqueColors = new Set(c.items.map(i => i.color))
    if (uniqueColors.size <= 2) score += 8
    score += Math.floor(Math.random() * 12)
    c.score = Math.min(score, 99)
  })

  // 去重排序
  const seen = new Set<string>()
  return combos
    .filter(c => {
      const key = c.items.map(i => i.id).sort().join('-')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}

// 图片压缩
export function compressImage(file: File, maxWidth = 480): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        if (w > maxWidth) { h = h * maxWidth / w; w = maxWidth }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

import { getSavedCity } from '../services/cities'

// 天气获取（Open-Meteo，免费无需 key）
export async function fetchWeather(): Promise<{ temp: string; desc: string; city?: string }> {
  try {
    let lat = 39.9, lon = 116.4, cityName = '北京'

    // 优先使用保存的城市
    const savedCity = getSavedCity()
    if (savedCity) {
      lat = savedCity.lat; lon = savedCity.lon; cityName = savedCity.name
    } else {
      // 尝试浏览器定位
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 2000 })
        })
        lat = pos.coords.latitude
        lon = pos.coords.longitude
        cityName = '当前位置'
      } catch { /* 定位失败用默认 */ }
    }

    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: 'temperature_2m,weather_code',
      timezone: 'auto'
    })
    const url = 'https://api.open-meteo.com/v1/forecast?' + params.toString()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    const data = await resp.json()
    const temp = Math.round(data.current.temperature_2m) + '°'
    const code = data.current.weather_code
    const desc = weatherCodeToDesc(code)
    return { temp, desc: `${cityName} · ${desc}` }
  } catch {
    return { temp: '--', desc: '天气不可用' }
  }
}

function weatherCodeToDesc(code: number): string {
  if (code === 0) return '晴天'
  if (code <= 3) return '多云'
  if (code <= 49) return '雾'
  if (code <= 59) return '毛毛雨'
  if (code <= 69) return '下雨'
  if (code <= 79) return '下雪'
  if (code <= 84) return '阵雨'
  if (code <= 94) return '雷阵雨'
  return '恶劣天气'
}

// 生成唯一 ID
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// 根据品类生成占位图 - 使用纯 CSS/SVG 字符串
export function generatePlaceholderImage(category: string, color: string, name: string): string {
  const icons: Record<string, string> = {
    top: 'Shirt',
    bottom: 'Pants', 
    dress: 'Dress',
    outer: 'Coat',
    shoes: 'Shoes',
    accessory: 'Bag',
  }
  
  // 根据颜色选择渐变
  const bgColors: Record<string, [string, string, string]> = {
    neutral: ['#f5f5f5', '#e8e8e8', '#666'],
    warm: ['#fef3f2', '#fee4e2', '#92400e'],
    cool: ['#eff6ff', '#dbeafe', '#3b82f6'],
    earth: ['#fefce8', '#fef9c3', '#92400e'],
    bright: ['#f0fdf4', '#dcfce7', '#16a34a'],
  }
  
  // 判断颜色类型
  let colorKey = 'neutral'
  if (color.includes('c46d9c') || color.includes('f5a')) colorKey = 'warm'
  else if (color.includes('3b82f6') || color.includes('60a')) colorKey = 'cool'
  else if (color.includes('92400e') || color.includes('b45')) colorKey = 'earth'
  
  const [startColor, endColor, textColor] = bgColors[colorKey] || bgColors.neutral
  const icon = icons[category] || 'Item'
  const shortName = encodeURIComponent(name.slice(0, 4))
  
  // 生成 SVG（纯英文，避免编码问题）
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${startColor}"/>
      <stop offset="100%" stop-color="${endColor}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#g)"/>
  <rect x="20" y="20" width="160" height="160" rx="20" fill="white" fill-opacity="0.5"/>
  <text x="100" y="90" font-size="24" font-weight="bold" fill="${textColor}" text-anchor="middle" font-family="Arial,sans-serif">${icon}</text>
  <text x="100" y="130" font-size="14" fill="#888" text-anchor="middle" font-family="Arial,sans-serif">${shortName}</text>
</svg>`
  
  // 使用 unescape + btoa 编码（兼容旧浏览器）
  try {
    const encoded = unescape(encodeURIComponent(svg))
    return 'data:image/svg+xml;base64,' + btoa(encoded)
  } catch (e) {
    // 降级：直接返回 SVG data URL（不 base64）
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  }
}