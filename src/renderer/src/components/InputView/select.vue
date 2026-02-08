<template>
  <n-tree-select
    :value="modelValue"
    :options="options"
    :filterable="filterable"
    :multiple="multiple"
    :default-value="defaultValue"
    :key-field="keyField"
    :label-field="labelField"
    :children-field="childrenField"
    @update:value="(val, option) => emit('change', val, option)"
  />
</template>
<script setup lang="jsx">
import { computed, onMounted } from 'vue'
import { useSelectOptionsStore } from '@renderer/stores/modules/selectOptions'
import { NTreeSelect } from 'naive-ui'
const emit = defineEmits(['change'])
const { api, name, keyField, childrenField } = defineProps({
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
    default: false
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
  }
})
const modelValue = defineModel({
  type: [String, Number, Array, null],
  default: null
})
const selectOptionsStore = useSelectOptionsStore()

const storeKey = computed(() => name || (api && api.name) || 'default')

const options = selectOptionsStore.treeData(storeKey.value)

onMounted(async () => {
  await selectOptionsStore.fetchList(api, storeKey.value)
})

defineExpose({
  refresh: () => selectOptionsStore.refreshList(api, storeKey.value),
  clear: () => selectOptionsStore.clearList(storeKey.value),
  hasCache: () => selectOptionsStore.hasList(storeKey.value),
  getOptions: () => options.value
})
</script>
