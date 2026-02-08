<template>
  <div v-if="visible" ref="target" class="relative">
    <n-tooltip trigger="hover">
      <template #trigger>
        <div class="px-2 cursor-pointer hover:text-blue-500 relative" @click="show = !show">
          <Icon name="icon-a-guangqi_guolv11x" />
        </div>
      </template>
      {{ t('filter') }}
    </n-tooltip>
    <transition name="modal-fade">
      <div v-show="show" class="p-2 absolute z-1000 filter-container">
        <n-form ref="filterFormRef" :model="formData" size="small" label-placement="left">
          <n-grid cols="1" :x-gap="12" :y-gap="12">
            <n-grid-item v-for="item in columns" :key="item.key">
              <n-form-item label="" :path="item.key">
                <input-view
                  v-model:value="formData[item.key]"
                  :col="item"
                  :placeholder="t(item.titleKey)"
                  position="filter"
                />
              </n-form-item>
            </n-grid-item>
          </n-grid>
        </n-form>
        <div class="flex justify-between gap-2 mt-2 pt-2">
          <n-button size="small" @click="handleReset">{{ t('reset') }}</n-button>
          <n-button size="small" type="success" @click="handleQuery">{{ t('query') }}</n-button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, useTemplateRef } from 'vue'
import { NTooltip, NForm, NFormItem, NGrid, NGridItem, NButton } from 'naive-ui'
import { Icon, InputView } from '@renderer/components'
import { t } from '@renderer/locales'
import { onClickOutside } from '@vueuse/core'

const emit = defineEmits(['onChange'])
const target = useTemplateRef('target')
onClickOutside(target, () => {
  show.value = false
})

const { columns } = defineProps({
  columns: {
    type: Object,
    default: () => ({})
  },
  visible: {
    type: Boolean,
    default: false
  }
})
const show = ref(false)
const formData = ref({})

const handleReset = () => {
  formData.value = {}
  show.value = false
  emit('onChange', formData.value)
}
const handleQuery = () => {
  show.value = false
  emit('onChange', formData.value)
}
</script>
<style scoped lang="scss">
:deep(.n-form-item .n-form-item-feedback-wrapper) {
  display: none;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
  transform: translateY(-20px) scale(1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
.filter-container {
  width: 200px;
  right: 0;
  top: 0;
  margin-top: calc(100% + 3px);
  animation: modal-appear 0.3s ease;
  background-color: var(--nx-color);
  box-shadow: var(--nx-box-shadow);
  border-radius: 3px;
}
@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
