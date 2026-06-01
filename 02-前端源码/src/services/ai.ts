import { AiConfig, ClothingItem, WeatherInfo, wardrobeToAiPrompt, CATEGORY_MAP } from '../types'
import { loadApiKey } from './crypto'

// 支持的 AI 服务商配置
const PROVIDERS = {
  mimo: {
    baseUrl: 'https://api.xiaomimimo.com/v1',
    visionModel: 'mimo-v2.5',     // 原生全模态，支持图片
    textModel: 'mimo-v2.5',        // 统一用 2.5
  },
}

type ProviderKey = keyof typeof PROVIDERS

function getProvider(config: AiConfig): ProviderKey {
  // 默认 mimo
  if (config.model.includes('mimo')) return 'mimo'
  return 'mimo'
}

async function callAi(
  messages: { role: string; content: any }[],
  config: AiConfig,
  isVision: boolean = false
): Promise<string | null> {
  const provider = getProvider(config)
  const providerConfig = PROVIDERS[provider]
  const model = isVision ? providerConfig.visionModel : providerConfig.textModel
  
  // 获取解密的 API Key
  const apiKey = await loadApiKey()
  if (!apiKey) return null

  try {
    // 使用 Vite 代理路径绕过 CORS
    const apiUrl = provider === 'mimo' 
      ? '/api/mimo/v1/chat/completions'  // 代理路径
      : `${providerConfig.baseUrl}/chat/completions`
    
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048
      })
    })
    if (!resp.ok) {
      console.error('AI API error:', resp.status, await resp.text())
      return null
    }
    const data = await resp.json()
    return data.choices[0].message.content
  } catch (e) {
    console.error('AI call failed:', e)
    return null
  }
}

// === AI 衣物识别（拍照后自动填表单） ===
export async function recognizeClothing(imageBase64: string, config: AiConfig) {
  const provider = getProvider(config)

  // MiMo 使用 base64 图片格式
  const base64Data = imageBase64.startsWith('data:') 
    ? imageBase64.split(',')[1] 
    : imageBase64

  const messages = [
    {
      role: 'system',
      content: `你是专业服装分析师。分析图片中的衣物，返回以下JSON格式（不要用markdown代码块包裹）：
{
  "name": "衣物名称（简洁，如：条纹棉质T恤）",
  "category": "top/bottom/outer/dress/shoes/accessory/bag",
  "color": "#hex主色值（如 #1a1c1d）",
  "colorName": "颜色名（如：藏青、米白、酒红）",
  "colorFamily": "neutral/warm/cool/earth",
  "secondaryColor": "#hex辅色（如有花纹）或null",
  "pattern": "纯色/条纹/格纹/碎花/波点/几何/印花/渐变/动物纹/格子/迷彩/其他",
  "fabric": "棉/麻/丝绸/羊毛/羊绒/涤纶/尼龙/牛仔/皮革/人造革/雪纺/针织/灯芯绒/天鹅绒/蕾丝/其他",
  "thickness": 1-5（1极薄5极厚）,
  "styles": ["风格标签数组，从：休闲/通勤/正式/运动/街头/文艺/甜美/中性/复古/极简 中选"],
  "occasions": ["场合数组，从：日常/上班/约会/聚会/运动/旅行/正式场合/居家 中选"],
  "seasons": ["季节数组，从：春/夏/秋/冬 中选"],
  "formality": 1-5（1极休闲5极正式）,
  "tempMin": 最低适用温度（整数）,
  "tempMax": 最高适用温度（整数）,
  "brand": "品牌（看不出则为空字符串）",
  "aiDescription": "一句话描述这件衣物的特点和适合场景",
  "aiTags": ["3-5个关键词标签"]
}

重要：必须返回 color 和 colorName 字段，颜色值用 hex 格式如 #1a1c1d。`
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: '请分析这件衣物的所有属性，特别注意主色调' },
        { 
          type: 'image_url', 
          image_url: { 
            url: `data:image/jpeg;base64,${base64Data}` 
          } 
        }
      ]
    }
  ]
  
  console.log('[AI] Sending request with image length:', base64Data.length)
  const result = await callAi(messages, config, true)
  console.log('[AI] Raw response:', result)
  
  if (!result) return null
  
  try {
    const cleaned = result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)
    console.log('[AI] Parsed result:', parsed)
    
    // 验证关键字段
    if (!parsed.color) console.warn('[AI] Missing color field')
    if (!parsed.colorName) console.warn('[AI] Missing colorName field')
    
    return parsed
  } catch { 
    console.error('Failed to parse AI response:', result)
    return null 
  }
}

// === AI 智能搭配推荐 ===
export async function aiRecommendOutfits(
  items: ClothingItem[],
  config: AiConfig,
  weather?: WeatherInfo,
  occasion?: string
): Promise<any[] | null> {
  const wardrobePrompt = wardrobeToAiPrompt(items, weather)

  const messages = [
    {
      role: 'system',
      content: `你是顶级时尚搭配师，精通色彩学和风格理论。请根据用户衣橱推荐3套搭配。

**搭配规则**：
1. 色彩搭配原则：
   - 同色系深浅搭配（如浅蓝+藏青）加分
   - 中性色（黑白灰米）可与任何颜色搭配
   - 大地色系内部互搭和谐
   - 暖色+暖色 或 冷色+冷色 更协调
   - 避免超过3种亮色同时出现
2. 风格一致性：同一套搭配的风格标签应有交集
3. 场合匹配：搭配应适合同一场合
4. 季节/温度：如有天气信息，搭配应适合当前温度
5. 正式度：同套搭配的正式度差异不超过2级
6. 穿着频率：优先推荐近期少穿的单品

**输出格式**（JSON数组，不要markdown代码块）：
[
  {
    "name": "搭配命名（有创意，如：城市漫步·暖阳系）",
    "itemIds": ["item_id_1", "item_id_2", ...],
    "score": 60-98,
    "reason": "50字以内搭配理由，说明色彩/风格/场合的搭配逻辑",
    "colorHarmony": "配色方案说明（如：同色系深浅、中性色+亮点色）",
    "occasion": "最适合场合",
    "style": "整体风格"
  }
]`
    },
    {
      role: 'user',
      content: wardrobePrompt + (occasion ? `\n\n请特别推荐适合「${occasion}」的搭配。` : '\n\n请推荐3套搭配。')
    }
  ]

  const result = await callAi(messages, config, false)
  if (!result) return null
  
  try {
    const cleaned = result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    return JSON.parse(cleaned)
  } catch { 
    console.error('Failed to parse AI response:', result)
    return null 
  }
}

