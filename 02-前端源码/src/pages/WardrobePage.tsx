import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { CATEGORY_MAP, Category } from '../types'
import { useState, useEffect } from 'react'
import { Heart, Plus, Search, Moon } from 'lucide-react'
import clsx from 'clsx'
import { getIdleStatus } from '../services/idleReminder'

const CATS: [string, string][] = [['全部', 'all'], ...Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k] as [string, string])]

// 衣物卡片图片组件（支持骨架屏）
function ItemImage({ itemId }: { itemId: string }) {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { loadItemImage } = useStore()

  useEffect(() => {
    let mounted = true
    loadItemImage(itemId).then(img => {
      if (mounted) {
        setImage(img)
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [itemId])

  if (loading) {
    return (
      <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse rounded-lg" />
    )
  }

  if (!image) {
    return (
      <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-400 text-xs">无图片</span>
      </div>
    )
  }

  return (
    <img 
      src={image} 
      className="w-full aspect-[3/4] object-cover rounded-lg" 
      alt=""
      loading="lazy"
    />
  )
}

export default function WardrobePage() {
  const { items, toggleFav, images, isLoading } = useStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  return (
    <div className="px-5 pt-16 pb-4">
      {/* 顶栏 */}
      <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white/75 border-b border-pri-light"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary">
          <Search size={18} />
        </button>
        <span className="text-lg font-extrabold text-pri">我的衣橱</span>
        <div className="w-10" />
      </header>

      <div className="flex justify-between items-baseline mt-2">
        <div>
          <h1 className="text-xl font-extrabold">我的衣橱</h1>
          <p className="text-xs text-text-muted mt-1">共 {items.length} 件</p>
        </div>
      </div>

      {/* 筛选条 */}
      <div className="flex gap-2 overflow-x-auto py-3 -mx-2 px-2 scrollbar-hide">
        {CATS.map(([label, val]) => (
          <button key={val}
            onClick={() => setFilter(val)}
            className={clsx(
              'flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all',
              val === filter
                ? 'bg-gradient-to-r from-pri to-ter text-white border-transparent shadow-md'
                : 'bg-white/40 text-text-secondary border-surface-high'
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* 加载中 */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-pri border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-muted">加载中...</p>
        </div>
      )}

      {/* 网格 */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(item => {
          const idleStatus = getIdleStatus(item)
          return (
            <div key={item.id} className="glass rounded-lg overflow-hidden cursor-pointer relative"
              onClick={() => navigate(`/item/${item.id}`)}>
              <div className="relative">
                <ItemImage itemId={item.id} />
                
                {/* 闲置提醒角标 */}
                {idleStatus.level !== 'normal' && (
                  <div className={clsx(
                    'absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1',
                    idleStatus.level === 'critical' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-amber-500 text-white'
                  )}>
                    <Moon size={10} />
                    {idleStatus.level === 'critical' ? '90天+' : `${idleStatus.days}天`}
                  </div>
                )}
                
                {/* 收藏按钮 */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFav(item.id) }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                  <Heart size={16} className={item.fav ? 'fill-pri text-pri' : 'text-text-muted'} />
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-bold truncate">{item.name}</p>
                <p className="text-xs text-text-muted">{CATEGORY_MAP[item.category]} · {item.colorName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pri-light text-pri font-bold">
                    穿{item.wearCount}次
                  </span>
                  {item.fav && <span className="text-[10px] px-2 py-0.5 rounded-full bg-ter-light text-ter font-bold">喜爱</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 空状态 */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted mb-4">还没有衣物</p>
          <button onClick={() => navigate('/add')} className="btn-pri">
            <Plus size={18} /> 添加第一件
          </button>
        </div>
      )}
    </div>
  )
}
