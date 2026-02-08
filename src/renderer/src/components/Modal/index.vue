<script setup>
import { watch, useTemplateRef } from 'vue'
import { t } from '@renderer/locales'
import { Icon } from '@renderer/components'
import { useDraggable } from '@vueuse/core'
const { width, header, footer } = defineProps({
  width: {
    type: String,
    default: '500px'
  },

  header: {
    type: [Boolean, String],
    default: t('title')
  },
  footer: {
    type: Boolean,
    default: true
  }
})
const el = useTemplateRef('el')
const { x, y, style } = useDraggable(el, {
  initialValue: { x: 40, y: 40 }
})
// const emit = defineEmits(['close', 'confirm'])
const visible = defineModel('visible', {
  type: Boolean,
  default: false
})

const handleClose = () => {
  visible.value = false
  // emit('close')
}

const handleCancel = () => {
  visible.value = false
  // emit('close')
}

const handleConfirm = () => {
  // emit('confirm')
}
</script>

<template>
  <Teleport to="#pageMain">
    <Transition name="modal">
      <div v-if="visible" class="modal-container">
        <div class="modal-mask"></div>
        <div
          ref="el"
          class="modal-wrapper shadow-xl p-4 w-[500px]"
          :style="style"
          style="position: fixed"
        >
          <div v-if="header" class="modal-header">
            <slot name="header">
              <div class="flex justify-between items-center">
                <div class="text-xl">{{ header }}</div>
                <div class="">
                  <span class="cursor-pointer p-2" @click="handleClose">
                    <Icon name="icon-delete" />
                  </span>
                </div>
              </div>
            </slot>
          </div>

          <div class="modal-body">
            <slot></slot>
          </div>
          <div v-if="footer" class="modal-footer">
            <slot name="footer">
              <div class="flex justify-end items-center gap-2">
                <n-button @click="handleCancel">{{ t('cancel') }}</n-button>
                <n-button @click="handleConfirm">{{ t('confirm') }}</n-button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  position: fixed;
  z-index: 9998;
  top: 40px;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}
.modal-wrapper {
  position: relative;
  transition: all 0.3s ease;
  margin: auto;
  background-color: var(--bg-content-color);
  z-index: 9999;
  transition: all 0.3s ease;
}
.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * 对于 transition="modal" 的元素来说
 * 当通过 Vue.js 切换它们的可见性时
 * 以下样式会被自动应用。
 *
 * 你可以简单地通过编辑这些样式
 * 来体验该模态框的过渡效果。
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
