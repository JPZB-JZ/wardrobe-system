import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PROVINCES, City, saveCity } from '../services/cities'
import { ArrowLeft, Search } from 'lucide-react'

export default function CitySelectPage() {
  const navigate = useNavigate()
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const toast = (window as any).__toast

  const province = PROVINCES.find(p => p.name === selectedProvince)

  // 搜索：在所有城市中模糊匹配
  const searchResults = search.trim()
    ? PROVINCES.flatMap(p => p.cities.map(c => ({ ...c, province: p.name })))
        .filter(c => c.name.includes(search.trim()))
        .slice(0, 20)
    : []

  const handleSelect = (city: City) => {
    saveCity(city)
    toast?.(`已选择 ${city.name}`, 'success')
    navigate('/')
  }

  return (
    <div className="px-5 pt-16 pb-8">
      <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white/75 border-b border-pri-light"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <button onClick={() => selectedProvince ? setSelectedProvince(null) : navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary">
          <ArrowLeft size={20} />
        </button>
        <span className="text-lg font-extrabold text-pri">
          {selectedProvince || '选择城市'}
        </span>
        <div className="w-10" />
      </header>

      {/* 搜索框 */}
      <div className="glass flex items-center gap-2 px-3 py-2.5 rounded-xl mt-2 mb-4">
        <Search size={16} className="text-text-muted" />
        <input
          className="flex-1 bg-transparent outline-none text-sm placeholder-text-muted"
          placeholder="搜索城市名称..."
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedProvince(null) }}
        />
        {search && <button onClick={() => setSearch('')} className="text-text-muted text-xs">✕</button>}
      </div>

      {/* 搜索结果 */}
      {search.trim() ? (
        <div className="space-y-2">
          {searchResults.length === 0 && (
            <p className="text-center text-text-muted text-sm py-8">没有找到"{search}"</p>
          )}
          {searchResults.map((city, idx) => (
            <button key={idx} onClick={() => handleSelect(city)}
              className="glass w-full px-4 py-3 rounded-lg text-left flex justify-between items-center hover:bg-pri-light transition-all">
              <span className="text-sm font-semibold">{city.name}</span>
              <span className="text-xs text-text-muted">{city.province}</span>
            </button>
          ))}
        </div>
      ) : !selectedProvince ? (
        <>
          <p className="text-xs text-text-muted mb-3">选择省份/直辖市</p>
          <div className="grid grid-cols-3 gap-2">
            {PROVINCES.map(p => (
              <button key={p.name}
                onClick={() => {
                  if (p.cities.length === 1) handleSelect(p.cities[0])
                  else setSelectedProvince(p.name)
                }}
                className="glass px-3 py-3 rounded-lg text-sm font-semibold text-center hover:bg-pri-light hover:text-pri transition-all active:scale-95">
                {p.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-text-muted mb-3">选择城市</p>
          <div className="grid grid-cols-3 gap-2">
            {province?.cities.map(city => (
              <button key={city.name}
                onClick={() => handleSelect(city)}
                className="glass px-3 py-3 rounded-lg text-sm font-semibold text-center hover:bg-pri-light hover:text-pri transition-all active:scale-95">
                {city.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}