// === AI 单品搭配建议 ===
export async function aiSuggestForItem(
  targetItem: ClothingItem,
  allItems: ClothingItem[],
  config: AiConfig
): Promise<string | null> {
  const otherItems = allItems.filter(i => i.id !== targetItem.id)
  const messages = [
    {
      role: 'system',
      content: '你是时尚搭配顾问。用户想知道某件衣物怎么搭配，请基于色彩学和风格理论，从衣橱中选出最佳搭配组合，并解释搭配逻辑。回答简洁，200字以内。'
    },
    {
      role: 'user',
      content: `我想搭配这件：\n${wardrobeToAiPrompt([targetItem])}\n\n我衣橱里还有：\n${wardrobeToAiPrompt(otherItems)}\n\n推荐怎么搭配？`
    }
  ]
  return await callAi(messages, config, false)
}

// === 获取可用模型列表 ===
export function getAvailableModels(config: AiConfig) {
  return [
    { value: 'mimo-v2.5', label: 'V2.5 ★（全模态）' },
    { value: 'mimo-v2.5-pro', label: 'V2.5 Pro' },
  ]
}

// === TTS 语音合成（MiMo V2.5 TTS - 使用 chat/completions 接口） ===
export async function textToSpeech(text: string, config: AiConfig): Promise<string | null> {
  try {
    const apiKey = await loadApiKey()
    if (!apiKey) {
      console.warn('[TTS] No API key available')
      return null
    }

    console.log('[TTS] Calling MiMo TTS API...')

    // 使用 Vite 代理绕过 CORS
    const resp = await fetch('/api/mimo/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mimo-v2.5-tts',
        messages: [
          {
            role: 'user',
            content: '用温柔亲切的语气，像闺蜜一样给朋友推荐今天的穿搭。语速适中，自然亲切。'
          },
          {
            role: 'assistant',
            content: text  // 要朗读的文本放在 assistant 角色
          }
        ],
        audio: {
          format: 'wav',
          voice: '冰糖'
        }
      })
    })

    console.log('[TTS] Response status:', resp.status)

    if (!resp.ok) {
      const errorText = await resp.text()
      console.error('[TTS] API error:', resp.status, errorText)
      return null
    }

    const data = await resp.json()
    console.log('[TTS] Response data:', data)
    
    const audioData = data?.choices?.[0]?.message?.audio?.data || data?.audio?.data
    
    if (audioData) {
      console.log('[TTS] Got audio data, length:', audioData.length)
      try {
        const byteCharacters = atob(audioData)
        const byteNumbers = new Uint8Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const blob = new Blob([byteNumbers], { type: 'audio/wav' })
        return URL.createObjectURL(blob)
      } catch (e) {
        console.error('[TTS] Base64 decode failed:', e)
        return null
      }
    }
    
    console.warn('[TTS] No audio data in response')
    return null
  } catch (e) {
    console.error('[TTS] Failed:', e)
    return null
  }
}



// === 生成语音穿搭推荐 ===
export async function generateVoiceRecommendation(
  items: ClothingItem[],
  weather: { temp: string; desc: string; city?: string },
  config: AiConfig
): Promise<{ text: string; audioUrl: string | null } | null> {
  // 先让 AI 生成推荐文案
  const messages = [
    {
      role: 'system',
      content: `你是用户的私人时尚助理，语气亲切自然，像朋友一样说话。请根据天气和衣橱生成今日穿搭推荐。

要求：
1. 开头要有亲切的问候（根据时间：早上好/中午好/晚上好）
2. 说明今天的天气情况
3. 推荐一套具体的穿搭（说出衣物名称）
4. 解释为什么这么穿（色彩/温度/场合）
5. 结尾给一个温暖的小祝福
6. 总字数控制在150字以内，适合语音播报
7. 语气要自然口语化，不要太书面

示例：
"早上好呀！今天北京18度有点凉，我帮你挑了这套：米色针织开衫配深蓝牛仔裤，再加双小白鞋。米色和深蓝搭起来很温柔，开衫厚度正好适合这个温度。祝你今天心情像阳光一样好！"

请直接输出推荐文案，不要加任何前缀或解释。`
    },
    {
      role: 'user',
      content: `今天天气：${weather.city || ''} ${weather.temp} ${weather.desc}

我的衣橱里有这些衣物：
${wardrobeToAiPrompt(items)}

请生成今日穿搭语音推荐。`
    }
  ]
  
  const recommendationText = await callAi(messages, config, false)
  if (!recommendationText) return null
  
  // 生成语音
  const audioUrl = await textToSpeech(recommendationText, config)
  
  return {
    text: recommendationText,
    audioUrl
  }
}