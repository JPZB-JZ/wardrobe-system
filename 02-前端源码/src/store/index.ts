import { create } from 'zustand'
import { ClothingItem, AiConfig, Outfit } from '../types'
import { saveImage, loadImage, deleteImage, migrateImagesFromLocalStorage, exportAllImages, importAllImages, clearAllImages } from '../services/imageDb'
import { recordWearWithUndo, undoLastWear, deleteWearRecord, getWearHistory } from '../services/wearLog'
import { PRESET_ITEMS } from '../services/presets'

// 本地存储 key
const STORAGE_KEY = 'aura_wardrobe'
const AI_CONFIG_KEY = 'aura_ai_config'
const AI_KEY_STORAGE = 'aura_ai_key'
const OUTFITS_KEY = 'aura_outfits'
const MIGRATION_KEY = 'aura_image_migrated'

function loadItems(): ClothingItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
function saveItems(items: ClothingItem[]) {
  // 保存时：base64 图片清除（已存 IndexedDB），外部 URL 图片保留
  const itemsToSave = items.map(item => {
    const { image, ...rest } = item
    // 保留外部 URL 图片（http 开头），清除 base64 图片
    if (image && image.startsWith('http')) {
      return { ...rest, image }
    }
    return rest
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsToSave))
}

// 简单解密
function deobfuscate(str: string): string {
  try {
    const decoded = atob(str)
    return decoded.replace('|aura', '').split('').reverse().join('')
  } catch {
    return ''
  }
}

function loadAiKey(): string {
  const stored = localStorage.getItem(AI_KEY_STORAGE)
  if (!stored) return ''
  return deobfuscate(stored)
}

// 图片加载缓存
const imageCache = new Map<string, string>()

interface WardrobeState {
  items: ClothingItem[]
  outfits: Outfit[]
  aiConfig: AiConfig
  images: Record<string, string> // 内存中的图片缓存
  isLoading: boolean
  // Actions
  addItem: (item: ClothingItem) => Promise<void>
  updateItem: (item: ClothingItem) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  loadItemImage: (id: string) => Promise<string | null>
  toggleFav: (id: string) => void
  wearItem: (id: string) => { message: string; canUndo: boolean }
  undoWear: () => boolean
  deleteWearRecord: (id: string, date: string) => void
  getWearHistory: (id: string) => Array<{ date: string; count: number }>
  wearOutfit: (items: ClothingItem[]) => void
  saveOutfit: (outfit: Outfit) => void
  setOutfits: (outfits: Outfit[]) => void
  setAiConfig: (cfg: AiConfig) => void
  loadData: () => Promise<void>
  exportData: () => Promise<{ items: ClothingItem[]; images: Record<string, string> }>
  importData: (data: { items: ClothingItem[]; images: Record<string, string> }) => Promise<void>
  clearAllData: () => Promise<void>
}

