import { ClothingItem } from '../types'

const UNDO_TIMEOUT = 3000 // 3秒内可撤销

interface PendingWear {
  itemId: string
  date: string
  timestamp: number
  previousWearCount: number
  previousLastWorn: number
  previousWearLog: Record<string, number>
}

let pendingWear: PendingWear | null = null
let undoTimer: ReturnType<typeof setTimeout> | null = null

// 记录穿着（支持撤销）
export function recordWearWithUndo(
  item: ClothingItem,
  onConfirm: (item: ClothingItem) => void,
  onUndo: () => void
): { message: string; canUndo: boolean } {
  // 清除之前的待撤销记录
  if (undoTimer) {
    clearTimeout(undoTimer)
    undoTimer = null
  }
  
  const today = new Date().toISOString().slice(0, 10)
  const previousWearCount = item.wearCount
  const previousLastWorn = item.lastWorn
  const previousWearLog = { ...item.wearLog }
  
  pendingWear = {
    itemId: item.id,
    date: today,
    timestamp: Date.now(),
    previousWearCount,
    previousLastWorn,
    previousWearLog,
  }
  
  // 执行穿着记录
  const updatedItem: ClothingItem = {
    ...item,
    wearCount: item.wearCount + 1,
    lastWorn: Date.now(),
    wearLog: {
      ...item.wearLog,
      [today]: (item.wearLog[today] || 0) + 1,
    },
  }
  
  onConfirm(updatedItem)
  
  // 3秒后清除撤销机会
  undoTimer = setTimeout(() => {
    pendingWear = null
  }, UNDO_TIMEOUT)
  
  return {
    message: `已记录今天穿了"${item.name}"`,
    canUndo: true,
  }
}

// 撤销穿着记录
export function undoLastWear(onUndo: (itemId: string, restoredItem: Partial<ClothingItem>) => void): boolean {
  if (!pendingWear) return false
  
  if (undoTimer) {
    clearTimeout(undoTimer)
    undoTimer = null
  }
  
  const { itemId, previousWearCount, previousLastWorn, previousWearLog } = pendingWear
  
  onUndo(itemId, {
    wearCount: previousWearCount,
    lastWorn: previousLastWorn,
    wearLog: previousWearLog,
  })
  
  pendingWear = null
  return true
}

// 获取穿着历史（用于详情页）
export function getWearHistory(item: ClothingItem): Array<{ date: string; count: number }> {
  return Object.entries(item.wearLog || {})
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// 删除某次穿着记录
export function deleteWearRecord(
  item: ClothingItem,
  date: string
): ClothingItem {
  const count = item.wearLog[date] || 0
  if (count === 0) return item
  
  const newWearLog = { ...item.wearLog }
  delete newWearLog[date]
  
  // 重新计算总穿着次数
  const newWearCount = Object.values(newWearLog).reduce((sum, c) => sum + c, 0)
  
  // 重新计算 lastWorn
  const dates = Object.keys(newWearLog).sort().reverse()
  const newLastWorn = dates.length > 0 
    ? new Date(dates[0]).getTime() 
    : item.createdAt || Date.now()
  
  return {
    ...item,
    wearCount: newWearCount,
    lastWorn: newLastWorn,
    wearLog: newWearLog,
  }
}
