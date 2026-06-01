import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { fetchWeather, generateOutfits } from '../utils'
import { ClothingItem, CATEGORY_MAP, WeatherInfo } from '../types'
import { Search, MapPin, Sparkles, RefreshCw, Volume2, Play, Pause } from 'lucide-react'
import { PRESET_ITEMS } from '../services/presets'
import { aiRecommendOutfits, generateVoiceRecommendation } from '../services/ai'

export default function HomePage() {
  const { items, addItem, aiConfig, images, outfits: storeOutfits, saveOutfit, setOutfits: setStoreOutfits } = useStore()
  const navigate = useNavigate()
  const [weather, setWeather] = useState({ temp: '--', desc: '加载中' })
  const [outfits, setOutfits] = useState<any[]>(storeOutfits || [])
  const [aiLoading, setAiLoading] = useState(false)
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [voiceRecommendation, setVoiceRecommendation] = useState<{ text: string; audioUrl: string | null } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [occasion, setOccasion] = useState('')

  // 从 store 恢复 outfits，如果没有则自动生成
  useEffect(() => {
    // 先从 localStorage 直接读取（确保最新）
    const savedOutfits = JSON.parse(localStorage.getItem('aura_outfits') || '[]')
    if (savedOutfits && savedOutfits.length > 0) {
      setOutfits(savedOutfits)
    } else if (items.length > 0) {
      // 没有保存的搭配，自动生成一次
      const initialOutfits = generateOutfits(items)
      saveOutfitsToStore(initialOutfits)
    }
  }, [items])

  // 保存 outfits 到 store 和 localStorage
  const saveOutfitsToStore = (newOutfits: any[]) => {
    setOutfits(newOutfits)
    setStoreOutfits(newOutfits)
  }

  useEffect(() => {
    // 初始化预设数据
    if (items.length === 0) {
      PRESET_ITEMS.forEach(p => addItem(p))
    }
  }, [])

  useEffect(() => {
    fetchWeather().then(setWeather)
    
    // 预加载 Web Speech 语音列表
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices()
        console.log('[TTS] Loaded voices:', voices.length)
      }
      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }
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
      saveOutfitsToStore(result.map((r: any) => ({
        ...r,
        items: r.itemIds.map((id: string) => items.find(i => i.id === id)).filter(Boolean)
      })))
      ;(window as any).__toast?.('AI 搭配生成完成！', 'success')
    } else {
      ;(window as any).__toast?.('AI 搭配生成失败，使用本地规则', 'error')
      // fallback 到本地规则
      const { generateOutfits } = await import('../utils')
      saveOutfitsToStore(generateOutfits(items))
    }
    setAiLoading(false)
  }

  // 语音推荐 - 基于当前首页展示的搭配
  const generateVoice = async () => {
    if (!aiConfig.key) {
      ;(window as any).__toast?.('请先配置 AI API Key', 'error')
      navigate('/settings')
      return
    }
    if (!best) {
      ;(window as any).__toast?.('暂无搭配数据', 'error')
      return
    }
    setVoiceLoading(true)
    
    // 基于当前展示的搭配生成语音描述
    const outfitDesc = best.items.map((i: ClothingItem) => i.name).join('、')
    const weatherInfo = { temp: weather.temp, desc: weather.desc }
    
    const result = await generateVoiceRecommendation(items, weatherInfo, aiConfig)
    if (result && result.audioUrl) {
      setVoiceRecommendation(result)
      // 自动播放
      playAudio(result.audioUrl)
    } else {
      ;(window as any).__toast?.('语音生成失败', 'error')
    }
    setVoiceLoading(false)
  }

  // 统一音频播放函数
  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.onended = () => setIsPlaying(false)
    audio.play()
    setIsPlaying(true)
  }

  const togglePlay = () => {
    if (!voiceRecommendation?.audioUrl) return
    
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // 手动刷新搭配
  const refreshOutfits = () => {
    if (items.length === 0) {
      ;(window as any).__toast?.('请先添加衣物', 'error')
      return
    }
    const newOutfits = generateOutfits(items)
    saveOutfitsToStore(newOutfits)
    ;(window as any).__toast?.('搭配已刷新', 'success')
  }

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

      {/* 语音推荐按钮 - 播放中显示暂停状态 */}
      {isPlaying ? (
        <button 
          onClick={togglePlay}
          className="w-full mb-4 py-4 rounded-xl bg-gradient-to-r from-pri via-sec to-ter text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pri/20 active:scale-95 transition-transform animate-pulse">
          <Pause size={20} /> 正在播报...点击暂停
        </button>
      ) : (
        <button 
          onClick={voiceRecommendation ? togglePlay : generateVoice}
          disabled={voiceLoading || !aiConfig.key}
          className="w-full mb-4 py-4 rounded-xl bg-gradient-to-r from-pri via-sec to-ter text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-pri/20 active:scale-95 transition-transform">
          {voiceLoading ? (
            <><RefreshCw size={18} className="animate-spin" /> 生成语音中...</>
          ) : voiceRecommendation ? (
            <><Play size={20} /> 🎙️ 再听一次</>
          ) : (
            <><Volume2 size={20} /> 🎙️ 今日智能穿搭语音推荐</>
          )}
        </button>
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
        <div className="flex items-center gap-2">
          <button 
            onClick={refreshOutfits}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/50 border border-surface-high text-text-secondary text-xs font-bold disabled:opacity-50 active:scale-95 transition-transform">
            <RefreshCw size={14} /> 刷新
          </button>
          <button 
            onClick={generateAiOutfits}
            disabled={aiLoading || !aiConfig.key}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-ter-light border border-ter-dim text-ter text-xs font-bold disabled:opacity-50">
            {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {aiLoading ? '生成中...' : 'AI 生成'}
          </button>
        </div>
      </div>

      {best ? (
        <>
          {/* 搭配网格展示 - 左二(上衣+下装)右一居中(鞋子) */}
          <div className="glass-heavy rounded-xl overflow-hidden mb-4">
            <div className="flex gap-1.5 p-1.5">
              {/* 左列：上衣 + 下装 */}
              <div className="flex-1 flex flex-col gap-1.5">
                {(() => {
                  const topItem = best.items.find((i: ClothingItem) => i.category === 'top' || i.category === 'dress')
                  if (!topItem) return null
                  return (
                    <div className="relative rounded-lg overflow-hidden cursor-pointer aspect-square"
                      onClick={() => navigate(`/item/${topItem.id}`)}>
                      {(images[topItem.id] || topItem.image) ? (
                        <img src={images[topItem.id] || topItem.image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pri-light to-ter-light" />
                      )}
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/40 text-white text-[10px]">
                        {topItem.name}
                      </div>
                    </div>
                  )
                })()}
                {(() => {
                  const bottomItem = best.items.find((i: ClothingItem) => i.category === 'bottom')
                  if (!bottomItem) return null
                  return (
                    <div className="relative rounded-lg overflow-hidden cursor-pointer aspect-square"
                      onClick={() => navigate(`/item/${bottomItem.id}`)}>
                      {(images[bottomItem.id] || bottomItem.image) ? (
                        <img src={images[bottomItem.id] || bottomItem.image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pri-light to-ter-light" />
                      )}
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/40 text-white text-[10px]">
                        {bottomItem.name}
                      </div>
                    </div>
                  )
                })()}
              </div>
              {/* 右列：鞋子居中 */}
              <div className="flex-1 flex items-center">
                {(() => {
                  const shoeItem = best.items.find((i: ClothingItem) => i.category === 'shoes')
                  if (!shoeItem) return null
                  return (
                    <div className="relative rounded-lg overflow-hidden cursor-pointer aspect-square w-full"
                      onClick={() => navigate(`/item/${shoeItem.id}`)}>
                      {(images[shoeItem.id] || shoeItem.image) ? (
                        <img src={images[shoeItem.id] || shoeItem.image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pri-light to-ter-light" />
                      )}
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/40 text-white text-[10px]">
                        {shoeItem.name}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
            {/* 底部：搭配分 + AI试穿按钮 */}
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-2">
                <ScoreRing score={best.score} colors={best.items.map((i: ClothingItem) => i.color)} />
                <span className="text-xs font-bold text-text-secondary">搭配分</span>
              </div>
              <button 
                onClick={() => (window as any).__toast?.('✨ AI虚拟试穿正在内测中，敬请期待！', 'info')}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pri to-ter text-white shadow-sm active:scale-95 transition-transform">
                👗 AI虚拟试穿
              </button>
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
                  {(images[item.id] || item.image) ? <img src={images[item.id] || item.image} className="w-full h-full object-cover" alt="" />
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
                <div key={idx} 
                  className="glass flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer active:scale-95 transition-transform"
                  onClick={() => {
                    // 将点击的搭配移到第一位
                    const newOutfits = [outfit, ...outfits.filter((_, i) => i !== idx + 1)]
                    saveOutfitsToStore(newOutfits)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}>
                  <div className="flex gap-1">
                    {outfit.items.slice(0, 3).map((i: ClothingItem) => (
                      <div key={i.id} className="w-10 h-10 rounded-md overflow-hidden">
                        {(images[i.id] || i.image) ? <img src={images[i.id] || i.image} className="w-full h-full object-cover" alt="" />
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

function ScoreRing({ score, colors }: { score: number; colors?: string[] }) {
  // 使用衣物颜色生成渐变，默认使用主题色
  const gradientColors = colors && colors.length >= 2
    ? colors.slice(0, 3)
    : ['#c46d9c', '#8e6dbf']
  
  const gradientId = 'scoreGrad_' + gradientColors.join('').replace(/#/g, '')
  
  return (
    <div className="score-ring">
      <svg viewBox="0 0 36 36">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {gradientColors.map((c, i) => (
              <stop key={i} offset={`${(i / (gradientColors.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e8e8ea" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3"
          strokeDasharray={`${score} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
      </svg>
      <span className="score-ring__num">{score}</span>
    </div>
  )
}