export const useStore = create<WardrobeState>((set, get) => ({
  items: [],
  outfits: [],
  aiConfig: { key: '', model: 'mimo-v2.5' },
  images: {},
  isLoading: false,

  addItem: async (item) => {
    // 保存图片到 IndexedDB
    if (item.image && item.image.startsWith('data:')) {
      await saveImage(item.id, item.image)
      imageCache.set(item.id, item.image)
    }
    
    // 保存数据（不含图片）
    const itemWithoutImage = { ...item, image: undefined }
    const items = [...get().items, itemWithoutImage as ClothingItem]
    saveItems(items)
    
    // 更新状态（内存中保留图片）
    const newImages: Record<string, string> = { ...get().images }
    if (item.image) newImages[item.id] = item.image
    set({ items, images: newImages })
  },

  updateItem: async (item) => {
    // 如果图片有变化，更新 IndexedDB
    const oldItem = get().items.find(i => i.id === item.id)
    if (item.image && item.image !== oldItem?.image && item.image.startsWith('data:')) {
      await saveImage(item.id, item.image)
      imageCache.set(item.id, item.image)
    }
    
    const items = get().items.map(i => i.id === item.id ? { ...item, image: undefined } as ClothingItem : i)
    saveItems(items)
    
    const newImages: Record<string, string> = { ...get().images }
    if (item.image) newImages[item.id] = item.image
    set({ items, images: newImages })
  },

  deleteItem: async (id) => {
    await deleteImage(id)
    imageCache.delete(id)
    
    const items = get().items.filter(i => i.id !== id)
    saveItems(items)
    
    const images = { ...get().images }
    delete images[id]
    set({ items, images })
  },

  loadItemImage: async (id) => {
    // 先查内存缓存
    if (imageCache.has(id)) {
      return imageCache.get(id)!
    }
    // 再查 store 中的图片
    if (get().images[id]) {
      return get().images[id]
    }
    // 最后查 IndexedDB
    const image = await loadImage(id)
    if (image) {
      imageCache.set(id, image)
      set({ images: { ...get().images, [id]: image } })
    }
    return image
  },

  toggleFav: (id) => {
    const items = get().items.map(i => i.id === id ? { ...i, fav: !i.fav } : i)
    saveItems(items)
    set({ items })
  },

  wearItem: (id) => {
    const item = get().items.find(i => i.id === id)
    if (!item) return { message: '衣物不存在', canUndo: false }
    
    return recordWearWithUndo(
      item,
      (updatedItem) => {
        const items = get().items.map(i => i.id === id ? updatedItem : i)
        saveItems(items)
        set({ items })
      },
      () => {
        // 撤销回调由 undoWear 处理
      }
    )
  },

  undoWear: () => {
    return undoLastWear((itemId, restoredData) => {
      const items = get().items.map(i => 
        i.id === itemId ? { ...i, ...restoredData } as ClothingItem : i
      )
      saveItems(items)
      set({ items })
    })
  },

  deleteWearRecord: (id, date) => {
    const item = get().items.find(i => i.id === id)
    if (!item) return
    
    const updatedItem = deleteWearRecord(item, date)
    const items = get().items.map(i => i.id === id ? updatedItem : i)
    saveItems(items)
    set({ items })
  },

  getWearHistory: (id) => {
    const item = get().items.find(i => i.id === id)
    if (!item) return []
    return getWearHistory(item)
  },

  wearOutfit: (outfitItems) => {
    const today = new Date().toISOString().slice(0, 10)
    const items = get().items.map(i => {
      const match = outfitItems.find(o => o.id === i.id)
      if (!match) return i
      const wearLog = { ...i.wearLog, [today]: (i.wearLog[today] || 0) + 1 }
      return { ...i, wearCount: i.wearCount + 1, lastWorn: Date.now(), wearLog }
    })
    saveItems(items)
    set({ items })
  },

  saveOutfit: (outfit) => {
    const outfits = [...get().outfits, outfit]
    localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits))
    set({ outfits })
  },

  setOutfits: (outfits) => {
    localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits))
    set({ outfits })
  },

  setAiConfig: (cfg) => {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify({ key: '', model: cfg.model }))
    set({ aiConfig: { key: cfg.key, model: cfg.model } })
  },

  loadData: async () => {
    set({ isLoading: true })
    
    let items = loadItems()
    const outfits = JSON.parse(localStorage.getItem(OUTFITS_KEY) || '[]')
    
    // 首次使用：加载预设数据
    if (items.length === 0) {
      items = PRESET_ITEMS
      saveItems(items)
    }
    
    // 数据迁移：将旧 localStorage 中的图片迁移到 IndexedDB
    const migrated = localStorage.getItem(MIGRATION_KEY)
    if (!migrated) {
      await migrateImagesFromLocalStorage(items)
      localStorage.setItem(MIGRATION_KEY, 'true')
    }
    
    // 加载所有图片到内存
    const images: Record<string, string> = {}
    for (const item of items) {
      // 如果 item 自带图片 URL（预设衣物），直接使用
      if (item.image && item.image.startsWith('http')) {
        images[item.id] = item.image
        imageCache.set(item.id, item.image)
        continue
      }
      // 先检查内存缓存
      const cachedImage = imageCache.get(item.id)
      if (cachedImage) {
        images[item.id] = cachedImage
        continue
      }
      // 再查 IndexedDB
      const image = await loadImage(item.id)
      if (image) {
        images[item.id] = image
        imageCache.set(item.id, image)
      }
    }
    
    set({
      items,
      outfits,
      images,
      aiConfig: {
        key: loadAiKey(),
        model: JSON.parse(localStorage.getItem(AI_CONFIG_KEY) || '{"model":"mimo-v2.5"}').model
      },
      isLoading: false,
    })
  },

  exportData: async () => {
    const items = loadItems()
    const imageMap = await exportAllImages()
    return { items, images: imageMap }
  },

  importData: async (data: { items: ClothingItem[]; images: Record<string, string> }) => {
    // 导入图片
    await importAllImages(data.images)
    
    // 导入衣物数据
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.items))
    
    // 重新加载
    await get().loadData()
  },

  clearAllData: async () => {
    await clearAllImages()
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(OUTFITS_KEY)
    imageCache.clear()
    set({ items: [], outfits: [], images: {} })
  }
}))
