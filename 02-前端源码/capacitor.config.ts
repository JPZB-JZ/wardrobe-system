import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.aurastyle.wardrobe',
  appName: 'Aura Style',
  webDir: '../05-构建产物',
  server: {
    allowNavigation: ['api.deepseek.com', 'wttr.in']
  },
  plugins: {
    Camera: { permissions: ['camera', 'photos'] }
  }
}

export default config