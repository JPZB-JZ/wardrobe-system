// IndexedDB 图片存储服务
const DB_NAME = 'AuraStyle'
const DB_VERSION = 1
const STORE_NAME = 'clothes_images'

// 打开数据库
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'clothesId' })
      }
    }
  })
}

// 保存图片
export async function saveImage(clothesId: string, base64Data: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put({ clothesId, base64Data, updatedAt: Date.now() })
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// 加载图片
export async function loadImage(clothesId: string): Promise<string | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(clothesId)
    
    request.onsuccess = () => {
      const result = request.result
      resolve(result ? result.base64Data : null)
    }
    request.onerror = () => reject(request.error)
  })
}

// 删除图片
export async function deleteImage(clothesId: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(clothesId)
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// 批量导出所有图片（用于数据导出）
export async function exportAllImages(): Promise<Record<string, string>> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()
    
    request.onsuccess = () => {
      const results = request.result as Array<{ clothesId: string; base64Data: string }>
      const map: Record<string, string> = {}
      results.forEach(item => {
        map[item.clothesId] = item.base64Data
      })
      resolve(map)
    }
    request.onerror = () => reject(request.error)
  })
}

// 批量导入图片（用于数据恢复）
export async function importAllImages(images: Record<string, string>): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)
  
  const promises = Object.entries(images).map(([clothesId, base64Data]) => {
    return new Promise<void>((resolve, reject) => {
      const request = store.put({ clothesId, base64Data, updatedAt: Date.now() })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  })
  
  await Promise.all(promises)
}

// 清空所有图片
export async function clearAllImages(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// 数据迁移：将旧 localStorage 中的图片迁移到 IndexedDB
export async function migrateImagesFromLocalStorage(items: Array<{ id: string; image?: string }>): Promise<void> {
  for (const item of items) {
    if (item.image && item.image.startsWith('data:')) {
      try {
        await saveImage(item.id, item.image)
        // 迁移成功后，原数据会在保存时清除 image 字段
      } catch (e) {
        console.error('Migration failed for item:', item.id, e)
      }
    }
  }
}
