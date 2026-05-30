import { X, HelpCircle } from 'lucide-react'

interface ScoreBreakdown {
  color: { score: number; max: number; reason: string }
  occasion: { score: number; max: number; reason: string }
  temperature: { score: number; max: number; reason: string }
  style: { score: number; max: number; reason: string }
}

interface ScoreDetailModalProps {
  isOpen: boolean
  onClose: () => void
  outfitName: string
  totalScore: number
  breakdown: ScoreBreakdown
}

export default function ScoreDetailModal({ isOpen, onClose, outfitName, totalScore, breakdown }: ScoreDetailModalProps) {
  if (!isOpen) return null

  const items = [
    { key: 'color', label: '颜色协调性', icon: '🎨', ...breakdown.color },
    { key: 'occasion', label: '场合匹配度', icon: '👔', ...breakdown.occasion },
    { key: 'temperature', label: '温度适宜度', icon: '🌡️', ...breakdown.temperature },
    { key: 'style', label: '风格一致性', icon: '✨', ...breakdown.style },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-pri" />
            <h3 className="font-bold text-text">搭配评分详情</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* 总分 */}
        <div className="px-5 py-6 bg-gradient-to-r from-pri/10 to-sec/10 text-center">
          <p className="text-sm text-text-muted mb-1">{outfitName}</p>
          <p className="text-4xl font-extrabold text-pri">{totalScore}<span className="text-lg text-text-muted">/99</span></p>
          <p className="text-xs text-text-muted mt-2">基于 AI 算法综合评估</p>
        </div>

        {/* 分项得分 */}
        <div className="p-5 space-y-4">
          {items.map(item => (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-sm font-medium text-text">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-pri">{item.score}/{item.max}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-pri to-sec transition-all"
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{item.reason}</p>
            </div>
          ))}
        </div>

        {/* 底部文案 */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-text-muted text-center">
            💡 分数越高表示这套搭配越适合你当前的天气和场合
          </p>
        </div>
      </div>
    </div>
  )
}

// 生成评分详情的工具函数
export function generateScoreBreakdown(
  outfit: { items: Array<{ colorName: string; category: string }>; occasion?: string; style?: string },
  weather?: { temp: string }
): ScoreBreakdown {
  const items = outfit.items
  const colors = items.map(i => i.colorName)
  const categories = items.map(i => i.category)
  
  // 颜色协调性评分 (30分)
  const uniqueColors = new Set(colors)
  let colorScore = 25
  let colorReason = ''
  if (uniqueColors.size <= 2) {
    colorScore = 28
    colorReason = `${colors.join('和')}颜色搭配很和谐，色调统一`
  } else if (uniqueColors.size === 3) {
    colorScore = 24
    colorReason = `${colors.join('、')}三色搭配，层次感不错`
  } else {
    colorScore = 18
    colorReason = `颜色较多，建议控制在2-3种主色调`
  }
  
  // 场合匹配度 (25分)
  const occasion = outfit.occasion || '日常'
  let occasionScore = 22
  let occasionReason = `这套搭配很适合"${occasion}"场合，场合匹配度很高`
  if (categories.includes('outer') && occasion === '正式场合') {
    occasionScore = 24
    occasionReason = '外套搭配正式场合，得体大方'
  }
  
  // 温度适宜度 (25分)
  const temp = parseInt(weather?.temp || '20')
  let tempScore = 22
  let tempReason = ''
  if (categories.includes('outer') && temp < 15) {
    tempScore = 24
    tempReason = `当前温度${temp}°，外套保暖性很好`
  } else if (!categories.includes('outer') && temp > 25) {
    tempScore = 24
    tempReason = `当前温度${temp}°，轻薄穿搭很舒适`
  } else {
    tempReason = `当前温度${temp}°，这套搭配温度适宜`
  }
  
  // 风格一致性 (20分)
  const style = outfit.style || '休闲'
  let styleScore = 17
  let styleReason = `整体风格偏向"${style}"，${items.length}件单品风格统一`
  if (items.length >= 3) {
    styleScore = 18
    styleReason += '，搭配完整度高'
  }
  
  return {
    color: { score: colorScore, max: 30, reason: colorReason },
    occasion: { score: occasionScore, max: 25, reason: occasionReason },
    temperature: { score: tempScore, max: 25, reason: tempReason },
    style: { score: styleScore, max: 20, reason: styleReason },
  }
}
