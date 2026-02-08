<template>
  <div>
    <slot>
      <n-popselect :options="[]" trigger="click">
        <n-tooltip trigger="hover">
          <template #trigger>
            <div class="px-2 cursor-pointer hover:text-blue-500 relative">
              <Icon name="icon-setting" />
            </div>
          </template>
          {{ t('column setting') }}
        </n-tooltip>
        <template #header> {{ t('column setting') }} </template>
        <template #empty>
          <VueDraggable
            ref="el"
            v-model="modelValue"
            filter=".hideCols"
            class="-mx-[32px] px-2"
            @click.stop
          >
            <div
              v-for="(item, i) in modelValue.filter(
                (e) => e.visible !== false && e.type !== 'selection'
              )"
              :key="i"
              class="flex items-center p-2 cursor-move justify-between gap-8 hover:bg-(--bg-hover-color)"
            >
              <span>{{ t(item.titleKey) }}</span>
              <n-switch v-model:value="item.show" size="small" />
            </div>
          </VueDraggable>
        </template>
      </n-popselect>
    </slot>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { NTooltip, NSwitch, NPopselect } from 'naive-ui'
import { Icon } from '@renderer/components'
import { VueDraggable } from 'vue-draggable-plus'
import { t } from '@renderer/locales'

const modelValue = defineModel({ type: Array, default: () => [] })

onMounted(() => {
  modelValue.value = modelValue.value.map((item) => ({ ...item, show: true }))
})
</script>
<style scoped lang="scss">
.draggable-container {
  position: absolute;
  right: 0;
  bottom: 0;
  transform: translateY(calc(100% + 30px));
  background-color: var(--bg-reverse-color);
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -4px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-bottom: 5px solid var(--bg-reverse-color);
    border-right: 5px solid transparent;
  }
}
</style>
