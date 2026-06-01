import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import {
  Category, CATEGORY_MAP, OCCASIONS, COLORS, STYLES,
  SEASONS, FABRICS, PATTERNS, Style, Occasion, Season, Fabric, Pattern, ColorFamily, ColorInfo
} from '../types'
import { compressImage, genId } from '../utils'
import { recognizeClothing } from '../services/ai'
import { ArrowLeft, Camera, Sparkles, Loader2, PenLine, Wand2 } from 'lucide-react'
import clsx from 'clsx'

export default function AddItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, addItem, updateItem, aiConfig } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const toast = (window as any).__toast

  const existing = id ? items.find(i => i.id === id) : null

  // 模式选择：'choose' | 'ai' | 'manual'
  const [mode, setMode] = useState<'choose' | 'ai' | 'manual'>(existing ? 'manual' : 'choose')

  // 基本信息
  const [name, setName] = useState(existing?.name || '')
  const [brand, setBrand] = useState(existing?.brand || '')
  const [price, setPrice] = useState(existing?.price?.toString() || '')
  const [image, setImage] = useState(existing?.image || '')
  // 分类
  const [category, setCategory] = useState<Category>(existing?.category || 'top')
  // 外观
  const [color, setColor] = useState(existing?.color || '#1a1c1d')
  const [colorName, setColorName] = useState(existing?.colorName || '黑')
  const [colorFamily, setColorFamily] = useState<ColorFamily>(existing?.colorFamily || 'neutral')
  const [pattern, setPattern] = useState<Pattern>(existing?.pattern || '纯色')
  // 材质
  const [fabric, setFabric] = useState<Fabric>(existing?.fabric || '棉')
  const [thickness, setThickness] = useState(existing?.thickness || 3)
  // 风格
  const [styles, setStyles] = useState<Style[]>(existing?.styles || ['休闲'])
  const [occasions, setOccasions] = useState<Occasion[]>(existing?.occasions || ['日常'])
  const [seasons, setSeasons] = useState<Season[]>(existing?.seasons || ['春', '秋'])
  const [formality, setFormality] = useState<1|2|3|4|5>(existing?.formality || 3)
  // 温度
  const [tempMin, setTempMin] = useState(existing?.tempMin?.toString() || '10')
  const [tempMax, setTempMax] = useState(existing?.tempMax?.toString() || '28')
  // AI
  const [aiLoading, setAiLoading] = useState(false)
  // 追踪 AI 识别填充的字段
  const [aiFilled, setAiFilled] = useState<Set<string>>(new Set())
  // 展开状态
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setImage(compressed)
    
    // 检测相似衣物
    checkSimilarItems(compressed)
  }

  // 相似衣物检测
  const [similarItems, setSimilarItems] = useState<typeof items>([])
  const checkSimilarItems = (imgBase64: string) => {
    // 必须有实际图片数据才检测
    if (!imgBase64 || imgBase64.length < 100) return
    
    const potentialMatches = items.filter(item => {
      if (item.category !== category) return false
      if (item.colorFamily !== colorFamily) return false
      if (item.pattern !== pattern) return false
      return true
    })
    
    if (potentialMatches.length > 0) {
      setSimilarItems(potentialMatches.slice(0, 3))
      toast?.(`检测到 ${potentialMatches.length} 件相似衣物`, 'warning')
    }
  }

  // AI 识别
  const handleAiRecognize = async () => {
    if (!image) { toast?.('请先上传照片', 'error'); return }
    if (!aiConfig.key) { toast?.('请先在设置中配置 API Key', 'error'); return }
    setAiLoading(true)
    try {
      const result = await recognizeClothing(image, aiConfig)
      if (result) {
        const filled = new Set<string>()
        if (result.name) { setName(result.name); filled.add('name') }
        if (result.brand) { setBrand(result.brand); filled.add('brand') }
        if (result.category) { setCategory(result.category); filled.add('category') }
        if (result.color) {
          const matchedColor = findClosestColor(result.color, result.colorName)
          setColor(matchedColor.hex)
          setColorName(matchedColor.name)
          filled.add('color')
        }
        if (result.colorFamily) { setColorFamily(result.colorFamily); filled.add('color') }
        if (result.pattern) { setPattern(result.pattern); filled.add('pattern') }
        if (result.fabric) { setFabric(result.fabric); filled.add('fabric') }
        if (result.thickness) { setThickness(result.thickness); filled.add('thickness') }
        if (result.styles?.length) { setStyles(result.styles); filled.add('styles') }
        if (result.occasions?.length) { setOccasions(result.occasions); filled.add('occasions') }
        if (result.seasons?.length) { setSeasons(result.seasons); filled.add('seasons') }
        if (result.formality) { setFormality(result.formality); filled.add('formality') }
        if (result.tempMin !== undefined) { setTempMin(result.tempMin.toString()); filled.add('temp') }
        if (result.tempMax !== undefined) { setTempMax(result.tempMax.toString()); filled.add('temp') }
        setAiFilled(filled)
        toast?.(`AI 识别完成！已填充 ${filled.size} 个属性`, 'success')
      } else {
        toast?.('AI 识别失败', 'error')
      }
    } finally {
      setAiLoading(false)
    }
  }

  // 颜色智能匹配
  function findClosestColor(aiHex: string, aiName: string): ColorInfo {
    // 先按名字匹配
    const byName = COLORS.find(c => 
      aiName.includes(c.name) || c.name.includes(aiName)
    )
    if (byName) return byName
    
    // 按 hex 匹配
    const byHex = COLORS.find(c => c.hex.toLowerCase() === aiHex.toLowerCase())
    if (byHex) return byHex
    
    // 根据名字关键词推测
    if (aiName.includes('黑')) return COLORS.find(c => c.name === '黑')!
    if (aiName.includes('白')) return COLORS.find(c => c.name === '白')!
    if (aiName.includes('灰')) return COLORS.find(c => c.name === '灰')!
    if (aiName.includes('红')) return COLORS.find(c => c.name === '红')!
    if (aiName.includes('蓝')) return COLORS.find(c => c.name === '藏青')!
    if (aiName.includes('米') || aiName.includes('杏')) return COLORS.find(c => c.name === '米白')!
    if (aiName.includes('驼') || aiName.includes('棕')) return COLORS.find(c => c.name === '驼色')!
    
    return COLORS.find(c => c.name === '藏青')!
  }

  const handleSave = () => {
    if (!name) { toast?.('请输入名称', 'error'); return }
    const item = {
      id: existing?.id || genId(),
      name,
      category,
      color,
      colorName,
      colorFamily,
      pattern,
      fabric,
      thickness,
      styles,
      occasions,
      seasons,
      formality,
      tempMin: parseInt(tempMin) || 10,
      tempMax: parseInt(tempMax) || 28,
      brand,
      price: parseInt(price) || 0,
      image,
      fav: existing?.fav || false,
      wearCount: existing?.wearCount || 0,
      lastWorn: existing?.lastWorn || 0,
      wearLog: existing?.wearLog || {},
      createdAt: existing?.createdAt || Date.now()
    }
    if (existing) updateItem(item)
    else addItem(item)
    toast?.('保存成功！', 'success')
    navigate('/wardrobe')
  }

  const toggleExpand = (key: string) => {
    const next = new Set(expanded)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setExpanded(next)
  }

  const isExpanded = (key: string) => expanded.has(key)

  // 判断是否应该显示某个类目
  const shouldShowCategory = (categoryKey: string, hasSelection: boolean) => {
    // 如果已选择或者是 AI 填充的，或者是展开的，或者是编辑模式，都显示
    if (hasSelection) return true
    if (aiFilled.has(categoryKey)) return true
    if (isExpanded(categoryKey)) return true
    if (existing) return true
    return false
  }

  // 判断是否应该显示某个选项
  const shouldShowOption = (categoryKey: string, isSelected: boolean) => {
    if (isSelected) return true
    if (isExpanded(categoryKey)) return true
    return false
  }

  // ===== 模式选择界面 =====
  if (mode === 'choose') {
    return (
      <div className="min-h-screen bg-surface">
        <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-center px-4 bg-white/75 border-b border-pri-light"
          style={{ backdropFilter: 'blur(20px)' }}>
          <span className="text-lg font-extrabold text-pri">添加衣物</span>
        </header>

        <div className="pt-20 px-6 pb-8">
          <p className="text-sm text-text-muted mb-8 text-center">选择添加方式</p>
          
          {/* AI 识别选项 */}
          <button 
            onClick={() => setMode('ai')}
            className="w-full mb-4 p-6 rounded-2xl bg-white border-2 border-pri/20 hover:border-pri transition-all text-left group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pri to-sec flex items-center justify-center text-white shadow-lg shadow-pri/20">
                <Wand2 size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-text mb-1">AI 智能识别</h3>
                <p className="text-xs text-text-muted">拍照上传，AI 自动识别颜色、品类、面料等所有属性</p>
              </div>
              <Sparkles size={20} className="text-pri opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          {/* 手动输入选项 */}
          <button 
            onClick={() => setMode('manual')}
            className="w-full p-6 rounded-2xl bg-white border-2 border-surface-high hover:border-ter transition-all text-left group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-ter to-sec flex items-center justify-center text-white shadow-lg shadow-ter/20">
                <PenLine size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-text mb-1">手动输入</h3>
                <p className="text-xs text-text-muted">逐项填写衣物的详细信息和属性</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // ===== AI 识别界面 =====
  if (mode === 'ai') {
    return (
      <div className="min-h-screen bg-surface">
        <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white/75 border-b border-pri-light"
          style={{ backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setMode('choose')} className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary">
            <ArrowLeft size={20} />
          </button>
          <span className="text-lg font-extrabold text-pri">AI 智能识别</span>
          <button onClick={() => setMode('manual')} className="text-xs text-pri font-bold">手动输入</button>
        </header>

        <div className="pt-16 px-5 pb-8">
          {/* 照片上传 */}
          <div className="mb-6">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <div 
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-pri/30 bg-white/50 flex flex-col items-center justify-center cursor-pointer hover:border-pri hover:bg-pri-light/30 transition-all">
              {image ? (
                <img src={image} className="w-full h-full object-contain rounded-2xl" alt="preview" />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-pri/10 flex items-center justify-center mb-3">
                    <Camera size={32} className="text-pri" />
                  </div>
                  <p className="text-sm font-bold text-text mb-1">点击拍照或选择照片</p>
                  <p className="text-xs text-text-muted">AI 将自动识别衣物属性</p>
                </>
              )}
            </div>
          </div>

          {/* AI 识别按钮 */}
          {image && (
            <button 
              onClick={handleAiRecognize}
              disabled={aiLoading || !aiConfig.key}
              className="w-full mb-6 py-4 rounded-xl bg-gradient-to-r from-pri to-sec text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-pri/20">
              {aiLoading ? (
                <><Loader2 size={18} className="animate-spin" /> 识别中...</>
              ) : (
                <><Sparkles size={18} /> AI 一键识别</>
              )}
            </button>
          )}

          {/* 识别结果预览（简化显示） */}
          {aiFilled.size > 0 && (
            <div className="glass p-4 rounded-xl mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-pri">识别结果</h3>
                <span className="text-xs text-ter font-bold">已识别 {aiFilled.size} 项</span>
              </div>
              <div className="space-y-2 text-sm">
                {name && <p><span className="text-text-muted">名称：</span>{name}</p>}
                {category && <p><span className="text-text-muted">品类：</span>{CATEGORY_MAP[category]}</p>}
                {colorName && <p><span className="text-text-muted">颜色：</span>{colorName}</p>}
                {pattern && <p><span className="text-text-muted">图案：</span>{pattern}</p>}
                {fabric && <p><span className="text-text-muted">面料：</span>{fabric}</p>}
              </div>
              <button 
                onClick={() => setMode('manual')}
                className="w-full mt-4 py-3 rounded-xl bg-pri text-white font-bold text-sm">
                确认并完善信息 →
              </button>
            </div>
          )}

          {!aiConfig.key && (
            <div className="text-center py-8">
              <p className="text-sm text-text-muted mb-3">未配置 AI API Key</p>
              <button 
                onClick={() => navigate('/settings')}
                className="px-5 py-2 rounded-full bg-pri text-white text-sm font-bold">
                去设置
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ===== 手动输入界面（完整表单） =====
  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white/75 border-b border-pri-light"
        style={{ backdropFilter: 'blur(20px)' }}>
        <button onClick={() => existing ? navigate(-1) : setMode('choose')} className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary">
          <ArrowLeft size={20} />
        </button>
        <span className="text-lg font-extrabold text-pri">{existing ? '编辑衣物' : '手动输入'}</span>
        <div className="w-10" />
      </header>

      <div className="pt-16 px-5 pb-8 space-y-4">
        {/* 照片 */}
        <Section title="照片">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <div onClick={() => fileRef.current?.click()}
            className="w-full aspect-video rounded-xl border-2 border-dashed border-surface-high bg-white/50 flex items-center justify-center cursor-pointer hover:border-pri transition-colors overflow-hidden">
            {image ? <img src={image} className="w-full h-full object-cover" alt="" />
              : <Camera size={32} className="text-text-muted" />}
          </div>
        </Section>

        {/* 相似衣物提醒 */}
        {similarItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700 mb-2">⚠️ 检测到相似衣物</p>
            <div className="flex gap-2">
              {similarItems.map(item => (
                <div key={item.id} className="w-12 h-12 rounded-lg overflow-hidden border border-amber-200">
                  {item.image ? <img src={item.image} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full bg-amber-100" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 基本信息 */}
        <Section title="基本信息" aiFilled={aiFilled.has('name')} onExpand={() => toggleExpand('name')} isExpanded={isExpanded('name')}>
          <Field label="名称">
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="如：白色衬衫" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="品牌">
              <input className="input-field" value={brand} onChange={e => setBrand(e.target.value)} placeholder="品牌" />
            </Field>
            <Field label="价格">
              <input className="input-field" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="¥" />
            </Field>
          </div>
        </Section>

        {/* 分类 */}
        <Section title="分类" aiFilled={aiFilled.has('category')} onExpand={() => toggleExpand('category')} isExpanded={isExpanded('category')}>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_MAP) as Category[]).map(c => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)} aiFilled={aiFilled.has('category') && category === c}>
                {CATEGORY_MAP[c]}
              </Chip>
            ))}
          </div>
        </Section>

        {/* 外观 */}
        {shouldShowCategory('color', !!(color && colorName)) && (
        <Section title="外观" aiFilled={aiFilled.has('color')} onExpand={() => toggleExpand('color')} isExpanded={isExpanded('color')}>
          <div className="mb-3">
            <label className="text-[10px] font-bold text-text-muted uppercase mb-2 block">颜色</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c.name} onClick={() => { setColor(c.hex); setColorName(c.name); setColorFamily(c.family) }}
                  className={clsx(
                    'w-10 h-10 rounded-full border-2 transition-all relative',
                    color === c.hex ? 'border-pri scale-110 shadow-md' : 'border-transparent'
                  )}
                  style={{ background: c.hex }}>
                  {color === c.hex && <span className="absolute inset-0 flex items-center justify-center text-white text-lg">✓</span>}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">{colorName}</p>
          </div>
          <div className="mb-2">
            <label className="text-[10px] font-bold text-text-muted uppercase mb-2 block">图案</label>
            <div className="flex flex-wrap gap-2">
              {PATTERNS.map(p => (
                <Chip key={p} active={pattern === p} onClick={() => setPattern(p)} aiFilled={aiFilled.has('pattern') && pattern === p}>
                  {p}
                </Chip>
              ))}
            </div>
          </div>
        </Section>
        )}

        {/* 材质 */}
        {shouldShowCategory('fabric', !!(fabric && thickness)) && (
        <Section title="材质" aiFilled={aiFilled.has('fabric')} onExpand={() => toggleExpand('fabric')} isExpanded={isExpanded('fabric')}>
          <div className="mb-3">
            <label className="text-[10px] font-bold text-text-muted uppercase mb-2 block">面料</label>
            <div className="flex flex-wrap gap-2">
              {FABRICS.map(f => (
                <Chip key={f} active={fabric === f} onClick={() => setFabric(f)} aiFilled={aiFilled.has('fabric') && fabric === f}>
                  {f}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase mb-2 block">厚度 {thickness}/5</label>
            <input type="range" min={1} max={5} value={thickness} onChange={e => setThickness(parseInt(e.target.value) as 1|2|3|4|5)}
              className="w-full accent-pri" />
          </div>
        </Section>
        )}

        {/* 风格 */}
        {shouldShowCategory('styles', styles.length > 0) && (
        <Section title="风格" aiFilled={aiFilled.has('styles')} onExpand={() => toggleExpand('styles')} isExpanded={isExpanded('styles')}>
          <div className="flex flex-wrap gap-2 mb-3">
            {STYLES.map(s => (
              <Chip key={s} active={styles.includes(s)} onClick={() => {
                setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
              }} aiFilled={aiFilled.has('styles') && styles.includes(s)}>
                {s}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map(o => (
              <Chip key={o} active={occasions.includes(o)} onClick={() => {
                setOccasions(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o])
              }} aiFilled={aiFilled.has('occasions') && occasions.includes(o)}>
                {o}
              </Chip>
            ))}
          </div>
        </Section>
        )}

        {/* 季节 */}
        {shouldShowCategory('seasons', seasons.length > 0) && (
        <Section title="季节" aiFilled={aiFilled.has('seasons')} onExpand={() => toggleExpand('seasons')} isExpanded={isExpanded('seasons')}>
          <div className="flex gap-2">
            {SEASONS.map(s => (
              <Chip key={s} active={seasons.includes(s)} onClick={() => {
                setSeasons(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
              }} aiFilled={aiFilled.has('seasons') && seasons.includes(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </Section>
        )}

        {/* 温度范围 */}
        {shouldShowCategory('temp', !!(tempMin || tempMax)) && (
        <Section title="适用温度" aiFilled={aiFilled.has('temp')} onExpand={() => toggleExpand('temp')} isExpanded={isExpanded('temp')}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="最低温度 °C">
              <input className="input-field" type="number" value={tempMin} onChange={e => setTempMin(e.target.value)} />
            </Field>
            <Field label="最高温度 °C">
              <input className="input-field" type="number" value={tempMax} onChange={e => setTempMax(e.target.value)} />
            </Field>
          </div>
        </Section>
        )}

        <button onClick={handleSave} className="btn-pri w-full mt-4">💾 保存衣物</button>
      </div>
    </div>
  )
}

function Section({ title, children, aiFilled, onExpand, isExpanded }: { 
  title: string; 
  children: React.ReactNode;
  aiFilled?: boolean;
  onExpand?: () => void;
  isExpanded?: boolean;
}) {
  return (
    <div className="border-b border-surface-high pb-4 last:border-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-pri uppercase tracking-wider flex items-center gap-1.5">
          {title}
          {aiFilled && (
            <span className="px-1.5 py-0.5 bg-ter text-white rounded text-[8px] font-bold">AI</span>
          )}
        </h3>
        {aiFilled && onExpand && (
          <button onClick={onExpand} className="text-[10px] text-pri font-bold flex items-center gap-0.5">
            {isExpanded ? '收起' : '展开'}
            <span className="transform transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

function Chip({ children, active, onClick, aiFilled }: { children: React.ReactNode; active: boolean; onClick: () => void; aiFilled?: boolean }) {
  return (
    <button onClick={onClick}
      className={clsx(
        'inline-flex items-center px-3 py-2 rounded-full text-xs font-bold transition-all border relative',
        active
          ? aiFilled
            ? 'bg-gradient-to-r from-pri to-sec border-pri text-white shadow-md ring-2 ring-pri ring-offset-1'
            : 'bg-gradient-to-r from-pri-light to-ter-light border-pri-dim text-pri shadow-sm'
          : 'bg-white/50 border-surface-high text-text-secondary'
      )}>
      {children}
      {aiFilled && active && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-ter text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm">AI</span>
      )}
    </button>
  )
}
