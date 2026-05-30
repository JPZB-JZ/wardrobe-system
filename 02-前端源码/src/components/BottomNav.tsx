import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Shirt, PlusCircle, Settings } from 'lucide-react'
import clsx from 'clsx'

const tabs = [
  { path: '/', icon: Home, label: '推荐' },
  { path: '/wardrobe', icon: Shirt, label: '衣橱' },
  { path: '/add', icon: PlusCircle, label: '添加' },
  { path: '/settings', icon: Settings, label: '设置' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // 详情页隐藏导航
  if (pathname.startsWith('/item') || pathname.startsWith('/edit')) return null

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[420px] z-50 flex justify-around items-center py-2 px-3 bg-white/88 border border-white/70 rounded-full shadow-lg"
      style={{ backdropFilter: 'blur(40px) saturate(1.5)', WebkitBackdropFilter: 'blur(40px) saturate(1.5)' }}>
      {tabs.map(tab => {
        const active = pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={clsx(
              'flex flex-col items-center gap-0.5 px-5 py-2 rounded-full border-none text-[11px] font-bold transition-all',
              active ? 'text-pri bg-pri-light' : 'text-text-muted bg-transparent'
            )}
          >
            <tab.icon size={20} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}