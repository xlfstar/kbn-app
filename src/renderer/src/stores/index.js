// stores/index.js 或 main.js
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

// 创建 pinia 实例
const pinia = createPinia()

// 使用插件
pinia.use(
  createPersistedState({
    // 全局配置
    auto: false,
    storage: localStorage, // 默认使用 localStorage
    beforeRestore: (context) => {
      console.log('开始恢复 store:', context.store.$id)
    },
    afterRestore: (context) => {}
  })
)
export { useTheme } from './modules/theme'
export { useAuthStore } from './modules/auth'
export { useMenuStore } from './modules/menu'
export { useTabsStore } from './modules/tabs'
export { useRulesStore } from './modules/rules'
export { useCategoryStore } from './modules/category'
export { useAreaStore } from './modules/area'
export { useSelectOptionsStore } from './modules/selectOptions'
export default pinia
