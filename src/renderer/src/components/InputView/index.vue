<template>
  <component
    :is="componentName"
    v-if="componentName"
    ref="innerRef"
    v-model:value="modelValue"
    v-bind="computedProps"
    v-on="computedListeners"
  >
    <!-- iconSelect 特殊处理 -->
    <!-- <t-option v-if="col.inputType === 'iconSelect'" v-for="(item, i) in AILI_ICON_LIST" :key="i" :value="item"
      style="display: inline-block">
      <Icon :name="item" />
    </t-option> -->

    <!-- <template v-if="col.inputType === 'iconSelect'" #valueDisplay>
      <Icon :name="modelValue" /><span class="ml-2">{{ modelValue }}</span>
    </template> -->
    <template v-if="inputViewType === 'radio'">
      <n-space>
        <n-radio v-for="(item, i) in computedProps.options" :key="i" :value="item.value">{{
          item.label
        }}</n-radio>
      </n-space>
    </template>

    <template v-if="inputViewType === 'checkbox'">
      <n-space item-style="display: flex;">
        <n-checkbox
          v-for="(item, i) in computedProps.options"
          :key="i"
          :value="item.value"
          :label="item.label"
        />
      </n-space>
    </template>
    <!-- 透传父组件传递的所有插槽 -->
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </component>
</template>

<script lang="jsx" setup>
import { computed, useAttrs, ref } from 'vue'

// import { Icon } from '@/components'
import {
  NInput,
  NSelect,
  NRadioGroup,
  NRadio,
  NCheckboxGroup,
  NCheckbox,
  NDatePicker,
  NInputNumber,
  NSpace,
  NTreeSelect
} from 'naive-ui'
import XSelect from './select.vue'

// 禁用自动属性继承，手动控制
defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  col: {
    type: Object,
    default: () => ({})
  },
  modelValue: {
    type: [String, Number, Array, Boolean, Object],
    default: undefined
  },
  value: {
    type: [String, Number, Array, Boolean, Object],
    default: undefined
  },
  inputType: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'filter'
  }
})
const emit = defineEmits(['update:modelValue', 'update:value'])
const attrs = useAttrs()
const inputViewType = computed(() => props.col[props.position + 'Type'] || props.col.inputType)
// 组件映射表
const componentMap = {
  input: NInput,
  select: NSelect,
  // iconSelect: Select,
  radio: NRadioGroup,
  checkbox: NCheckboxGroup,
  date: NDatePicker,
  number: NInputNumber,
  treeSelect: NTreeSelect,
  xSelect: XSelect
}
const componentName = computed(() => {
  const cType = props.col[props.position + 'Type'] || props.inputType || props.col.inputType

  if (cType) {
    return componentMap[cType]
  }
  return ''
})
const innerRef = ref(null)
// 内部值管理
const modelValue = computed({
  get: () => {
    const v = props.value !== undefined ? props.value : props.modelValue
    if ((props.col[props.position + 'Type'] || props.col.inputType) === 'number') {
      if (v === '' || v === null || v === undefined) return null
      const n = Number(v)
      return Number.isNaN(n) ? null : n
    }

    return v
  },
  set: (val) => {
    emit('update:modelValue', val)
    emit('update:value', val)
  }
})

// 计算合并后的属性
const computedProps = computed(() => {
  const baseProps = {
    placeholder: props.col.placeholder || props.col.title || props.col.label,
    name: props.col.key,
    size: props.col.size
  }

  // 根据类型添加特定属性
  if (props.col.inputType === 'input') {
    baseProps.clearable = true
  } else if (props.col.inputType === 'select' || props.col.inputType === 'iconSelect') {
    baseProps.options = props.col.options
    baseProps.clearable = true
    // baseProps.multiple = props.col.multiple
    // baseProps.maxTagCount = props.col.maxTagCount
    baseProps.filterable = true
    const keys = props.col.keys || { label: 'label', value: 'value' }
    baseProps.labelField = keys.label
    baseProps.valueField = keys.value
    baseProps.popupProps =
      props.col.popupProps ||
      (props.col.inputType === 'iconSelect' ? { overlayInnerStyle: { width: '314px' } } : {})
  } else if (props.col.inputType === 'radio') {
    baseProps.options = props.col.options || props.col.props?.options
    baseProps.defaultValue = props.col.defaultValue
  } else if (props.col.inputType === 'checkbox') {
    baseProps.options = props.col.options
  } else if (props.col.inputType === 'date' || props.col.inputType === 'daterange') {
    baseProps.type = props.col.dateType
    baseProps.format = props.col.format
  } else if (props.col.inputType === 'number') {
    baseProps.min = props.col.min
    baseProps.max = props.col.max
    baseProps.step = props.col.step
  } else if (props.col.inputType === 'treeSelect') {
    baseProps.data = props.col.options
    baseProps.clearable = true
    baseProps.filterable = true
    // baseProps.multiple = props.col.multiple
    baseProps.keyField = props.col.keyField || 'value'
    baseProps.labelField = props.col.labelField || 'label'
    baseProps.minCollapsedNum = props.col.minCollapsedNum || 2
  } else if (props.col.inputType === 'xSelect') {
    baseProps.clearable = true
    baseProps.filterable = true
    // xSelect 自己有默认的 keyField='id', labelField='label'
    if (props.col.keyField) baseProps.keyField = props.col.keyField
    if (props.col.labelField) baseProps.labelField = props.col.labelField
    baseProps.minCollapsedNum = props.col.minCollapsedNum || 2
  }

  // 合并属性的优先级：baseProps < attrs（父组件传递） < col.props（col配置）
  // 这样 col.props 的优先级最高，可以覆盖父组件传递的属性
  // eslint-disable-next-line no-unused-vars
  const { show, multiple, ...rest } = props.col
  let realMultiple = props.col[`${props.position}Multiple`]
  const col = { ...rest, multiple: realMultiple }

  return {
    ...baseProps,
    ...attrs,
    ...col,
    ...(props.col.props || {})
  }
})

// 计算合并后的事件监听器
const computedListeners = computed(() => {
  return {
    ...(props.col.listeners || {})
  }
})

defineExpose({
  getInner: () => innerRef.value,
  refresh: () => innerRef.value && innerRef.value.refresh && innerRef.value.refresh(),
  clear: () => innerRef.value && innerRef.value.clear && innerRef.value.clear(),
  hasCache: () => (innerRef.value && innerRef.value.hasCache ? innerRef.value.hasCache() : false),
  getOptions: () => (innerRef.value && innerRef.value.getOptions ? innerRef.value.getOptions() : [])
})
</script>
