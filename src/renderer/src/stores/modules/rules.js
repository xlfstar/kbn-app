import { rulesApi } from '@renderer/api/rules'
import { defineStore } from 'pinia'
import { ref, onMounted, computed } from 'vue'
import { useLocale } from '@renderer/locales/useLocales'

export const useRulesStore = defineStore(
  'ruls',
  () => {
    const { locale } = useLocale()

    const rules = ref([])
    const loading = ref(false)
    const loadRulesData = async () => {
      try {
        loading.value = true
        const res = await rulesApi.getAllRules()
        if (res.success) {
          rules.value = res.data.items || []
        }
      } catch (err) {
        console.log(err.message)
      } finally {
        loading.value = false
      }
    }
    const convertMenuTwoLevels = (menuArray, locale) => {
      if (!Array.isArray(menuArray)) return []

      return menuArray.map((item) => {
        const converted = {
          label: locale === 'zh_CN' ? item.name : item.enName,
          ...item
        }

        // 只处理第一级子节点（第二层）
        if (item.children && Array.isArray(item.children)) {
          converted.children = item.children.map((child) => ({
            label: locale === 'zh_CN' ? child.name : child.enName,
            ...child
          }))
        }

        return converted
      })
    }
    const rulesTree = computed(() => convertMenuTwoLevels(rules.value, locale.value))
    onMounted(async () => {
      await loadRulesData()
    })
    return {
      rules,
      rulesTree,
      loadRulesData,
      loading
    }
  },
  {
    persist: false
  }
)
