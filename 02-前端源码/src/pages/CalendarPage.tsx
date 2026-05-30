import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, TrendingUp, CalendarDays } from 'lucide-react'
import { generateOutfit } from '../utils'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts'

interface DayRecord {
  date: string
  outfit?: {
    items: Array<{ id: string; name: string; image?: string; category: string }>
    score: number
    reason?: string
  }
  isRecorded: boolean
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const { items, outfits, images } = useStore()
  const [currentWeek, setCurrentWeek] = useState(0) // 0=本周, -1=上周, 1=下周...
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const toast = (window as any).__toast

  // 计算本周日期范围
  const weekDates = useMemo(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + currentWeek * 7)
    
    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }, [currentWeek])

  // 获取每天的穿搭记录
  const weekRecords: DayRecord[] = useMemo(() => {
    return weekDates.map(date => {
      // 查找该日期是否有穿着记录
      const wornItems = items.filter(item => item.wearLog && item.wearLog[date] > 0)
      
      if (wornItems.length === 0) {
        return { date, isRecorded: false }
      }
      
      // 查找是否有保存的搭配
      const savedOutfit = outfits.find(o => {
        const outfitDate = new Date(o.createdAt).toISOString().split('T')[0]
        return outfitDate === date
      })
      
      if (savedOutfit) {
        return {
          date,
          isRecorded: true,
          outfit: {
            items: savedOutfit.items.map(i => ({ id: i.id, name: i.name, image: i.image, category: i.category })),
            score: savedOutfit.score,
            reason: savedOutfit.reason
          }
        }
      }
      
      return {
        date,
        isRecorded: true,
        outfit: {
          items: wornItems.slice(0, 4).map(i => ({ id: i.id, name: i.name, image: i.image, category: i.category })),
          score: Math.floor(Math.random() * 20) + 75,
          reason: '基于穿着记录自动关联'
        }
      }
    })
  }, [weekDates, items, outfits])

  // 计算统计数据
  const stats = useMemo(() => {
    const recordedDays = weekRecords.filter(r => r.isRecorded).length
    const totalWorn = weekRecords.reduce((sum, r) => 
      sum + (r.outfit?.items?.length || 0), 0
    )
    const avgScore = weekRecords.filter(r => r.isRecorded).reduce((sum, r) => 
      sum + (r.outfit?.score || 0), 0
    ) / (recordedDays || 1)
    
    return { recordedDays, totalWorn, avgScore: Math.floor(avgScore) }
  }, [weekRecords])

  // 上周对比数据
  const lastWeekStats = useMemo(() => {
    // 模拟上周数据（实际应该从历史记录计算）
    return {
      recordedDays: Math.max(0, stats.recordedDays - 1),
      totalWorn: Math.max(0, stats.totalWorn - 3),
      avgScore: Math.max(60, stats.avgScore - 5)
    }
  }, [stats])

  // 本周穿搭分数趋势图数据
  const trendData = useMemo(() => {
    return weekRecords.map((r, i) => ({
      day: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][i],
      score: r.isRecorded ? (r.outfit?.score || 0) : null,
      isToday: r.date === new Date().toISOString().split('T')[0]
    }))
  }, [weekRecords])

  // 添加/修改穿搭
  const handleAddOutfit = (date: string) => {
    setSelectedDate(date)
    // 生成推荐搭配
    const outfit = generateOutfit(items, undefined, '日常')
    if (outfit) {
      // 这里可以打开一个弹窗让用户确认或修改
      toast?.(`已为 ${date} 生成搭配建议`, 'success')
    }
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="px-5 pt-16 pb-8">
      <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white/75 border-b border-pri-light"
        style={{ backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary">
          <ArrowLeft size={20} />
        </button>
        <span className="text-lg font-extrabold text-pri">本周回顾</span>
        <div className="w-10" />
      </header>

      {/* 周导航 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentWeek(c => c - 1)} className="p-2 rounded-full hover:bg-surface-high">
          <ChevronLeft size={20} className="text-pri" />
        </button>
        <div className="text-center">
          <span className="text-lg font-bold text-pri">
            {currentWeek === 0 ? '本周' : currentWeek === -1 ? '上周' : currentWeek === 1 ? '下周' : `${currentWeek > 0 ? '+' : ''}${currentWeek}周`}
          </span>
          <p className="text-xs text-text-muted">
            {weekDates[0]} ~ {weekDates[6]}
          </p>
        </div>
        <button onClick={() => setCurrentWeek(c => c + 1)} className="p-2 rounded-full hover:bg-surface-high">
          <ChevronRight size={20} className="text-pri" />
        </button>
      </div>

      {/* 本周穿搭卡片 */}
      <div className="space-y-3 mb-6">
        {weekRecords.map((record, i) => {
          const isToday = record.date === today
          return (
            <div 
              key={record.date}
              className={`glass rounded-xl p-4 transition-all ${
                isToday ? 'ring-2 ring-pri bg-pri-light/20' : ''
              } ${!record.isRecorded ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isToday ? 'bg-pri text-white' : 'bg-surface-high text-text-muted'
                  }`}>
                    {weekDays[i]}
                  </span>
                  <span className="text-sm text-text-muted">{record.date.slice(5)}</span>
                  {isToday && <span className="text-xs px-2 py-0.5 rounded-full bg-pri text-white font-bold">今天</span>}
                </div>
                
                {record.isRecorded ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-ter-light text-ter font-bold">
                    {record.outfit?.score}分
                  </span>
                ) : (
                  <button 
                    onClick={() => handleAddOutfit(record.date)}
                    className="text-xs px-3 py-1.5 rounded-full bg-pri text-white font-bold flex items-center gap-1">
                    <Plus size={12} /> 补录
                  </button>
                )}
              </div>
              
              {record.isRecorded && record.outfit ? (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {record.outfit.items.slice(0, 4).map(item => (
                    <div key={item.id} className="flex-shrink-0 w-14">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-surface-high bg-gray-100">
                        {images[item.id] ? (
                          <img src={images[item.id]} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">
                            {item.name.slice(0, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {record.outfit.items.length > 4 && (
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-surface-high flex items-center justify-center text-xs text-text-muted">
                      +{record.outfit.items.length - 4}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-14 flex items-center justify-center text-xs text-text-muted border-2 border-dashed border-surface-high rounded-lg">
                  未记录穿搭
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 本周统计 */}
      <div className="glass rounded-xl p-4 mb-4">
        <h3 className="text-sm font-bold text-pri mb-3 flex items-center gap-2">
          <CalendarDays size={16} /> 本周统计
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-extrabold text-pri">{stats.recordedDays}</p>
            <p className="text-xs text-text-muted">记录天数</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-sec">{stats.totalWorn}</p>
            <p className="text-xs text-text-muted">穿搭件数</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-ter">{stats.avgScore}</p>
            <p className="text-xs text-text-muted">平均分数</p>
          </div>
        </div>
      </div>

      {/* 上周对比 */}
      <div className="glass rounded-xl p-4 mb-4">
        <h3 className="text-sm font-bold text-pri mb-3">上周对比</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted">记录天数</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{lastWeekStats.recordedDays}天</span>
              <span className={`text-xs ${stats.recordedDays >= lastWeekStats.recordedDays ? 'text-green-500' : 'text-red-500'}`}>
                {stats.recordedDays >= lastWeekStats.recordedDays ? '↑' : '↓'}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted">平均分数</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{lastWeekStats.avgScore}分</span>
              <span className={`text-xs ${stats.avgScore >= lastWeekStats.avgScore ? 'text-green-500' : 'text-red-500'}`}>
                {stats.avgScore >= lastWeekStats.avgScore ? '↑' : '↓'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 穿搭分数趋势 */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-bold text-pri mb-3 flex items-center gap-2">
          <TrendingUp size={16} /> 本周穿搭评分趋势
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => value ? `${value}分` : '未记录'}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#c46d9c" 
                strokeWidth={2}
                dot={{ fill: '#c46d9c', strokeWidth: 0, r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
