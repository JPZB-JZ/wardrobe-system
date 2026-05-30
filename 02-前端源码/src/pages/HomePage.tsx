import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { fetchWeather } from '../utils'
import { ClothingItem, CATEGORY_MAP, WeatherInfo } from '../types'
import { Search, MapPin, Sparkles, RefreshCw, Volume2, Play, Pause } from 'lucide-react'
import { PRESET_ITEMS } from '../services/presets'
import { aiRecommendOutfits, generateVoiceRecommendation } from '../services/ai'

export default function HomePage() {
  const { items, addItem, aiConfig } = useStore()
  const navigate = useNavigate()
  const [weather, setWeather] = useState({ temp: '--', desc: '加载中' })
  const [outfits, setOutfits] = useState<any[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [voiceRecommendation, setVoiceRecommendation] = useState<{ text: string; audioUrl: string | null } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [occasion, setOccasion] = useState('')

  useEffect(() => {
    // 初始化预设数据
    if (items.length === 0) {
      PRESET_ITEMS.forEach(p => addItem(p))
    }
  }, [])

  useEffect(() => {
    fetchWeather().then(setWeather)
  }, [])

  // AI 生成搭配
  const generateAiOutfits = async () => {
    if (!aiConfig.key) {
      ;(window as any).__toast?.('请先配置 AI API Key', 'error')
      navigate('/settings')
      return
    }
    setAiLoading(true)
    const weatherInfo: WeatherInfo = { 
      temp: weather.temp, 
      desc: weather.desc,
      city: weather.desc.split('·')[0]?.trim()
    }
    const result = await aiRecommendOutfits(items, aiConfig, weatherInfo, occasion || undefined)
    if (result) {
      setOutfits(result.map((r: any) => ({
        ...r,
        items: r.itemIds.map((id: string) => items.find(i => i.id === id)).filter(Boolean)
      })))
      ;(window as any).__toast?.('AI 搭配生成完成！', 'success')
    } else {
      ;(window as any).__toast?.('AI 搭配生成失败，使用本地规则', 'error')
      // fallback 到本地规则
      const { generateOutfits } = await import('../utils')
      setOutfits(generateOutfits(items))
    }
    setAiLoading(false)
  }

  // 语音推荐
  const generateVoice = async () => {
    if (!aiConfig.key) {
      ;(window as any).__toast?.('请先配置 AI API Key', 'error')
      navigate('/settings')
      return
    }
    setVoiceLoading(true)
    const weatherInfo = { 
      temp: weather.temp, 
      desc: weather.desc,
      city: weather.desc.split('·')[0]?.trim()
    }
    const result = await generateVoiceRecommendation(items, weatherInfo, aiConfig)
    if (result) {
      setVoiceRecommendation(result)
      ;(window as any).__toast?.('语音推荐已生成', 'success')
      // 自动播放
      if (result.audioUrl) {
        const audio = new Audio(result.audioUrl)
        audioRef.current = audio
        audio.onended = () => setIsPlaying(false)
        audio.play()
        setIsPlaying(true)
      }
    } else {
      ;(window as any).__toast?.('语音生成失败', 'error')
    }
    setVoiceLoading(false)
  }

  const togglePlay = () => {
    if (!audioRef.current || !voiceRecommendation?.audioUrl) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    // 首次加载用本地规则，有 API key 后再用 AI
    if (items.length > 0 && outfits.length === 0) {
      import('../utils').then(({ generateOutfits }) => {
        setOutfits(generateOutfits(items))
      })
    }
  }, [items])

  const best = outfits[0]

  return (
    <div className="px-5 pt-16 pb-4">
      {/* 顶栏 */}
      <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white/75 border-b border-pri-light"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary">
          <Search size={18} />
        </button>
        <span className="text-lg font-extrabold text-pri">Aura Style</span>
        <div className="w-10" />
      </header>

      {/* 天气 */}
      <div className="glass flex items-center gap-3 px-4 py-3 mt-2 mb-5 cursor-pointer"
        onClick={() => navigate('/city')}>
        <span className="text-2xl font-extrabold text-pri">{weather.temp}</span>
        <span className="text-sm text-text-muted flex-1">{weather.desc}</span>
        <MapPin size={16} className="text-text-muted" />
      </div>

      {/* 语音推荐按钮 */}
      <button 
        onClick={generateVoice}
        disabled={voiceLoading || !aiConfig.key}
        className="w-full mb-4 py-4 rounded-xl bg-gradient-to-r from-pri via-sec to-ter text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-pri/20 active:scale-95 transition-transform">
        {voiceLoading ? (
          <><RefreshCw size={18} className="animate-spin" /> 生成中...</>
        ) : (
          <><Volume2 size={20} /> 🎙️ 今日智能穿搭语音推荐</>
        )}
      </button>

      {/* 语音播放控制 */}
      {voiceRecommendation && (
        <div className="glass p-4 rounded-xl mb-4 border-l-4 border-pri">
          <div className="flex items-start gap-3">
            <button 
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-pri text-white flex items-center justify-center flex-shrink-0">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div className="flex-1">
              <p className="text-sm text-text leading-relaxed">{voiceRecommendation.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* 场合选择 + AI 生成 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['', '日常', '上班', '约会', '聚会', '运动'].map(o => (
          <button key={o || 'default'}
            onClick={() => setOccasion(o)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              occasion === o 
                ? 'bg-pri text-white' 
                : 'bg-white/50 border border-surface-high text-text-secondary'
            }`}>
            {o || '全部'}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-pri mb-0.5">今日精选</h2>
          <p className="text-xs text-text-muted">{aiConfig.key ? 'AI 智能搭配' : '本地规则搭配'}</p>
        </div>
        <button 
          onClick={generateAiOutfits}
          disabled={aiLoading || !aiConfig.key}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-ter-light border border-ter-dim text-ter text-xs font-bold disabled:opacity-50">
          {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {aiLoading ? '生成中...' : 'AI 生成'}
        </button>
      </div>

      {best ? (
        <>
          {/* Hero Card */}
          <div className="glass-heavy rounded-xl overflow-hidden mb-4 relative cursor-pointer"
            onClick={() => navigate(`/item/${best.items[0]?.id}`)}>
            {best.items[0]?.image ? (
              <img src={best.items[0].image} className="w-full aspect-[4/5] object-cover" alt="" />
            ) : (
              <div className="w-full aspect-[4/5] bg-gradient-to-br from-pri-light to-ter-light" />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(250,249,251,0.95) 0%, rgba(250,249,251,0.2) 40%, rgba(250,249,251,0.2) 60%, rgba(250,249,251,0.6) 100%)' }} />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="glass px-3 py-2 flex items-center gap-2">
                <ScoreRing score={best.score} />
                <span className="text-xs font-bold text-text-secondary">搭配分</span>
              </div>
            </div>
          </div>

          {/* AI 推荐理由 */}
          {best.reason && (
            <div className="glass p-3 rounded-lg mb-4 border-l-4 border-ter">
              <p className="text-xs text-text leading-relaxed">
                <span className="text-ter font-bold">💡 </span>
                {best.reason}
              </p>
              {best.colorHarmony && (
                <p className="text-[10px] text-text-muted mt-1">{best.colorHarmony}</p>
              )}
            </div>
          )}

          {/* 搭配单品 */}
          <h3 className="text-sm font-bold text-text mb-3">搭配单品</h3>
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2">
            {best.items.map((item: ClothingItem) => (
              <div key={item.id} className="flex-shrink-0 w-16 text-center cursor-pointer"
                onClick={() => navigate(`/item/${item.id}`)}>
                <div className="w-16 h-16 rounded-full overflow-hidden glass mb-1">
                  {item.image ? <img src={item.image} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full bg-gradient-to-br from-pri-dim to-ter-dim" />}
                </div>
                <span className="text-[10px] text-text-muted line-clamp-1">{item.name}</span>
              </div>
            ))}
          </div>

          {/* 更多搭配 */}
          {outfits.length > 1 && (
            <>
              <h3 className="text-sm font-bold text-text mt-4 mb-3">更多搭配</h3>
              {outfits.slice(1).map((outfit, idx) => (
                <div key={idx} className="glass flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer">
                  <div className="flex gap-1">
                    {outfit.items.slice(0, 3).map((i: ClothingItem) => (
                      <div key={i.id} className="w-10 h-10 rounded-md overflow-hidden">
                        {i.image ? <img src={i.image} className="w-full h-full object-cover" alt="" />
                          : <div className="w-full h-full bg-gradient-to-br from-pri-dim to-ter-dim" />}
                      </div>
                    ))}
                  </div>
                  <span className="ml-auto text-sm font-extrabold text-ter">{outfit.score}</span>
                </div>
              ))}
            </>
          )}
        </>
      ) : (
        <div className="glass text-center py-12 rounded-xl">
          <div className="text-3xl mb-2">👗</div>
          <p className="text-text-muted text-sm">添加更多衣物来生成搭配</p>
        </div>
      )}
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="score-ring">
      <svg viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e8e8ea" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8e6dbf" strokeWidth="3"
          strokeDasharray={`${score} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
      </svg>
      <span className="score-ring__num">{score}</span>
    </div>
  )
}
