# Aura Style - Android 原生应用

使用 Kotlin + Jetpack Compose 开发的智能衣橱 Android 应用。

## 功能特性

- 📱 **原生 Android 体验** - 使用 Jetpack Compose 构建现代 UI
- 👗 **智能搭配** - 本地规则 + AI 推荐（支持 MiMo TTS 语音播报）
- 📷 **拍照/相册** - 添加衣物支持相机拍摄和相册选择
- 💾 **本地存储** - 使用 DataStore 持久化数据，无需网络
- 🎨 **精美设计** - 液态玻璃效果、渐变动画、Material Design 3
- 🔒 **隐私保护** - 数据存储在本地，不上传云端

## 技术栈

- **Kotlin** - 编程语言
- **Jetpack Compose** - UI 框架
- **DataStore** - 本地数据存储
- **Coil** - 图片加载
- **Material Design 3** - 设计系统

## 构建说明

### 环境要求

- Android Studio Hedgehog (2023.1.1) 或更高版本
- JDK 17
- Android SDK 34

### 构建步骤

1. 使用 Android Studio 打开 `apk` 文件夹
2. 等待 Gradle 同步完成
3. 点击 "Run" 按钮或使用快捷键 Shift + F10

### 命令行构建

```bash
# Windows
gradlew.bat assembleDebug

# macOS/Linux
./gradlew assembleDebug
```

APK 输出位置：`app/build/outputs/apk/debug/app-debug.apk`

## 项目结构

```
apk/
├── app/
│   ├── src/main/java/com/aurastyle/wardrobe/
│   │   ├── MainActivity.kt              # 主入口
│   │   ├── WardrobeApplication.kt       # 应用类
│   │   ├── data/
│   │   │   ├── model/
│   │   │   │   └── ClothingItem.kt      # 数据模型
│   │   │   └── local/
│   │   │       └── WardrobeDataStore.kt # 本地存储
│   │   └── ui/
│   │       ├── theme/                   # 主题配置
│   │       ├── navigation/              # 导航
│   │       ├── screens/                 # 页面
│   │       │   ├── HomeScreen.kt        # 首页
│   │       │   ├── WardrobeScreen.kt    # 衣橱
│   │       │   ├── AddItemScreen.kt     # 添加衣物
│   │       │   ├── ItemDetailScreen.kt  # 详情
│   │       │   ├── SettingsScreen.kt    # 设置
│   │       │   ├── AnalysisScreen.kt    # 分析
│   │       │   └── CalendarScreen.kt    # 日历
│   │       └── components/              # 组件
│   └── src/main/res/                    # 资源文件
├── build.gradle.kts                       # 项目构建配置
└── settings.gradle.kts                    # 项目设置
```

## 后续开发计划

- [ ] MiMo AI 集成（图像识别 + TTS 语音）
- [ ] 虚拟试穿功能
- [ ] 穿搭分享
- [ ] 云端同步
- [ ] 深色模式优化

## 许可证

MIT License