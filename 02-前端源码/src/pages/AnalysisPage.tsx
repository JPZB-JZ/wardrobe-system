import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { ArrowLeft, PieChart, AlertCircle, Lightbulb, TrendingUp, Moon, RefreshCw } from 'lucide-react'
import { CATEGORY_MAP, COLORS } from '../types'
import { useMemo } from 'react'
import { getIdleItemsList } from '../services/idleReminder'
import { generateOutfit } from '../utils'

export default function AnalysisPage() {
  const navigate = useNavigate()
  const { items, images } = useStore()
  const toast = (window as any).__toast
  
  // 闲置衣物列表
  const idleItems = useMemo(() => getIdleItemsList(items), [items])

  // 统计分析
  const stats = useMemo(() => {
    const total = items.length
    if (total === 0) return null

    // 品类分布
    const categoryCount: Record<string, number> = {}
    items.forEach(i => {
      categoryCount[i.category] = (categoryCount[i.category] || 0) + 1
    })

    // 色系分布
    const colorFamilyCount: Record<string, number> = { neutral: 0, warm: 0, cool: 0, earth: 0 }
    items.forEach(i => {
      colorFamilyCount[i.colorFamily] = (colorFamilyCount[i.colorFamily] || 0) + 1
    })

    // 季节覆盖
    const seasonCount: Record<string, number> = { '春': 0, '夏': 0, '秋': 0, '冬': 0 }
    items.forEach(i => {
      i.seasons.forEach(s => { seasonCount[s] = (seasonCount[s] || 0) + 1 })
    })

    // 穿着频率统计
    const neverWorn = items.filter(i => i.wearCount === 0).length
    const oftenWorn = items.filter(i => i.wearCount >= 5).length

    // 找出最多的品类
    const maxCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]
    // 找出最少的品类
    const minCategory = Object.entries(categoryCount).sort((a, b) => a[1] - b[1])[0]

    return {
      total,
      categoryCount,
      colorFamilyCount,
      seasonCount,
      neverWorn,
      oftenWorn,
      maxCategory,
      minCategory
    }
  }, [items])

  // 智能建议
  const suggestions = useMemo(() => {
    if (!stats) return []
    const list: { type: 'warning' | 'tip' | 'success'; text: string }[] = []

    // 品类建议
    if (stats.minCategory[1] <= 2) {
      list.push({
        type: 'warning',
        text: `${CATEGORY_MAP[stats.minCategory[0] as keyof typeof CATEGORY_MAP]}只有${stats.minCategory[1]}件，建议补充`
      })
    }

    // 季节建议
    const minSeason = Object.entries(stats.seasonCount).sort((a, b) => a[1] - b[1])[0]
    if (minSeason[1] < stats.total * 0.15) {
      list.push({
        type: 'tip',
        text: `${minSeason[0]}季衣物较少（${minSeason[1]}件），可考虑添置`
      })
    }

    // 闲置提醒
    if (stats.neverWorn >= 3) {
      list.push({
        type: 'warning',
        text: `${stats.neverWorn}件衣物从未穿过，建议清理或重新搭配`
      })
    }

    // 高频使用
    if (stats.oftenWorn >= 5) {
      list.push({
        type: 'success',
        text: `${stats.oftenWorn}件衣物利用率很高，是衣橱核心单品`
      })
    }

    // 色彩建议
    const dominantColor = Object.entries(stats.colorFamilyCount).sort((a, b) => b[1] - a[1])[0]
    if (dominantColor[1] > stats.total * 0.5) {
      list.push({
        type: 'tip',
        text: `${dominantColor[0] === 'neutral' ? '中性色' : dominantColor[0] === 'warm' ? '暖色' : dominantColor[0] === 'cool' ? '冷色' : '大地色'}占比过高，可尝试其他色系`
      })
    }

    return list
  }, [stats])

  if (!stats) {
    return (
      <div className="px-5 pt-16 pb-8">
        <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white/75 border-b border-pri-light"
          style={{ backdropFilter: 'blur(20px)' }}>
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary">
            <ArrowLeft size={20} />
          </button>
          <span className="text-lg font-extrabold text-pri">衣橱分析</span>
          <div className="w-10" />
        </header>
        <div className="text-center py-20 text-text-muted">
          <PieChart size={48} className="mx-auto mb-4 opacity-30" />
          <p>添加衣物后查看分析</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 pt-16 pb-8">
      <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white/75 border-b border-pri-light"
        style={{ backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary">
          <ArrowLeft size={20} />
        </button>
        <span className="text-lg font-extrabold text-pri">衣橱分析</span>
        <div className="w-10" />
      </header>

      {/* 总览 */}
      <div className="glass p-5 rounded-xl mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-pri-light flex items-center justify-center">
            <TrendingUp size={24} className="text-pri" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-pri">{stats.total}</p>
            <p className="text-xs text-text-muted">总单品数</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <p className="text-lg font-bold text-ter">{stats.oftenWorn}</p>
            <p className="text-[10px] text-text-muted">高频使用</p>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <p className="text-lg font-bold text-sec">{stats.neverWorn}</p>
            <p className="text-[10px] text-text-muted">从未穿过</p>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <p className="text-lg font-bold text-pri">{CATEGORY_MAP[stats.maxCategory[0] as keyof typeof CATEGORY_MAP]}</p>
            <p className="text-[10px] text-text-muted">最多品类</p>
          </div>
        </div>
      </div>

      {/* 智能建议 */}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-pri mb-3 flex items-center gap-2">
            <Lightbulb size={16} />
            智能建议
          </h3>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className={`p-3 rounded-lg flex items-start gap-2 ${
                s.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                s.type === 'success' ? 'bg-green-50 border border-green-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <AlertCircle size={16} className={`flex-shrink-0 mt-0.5 ${
                  s.type === 'warning' ? 'text-amber-500' :
                  s.type === 'success' ? 'text-green-500' :
                  'text-blue-500'
                }`} />
                <p className={`text-xs ${
                  s.type === 'warning' ? 'text-amber-700' :
                  s.type === 'success' ? 'text-green-700' :
                  'text-blue-700'
                }`}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 品类分布 */}
      <div className="glass p-4 rounded-xl mb-4">
        <h3 className="text-sm font-bold text-pri mb-3">品类分布</h3>
        <div className="space-y-2">
          {Object.entries(stats.categoryCount).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-xs text-text-muted w-12">{CATEGORY_MAP[cat as keyof typeof CATEGORY_MAP]}</span>
              <div className="flex-1 h-2 bg-surface-high rounded-full overflow-hidden">
                <div className="h-full bg-pri rounded-full transition-all" 
                  style={{ width: `${(count / stats.total) * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-pri w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 色系分布 */}
      <div className="glass p-4 rounded-xl mb-4">
        <h3 className="text-sm font-bold text-pri mb-3">色系分布</h3>
        <div className="flex gap-2">
          {Object.entries(stats.colorFamilyCount).map(([family, count]) => {
            const labels: Record<string, string> = { neutral: '中性', warm: '暖色', cool: '冷色', earth: '大地' }
            const colors: Record<string, string> = { neutral: '#6b7280', warm: '#dc2626', cool: '#3b82f6', earth: '#92400e' }
            if (count === 0) return null
            return (
              <div key={family} className="flex-1 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: colors[family] }}>
                  {count}
                </div>
                <span className="text-[10px] text-text-muted">{labels[family]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 闲置衣物 */}
      {idleItems.length > 0 && (
        <div className="glass p-4 rounded-xl">
          <h3 className="text-sm font-bold text-pri mb-3 flex items-center gap-2">
            <Moon size={16} />
            好久不见的衣服
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{idleItems.length}件</span>
          </h3>
          <div className="space-y-3">
            {idleItems.slice(0, 5).map(({ item, days, level }) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {images[item.id] ? (
                    <img src={images[item.id]} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      {item.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  <p className="text-xs text-text-muted">
                    {days}天没穿 · {level === 'critical' ? '建议处理' : '考虑穿上'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    const outfit = generateOutfit(items, item, item.occasions?.[0] || '日常')
                    if (outfit) {
                      toast?.(`已为"${item.name}"生成搭配`, 'success')
                    }
                  }}
                  className="px-3 py-1.5 rounded-full bg-pri text-white text-xs font-bold flex items-center gap-1">
                  <RefreshCw size={12} /> 穿上它
                </button>
              </div>
            ))}
          </div>
          {idleItems.length > 5 && (
            <p className="text-xs text-text-muted text-center mt-3">
              还有 {idleItems.length - 5} 件闲置衣物
            </p>
          )}
        </div>
      )}
    </div>
  )
}
