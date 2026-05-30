import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { CATEGORY_MAP } from '../types'
import { Download, Upload, Trash2, Shield, PieChart, Sparkles, Calendar, Edit3, CheckCircle, Palette, Bell } from 'lucide-react'
import { saveApiKey, loadApiKey, maskApiKey } from '../services/crypto'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, initTheme } from '../services/theme'
import { requestNotificationPermission, hasNotificationPermission } from '../services/idleReminder'

export default function SettingsPage() {
  const { items, aiConfig, setAiConfig, exportData, importData, clearAllData } = useStore()
  const navigate = useNavigate()
  const toast = (window as any).__toast
  const [key, setKey] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [savedKeyMask, setSavedKeyMask] = useState('')
  const [notifEnabled, setNotifEnabled] = useState(hasNotificationPermission())
  
  // 主题
  const { theme, toggleTheme } = useThemeStore()

  // 固定使用 mimo-v2.5
  const model = 'mimo-v2.5'

  // 加载已保存的 key
  useEffect(() => {
    loadApiKey().then(k => {
      if (k) setSavedKeyMask(maskApiKey(k))
    })
    initTheme()
  }, [])

  const totalValue = items.reduce((s, i) => s + (i.price || 0), 0)
  const totalWear = items.reduce((s, i) => s + i.wearCount, 0)

  // 品类统计
  const catStats: Record<string, number> = {}
  items.forEach(i => { const k = CATEGORY_MAP[i.category]; catStats[k] = (catStats[k] || 0) + 1 })

  const saveAi = async () => {
    if (!key) { toast?.('请输入 API Key', 'error'); return }
    // 加密存储 key
    await saveApiKey(key)
    // Store 里存 key（内存中）和 model
    setAiConfig({ key, model })
    setSavedKeyMask(maskApiKey(key))
    setKey('')
    setIsEditing(false)
    toast?.('AI 配置已保存', 'success')
  }

  const startEdit = () => {
    setIsEditing(true)
    setKey('')
  }

  const handleExport = async () => {
    const data = await exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'aura-style-backup.json'
    a.click()
    toast?.('导出成功（含图片）')
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target!.result as string)
        if (data.items && data.images) {
          await importData(data)
          toast?.('导入成功', 'success')
          window.location.reload()
        }
      } catch { toast?.('导入失败', 'error') }
    }
    reader.readAsText(file)
  }

  const handleReset = async () => {
    if (confirm('确定清除所有数据？此操作不可撤销！')) {
      await clearAllData()
      window.location.reload()
    }
  }
  
  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission()
    setNotifEnabled(granted)
    if (granted) {
      toast?.('通知权限已开启', 'success')
    } else {
      toast?.('请手动开启通知权限', 'error')
    }
  }

  return (
    <div className="px-5 pt-16 pb-4">
      <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-center px-4 bg-white/75 border-b border-pri-light"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <span className="text-lg font-extrabold text-pri">设置</span>
      </header>

      {/* 统计 */}
      <h2 className="text-sm font-bold text-pri mt-2 mb-3">衣橱概览</h2>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Stat value={items.length} label="衣物总数" />
        <Stat value={`¥${totalValue}`} label="总价值" />
        <Stat value={totalWear} label="穿着次数" />
        <Stat value={items.length ? Math.round(totalWear / items.length) : 0} label="平均每件" />
      </div>

      {/* 品类分布 */}
      <div className="glass rounded-xl p-4 mb-4">
        <h3 className="text-xs font-bold text-pri mb-3">品类分布</h3>
        {Object.entries(catStats).map(([cat, count]) => {
          const pct = items.length ? Math.round(count / items.length * 100) : 0
          return (
            <div key={cat} className="flex items-center gap-2 mb-2">
              <span className="w-10 text-xs font-semibold">{cat}</span>
              <div className="flex-1 h-2 rounded-full bg-surface-high overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-pri to-ter transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-[10px] text-text-muted text-right">{pct}%</span>
            </div>
          )
        })}
      </div>

      {/* AI 配置 */}
      <div className="glass rounded-xl p-4 mb-4">
        <h3 className="text-xs font-bold text-pri mb-3">🤖 AI 配置（小米 MiMo）</h3>
        
        {!isEditing && savedKeyMask ? (
          // 已配置状态
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              <span className="text-sm font-medium text-text">AI 已配置成功</span>
            </div>
            <button 
              onClick={startEdit}
              className="p-2 rounded-full hover:bg-surface-high text-text-muted transition-colors"
              title="修改 API Key">
              <Edit3 size={16} />
            </button>
          </div>
        ) : (
          // 编辑状态
          <>
            <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">MiMo API Key</label>
            <input
              type="password"
              className="w-full px-3 py-2.5 rounded-xl border border-surface-high bg-white/70 text-sm outline-none focus:border-pri-dim mb-3"
              value={key} 
              onChange={e => setKey(e.target.value)} 
              placeholder="输入 MiMo API Key..." />
            <button onClick={saveAi} className="btn-pri w-full text-sm">保存</button>
            {savedKeyMask && (
              <button 
                onClick={() => setIsEditing(false)}
                className="w-full text-center text-xs text-text-muted mt-2 py-1">
                取消修改
              </button>
            )}
          </>
        )}
        
        {savedKeyMask && !isEditing && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-surface-high/50">
            <Shield size={12} className="text-pri" />
            <p className="text-[10px] text-text-muted">{savedKeyMask}</p>
          </div>
        )}
      </div>

      {/* 主题切换 */}
      <div className="glass rounded-xl p-4 mb-4">
        <h3 className="text-xs font-bold text-pri mb-3 flex items-center gap-2">
          <Palette size={14} /> 主题风格
        </h3>
        <div className="flex gap-3">
          <button 
            onClick={() => theme !== 'soft' && toggleTheme()}
            className={`flex-1 py-3 rounded-xl border-2 transition-all ${
              theme === 'soft' 
                ? 'border-pri bg-pri-light/30' 
                : 'border-surface-high bg-white/50'
            }`}>
            <p className="text-sm font-bold">柔粉紫</p>
            <p className="text-[10px] text-text-muted">温暖柔和</p>
          </button>
          <button 
            onClick={() => theme !== 'minimal' && toggleTheme()}
            className={`flex-1 py-3 rounded-xl border-2 transition-all ${
              theme === 'minimal' 
                ? 'border-[#007aff] bg-[#e6f2ff]' 
                : 'border-surface-high bg-white/50'
            }`}>
            <p className="text-sm font-bold">科技蓝</p>
            <p className="text-[10px] text-text-muted">简约科技</p>
          </button>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="glass rounded-xl p-4 mb-4">
        <h3 className="text-xs font-bold text-pri mb-3 flex items-center gap-2">
          <Bell size={14} /> 闲置提醒
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">衣物闲置通知</p>
            <p className="text-[10px] text-text-muted">30天未穿自动提醒</p>
          </div>
          <button 
            onClick={handleRequestNotif}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              notifEnabled 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
            {notifEnabled ? '已开启' : '开启'}
          </button>
        </div>
      </div>

      {/* 智能功能 */}
      <div className="glass rounded-xl p-4 mb-4">
        <h3 className="text-xs font-bold text-pri mb-3">智能功能</h3>
        <button onClick={() => navigate('/analysis')} className="flex items-center gap-3 py-3 w-full text-left border-b border-surface-high">
          <div className="w-8 h-8 rounded-lg bg-ter-light flex items-center justify-center"><PieChart size={16} className="text-ter" /></div>
          <div><div className="text-sm font-semibold">衣橱分析</div><div className="text-[10px] text-text-muted">智能洞察与建议</div></div>
        </button>
        <button onClick={() => navigate('/calendar')} className="flex items-center gap-3 py-3 w-full text-left border-b border-surface-high">
          <div className="w-8 h-8 rounded-lg bg-pri-light flex items-center justify-center"><Calendar size={16} className="text-pri" /></div>
          <div><div className="text-sm font-semibold">穿搭日历</div><div className="text-[10px] text-text-muted">规划每日穿搭</div></div>
        </button>
        <button onClick={() => navigate('/')} className="flex items-center gap-3 py-3 w-full text-left">
          <div className="w-8 h-8 rounded-lg bg-sec-light flex items-center justify-center"><Sparkles size={16} className="text-sec" /></div>
          <div><div className="text-sm font-semibold">AI 搭配</div><div className="text-[10px] text-text-muted">生成今日推荐</div></div>
        </button>
      </div>

      {/* 数据管理 */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-bold text-pri mb-3">数据管理</h3>
        <button onClick={handleExport} className="flex items-center gap-3 py-3 w-full text-left border-b border-surface-high">
          <Download size={18} className="text-text-secondary" />
          <span className="text-sm font-medium">导出数据（含图片）</span>
        </button>
        <label className="flex items-center gap-3 py-3 w-full text-left border-b border-surface-high cursor-pointer">
          <Upload size={18} className="text-text-secondary" />
          <span className="text-sm font-medium">导入数据</span>
          <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
        </label>
        <button onClick={handleReset} className="flex items-center gap-3 py-3 w-full text-left text-red-500">
          <Trash2 size={18} />
          <span className="text-sm font-medium">清除所有数据</span>
        </button>
      </div>
      <div className="glass rounded-xl p-4 mb-4">
        <h3 className="text-xs font-bold text-pri mb-3">数据管理</h3>
        <button onClick={exportData} className="flex items-center gap-3 py-3 w-full text-left border-b border-surface-high">
          <div className="w-8 h-8 rounded-lg bg-pri-light flex items-center justify-center"><Download size={16} className="text-pri" /></div>
          <div><div className="text-sm font-semibold">导出数据</div><div className="text-[10px] text-text-muted">备份为 JSON</div></div>
        </button>
        <label className="flex items-center gap-3 py-3 w-full cursor-pointer border-b border-surface-high">
          <div className="w-8 h-8 rounded-lg bg-pri-light flex items-center justify-center"><Upload size={16} className="text-pri" /></div>
          <div><div className="text-sm font-semibold">导入数据</div><div className="text-[10px] text-text-muted">从备份恢复</div></div>
          <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
        </label>
        <button onClick={handleReset} className="flex items-center gap-3 py-3 w-full text-left">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><Trash2 size={16} className="text-red-500" /></div>
          <div><div className="text-sm font-semibold text-red-500">重置数据</div><div className="text-[10px] text-text-muted">清除所有衣物</div></div>
        </button>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <div className="text-xl font-extrabold text-pri">{value}</div>
      <div className="text-[10px] text-text-muted mt-0.5">{label}</div>
    </div>
  )
}