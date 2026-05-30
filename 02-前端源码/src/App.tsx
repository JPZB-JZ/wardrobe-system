import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import WardrobePage from './pages/WardrobePage'
import AddItemPage from './pages/AddItemPage'
import SettingsPage from './pages/SettingsPage'
import ItemDetailPage from './pages/ItemDetailPage'
import CitySelectPage from './pages/CitySelectPage'
import AnalysisPage from './pages/AnalysisPage'
import CalendarPage from './pages/CalendarPage'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import { useStore } from './store'
import { initTheme } from './services/theme'
import { startDailyIdleCheck } from './services/idleReminder'

function AppContent() {
  const [toast, setToast] = useState<{ msg: string; type?: string } | null>(null)
  const { items, loadData } = useStore()

  const showToast = (msg: string, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  // 暴露给全局
  ;(window as any).__toast = showToast

  // 初始化：加载数据、主题、启动闲置检查
  useEffect(() => {
    loadData().then(() => {
      initTheme()
      startDailyIdleCheck(items)
    })
  }, [])

  return (
    <div className="min-h-screen bg-surface pb-28">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wardrobe" element={<WardrobePage />} />
        <Route path="/add" element={<AddItemPage />} />
        <Route path="/edit/:id" element={<AddItemPage />} />
        <Route path="/item/:id" element={<ItemDetailPage />} />
        <Route path="/city" element={<CitySelectPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  )
}
