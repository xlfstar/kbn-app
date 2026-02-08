import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { t } from '@renderer/locales'
export const useTheme = defineStore(
  'theme',
  () => {
    // 状态
    const themes = [
      {
        label: t('light'),
        value: 'light',
        key: 'light'
      },
      {
        label: t('dark'),
        value: 'dark',
        key: 'dark'
      }
    ]
    const theme = ref('light')
    const toggle = (val) => {
      if (val === theme.value) return
      theme.value = val
    }
    watch(
      theme,
      (newVal) => {
        const className = newVal || 'light'
        document.body.setAttribute('data-theme', className)
        if (className === 'dark') {
          document.documentElement.classList.toggle('dark')
        }
      },
      {
        immediate: true,
        deep: true
      }
    )
    return {
      themes,
      theme,
      toggle
    }
  },
  {
    // 持久化配置
    persist: true
  }
)
