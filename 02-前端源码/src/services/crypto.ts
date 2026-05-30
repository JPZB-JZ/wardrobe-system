// API Key 存储模块（简化版，确保可用）

const STORAGE_KEY = 'aura_ai_key'

// 简单混淆（非加密，但比明文强）
function obfuscate(str: string): string {
  return btoa(str.split('').reverse().join('') + '|aura')
}

function deobfuscate(str: string): string {
  try {
    const decoded = atob(str)
    return decoded.replace('|aura', '').split('').reverse().join('')
  } catch {
    return ''
  }
}

// 存储 API Key
export async function saveApiKey(plainKey: string): Promise<void> {
  localStorage.setItem(STORAGE_KEY, obfuscate(plainKey))
}

// 读取 API Key
export async function loadApiKey(): Promise<string> {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return ''
  return deobfuscate(stored)
}

// 删除
export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// 脱敏显示
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '***'
  return key.slice(0, 3) + '•'.repeat(Math.min(key.length - 6, 20)) + key.slice(-3)
}