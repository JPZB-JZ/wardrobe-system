import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { CATEGORY_MAP } from '../types'
import { ArrowLeft, Heart, Edit, Trash2, CheckCircle } from 'lucide-react'

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, toggleFav, wearItem, deleteItem } = useStore()
  const toast = (window as any).__toast

  const item = items.find(i => i.id === id)
  if (!item) return <div className="p-10 text-center text-text-muted">衣物不存在</div>

  const costPerWear = item.price && item.wearCount ? Math.round(item.price / item.wearCount) : '--'

  const handleDelete = () => {
    if (confirm('确定要删除这件衣物吗？')) {
      deleteItem(item.id)
      toast?.('已删除', 'success')
      navigate('/wardrobe')
    }
  }

  return (
    <div className="px-5 pt-16 pb-8">
      <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white/75 border-b border-pri-light"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary">
          <ArrowLeft size={20} />
        </button>
        <span className="text-lg font-extrabold text-pri">详情</span>
        <div className="w-10" />
      </header>

      {/* 图片 */}
      <div className="glass-heavy rounded-xl overflow-hidden mb-5 mt-2">
        {item.image ? (
          <img src={item.image} className="w-full aspect-[3/4] object-cover" alt=""
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-pri-light to-ter-light" />
        )}
      </div>

      {/* 名称标签 */}
      <h1 className="text-xl font-extrabold mb-2">{item.name}</h1>
      <div className="flex gap-2 flex-wrap mb-4">
        {item.brand && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-pri-light text-pri">{item.brand}</span>}
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-pri-light text-pri">{CATEGORY_MAP[item.category]}</span>
        {item.occasions?.[0] && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-ter-light text-ter">{item.occasions[0]}</span>}
        <span className="px-3 py-1.5 rounded-full text-xs font-bold border border-surface-high text-text-secondary flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border" style={{ background: item.color }} />
          {item.colorName}
        </span>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard value={`¥${item.price || 0}`} label="价格" />
        <StatCard value={`${item.wearCount}`} label="穿过" />
        <StatCard value={`¥${costPerWear}`} label="单次成本" />
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => { wearItem(item.id); toast?.('记录+1', 'success') }}
          className="btn-pri flex-1 flex items-center justify-center gap-2 text-sm py-3">
          <CheckCircle size={16} /> 穿一次
        </button>
        <button onClick={() => navigate(`/edit/${item.id}`)}
          className="btn-sec flex-1 flex items-center justify-center gap-2 text-sm py-3">
          <Edit size={16} /> 编辑
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={() => toggleFav(item.id)}
          className="flex-1 glass px-4 py-3 rounded-full flex items-center justify-center gap-2 text-sm font-bold text-pri">
          <Heart size={16} fill={item.fav ? 'currentColor' : 'none'} />
          {item.fav ? '已收藏' : '收藏'}
        </button>
        <button onClick={handleDelete}
          className="px-4 py-3 rounded-full flex items-center justify-center gap-2 text-sm font-bold text-red-500 bg-red-50 border border-red-100">
          <Trash2 size={16} /> 删除
        </button>
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass rounded-lg p-3 text-center">
      <div className="text-lg font-extrabold text-pri">{value}</div>
      <div className="text-[10px] text-text-muted mt-0.5">{label}</div>
    </div>
  )
}