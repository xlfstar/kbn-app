import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocale } from '@renderer/locales/useLocales'

export const useSelectOptionsStore = defineStore('selectOptions', () => {
  const lists = ref({})
  const { locale } = useLocale()
  const loading = ref(false)

  const hasList = (key = 'default') => {
    const v = lists.value[key]
    return Array.isArray(v) && v.length > 0
  }

  const fetchList = async (api, key = 'default', force = false, query = {}) => {
    if (!api || !key) return
    if (!force && hasList(key)) return
    loading.value = true
    try {
      const res = await api({ ...query, page: 1, pageSize: 9999 })
      if (res.success) {
        // 支持 res.data.items 或直接 res.data 是数组的情况
        const items = Array.isArray(res.data) ? res.data : res.data?.items || []
        lists.value = { ...lists.value, [key]: items }

        loading.value = false
      }
    } catch (error) {
      console.log({ error })
    } finally {
      loading.value = false
    }
  }
  const refreshList = async (api, query = {}) => fetchList(api, api.name, true, query)
  const clearList = (key = 'default') => {
    const next = { ...lists.value }
    delete next[key]
    lists.value = next
  }

  const setLoading = (val) => {
    loading.value = val
  }
  const convertAreaTree = (nodes, currentLocale) => {
    if (!Array.isArray(nodes)) return []
    const res = nodes.map((node) => {
      const converted = {
        ...node,
        label: currentLocale === 'zh_CN' ? node.name : node.enName ? node.enName : node.name,
        disabled: node.status !== 1
      }
      if (node.children && Array.isArray(node.children)) {
        converted.children = convertAreaTree(node.children, currentLocale)
      }

      return converted
    })

    return res
  }

  const treeData = (key = 'default') => {
    return computed(() => convertAreaTree(lists.value[key] || [], locale.value))
  }

  return {
    lists,
    loading,
    treeData,
    fetchList,
    refreshList,
    hasList,
    clearList,
    setLoading
  }
})
