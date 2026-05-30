import { ClothingItem } from '../types'

const NOTIFICATION_KEY = 'aura_notification_permission'

// 检查通知权限
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  
  const permission = await Notification.requestPermission()
  localStorage.setItem(NOTIFICATION_KEY, permission)
  return permission === 'granted'
}

// 检查是否已授权
export function hasNotificationPermission(): boolean {
  return localStorage.getItem(NOTIFICATION_KEY) === 'granted'
}

// 发送闲置提醒通知
export function sendIdleNotification(item: ClothingItem, days: number) {
  if (!hasNotificationPermission()) return
  
  const title = days >= 90 ? '👋 好久不见！' : '💤 闲置提醒'
  const body = days >= 90 
    ? `你的"${item.name}"已经${days}天没穿了，考虑捐赠或出售？`
    : `你的"${item.name}"已经${days}天没穿了，点击重新穿上它！`
  
  new Notification(title, {
    body,
    icon: item.image || '/icon.png',
    tag: `idle-${item.id}`,
  })
}

// 获取闲置状态
export function getIdleStatus(item: ClothingItem): { days: number; level: 'normal' | 'warning' | 'critical' } {
  const lastWorn = item.lastWorn || item.createdAt || Date.now()
  const days = Math.floor((Date.now() - lastWorn) / (1000 * 60 * 60 * 24))
  
  if (days >= 90) return { days, level: 'critical' }
  if (days >= 30) return { days, level: 'warning' }
  return { days, level: 'normal' }
}

// 检查所有衣物并发送通知
export function checkAllIdleItems(items: ClothingItem[]): Array<{ item: ClothingItem; days: number; level: 'warning' | 'critical' }> {
  const idleItems: Array<{ item: ClothingItem; days: number; level: 'warning' | 'critical' }> = []
  
  items.forEach(item => {
    const status = getIdleStatus(item)
    if (status.level !== 'normal') {
      idleItems.push({ item, days: status.days, level: status.level })
      // 每天只提醒一次（通过 tag 去重）
      sendIdleNotification(item, status.days)
    }
  })
  
  return idleItems
}

// 获取闲置衣物列表（用于衣橱分析页）
export function getIdleItemsList(items: ClothingItem[]): Array<{ item: ClothingItem; days: number; level: 'normal' | 'warning' | 'critical' }> {
  return items
    .map(item => {
      const status = getIdleStatus(item)
      return { item, days: status.days, level: status.level }
    })
    .filter(i => i.level !== 'normal')
    .sort((a, b) => b.days - a.days)
}

// 每日检查（应在应用启动时调用）
export function startDailyIdleCheck(items: ClothingItem[]) {
  // 立即检查一次
  checkAllIdleItems(items)
  
  // 每天检查一次
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0)
  const msUntilTomorrow = tomorrow.getTime() - now.getTime()
  
  setTimeout(() => {
    checkAllIdleItems(items)
    // 之后每24小时检查
    setInterval(() => checkAllIdleItems(items), 24 * 60 * 60 * 1000)
  }, msUntilTomorrow)
}
