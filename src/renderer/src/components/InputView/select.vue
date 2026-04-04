<template>
  <n-tree-select
    :value="modelValue"
    :options="options"
    :multiple="multiple"
    :default-value="defaultValue"
    :key-field="keyField"
    :label-field="labelField"
    :children-field="childrenField"
    clearable
    @update:value="(val, option) => emit('change', val, option)"
  />
</template>
<script setup lang="jsx">
import { computed, onMounted, watch } from 'vue'
import { useSelectOptionsStore } from '@renderer/stores/modules/selectOptions'
import { NTreeSelect } from 'naive-ui'
const emit = defineEmits(['change'])
const { api, name, keyField, childrenField, query, multiple, labelField, defaultValue } =
  defineProps({
    api: {
      type: [Function, null],
      default: null
    },
    name: {
      type: String,
      default: ''
    },
    filterable: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: [String, Number, Array, null],
      default: null
    },
    keyField: {
      type: String,
      default: 'id'
    },
    labelField: {
      type: String,
      default: 'label'
    },
    childrenField: {
      type: String,
      default: 'children'
    },
    query: {
      type: Object,
      default: () => ({})
    }
  })
const modelValue = defineModel({
  type: [String, Number, Array, null],
  default: null
})
const selectOptionsStore = useSelectOptionsStore()

const storeKey = computed(() => {
  if (api) {
    // 优先使用明确的 API 函数名，如果没有则尝试生成唯一标识
    return api.name || api.toString().substring(0, 30)
  }
  return name || 'default'
})

const options = selectOptionsStore.treeData(storeKey.value)
watch(
  () => query,
  async (val) => {
    await selectOptionsStore.refreshList(api, val)
  },
  {
    deep: true
  }
)

onMounted(async () => {
  await selectOptionsStore.fetchList(api, storeKey.value, false, query)
})

defineExpose({
  refresh: () => selectOptionsStore.refreshList(api, query),
  clear: () => selectOptionsStore.clearList(storeKey.value),
  hasCache: () => selectOptionsStore.hasList(storeKey.value),
  getOptions: () => options.value
})
</script>
