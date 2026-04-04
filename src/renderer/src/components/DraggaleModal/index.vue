<script setup>
import { ref, computed, watch, onUnmounted, onMounted, useId } from 'vue'
import { useDraggable } from '@vueuse/core'
import { t } from '@renderer/locales'
import { Icon } from '@renderer/components'
import { NButton } from 'naive-ui'
const props = defineProps({
  header: {
    type: [String, Boolean],
    default: t('title')
  },
  footer: {
    type: [String, Boolean],
    default: true
  },
  // 是否可拖动
  draggable: {
    type: Boolean,
    default: true
  },
  // 初始位置
  initialPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  // 是否限制在窗口内
  containInWindow: {
    type: Boolean,
    default: true
  },
  // 显示关闭按钮
  showClose: {
    type: Boolean,
    default: true
  },
  // 点击遮罩关闭
  maskClosable: {
    type: Boolean,
    default: true
  },
  // 宽度
  width: {
    type: [String, Number],
    default: '520px'
  },
  // 自定义类名
  customClass: {
    type: String,
    default: ''
  }
})
const _uid = useId()
const emit = defineEmits(['update:visible', 'close', 'confirm'])
const loading = defineModel('loading', { type: Boolean, default: false })
const visible = defineModel('visible', {
  type: Boolean,
  default: false
})
// 模态框引用
const modalRef = ref(null)
// 标题栏引用（拖拽区域）
const headerRef = ref(null)

// 计算宽度
const modalWidth = computed(() => {
  if (typeof props.width === 'number') {
    return `${props.width}px`
  }
  return props.width
})

// 窗口尺寸
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// 更新窗口尺寸
const updateWindowSize = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

// 计算拖拽边界
const dragBoundary = computed(() => {
  if (!props.containInWindow || !modalRef.value) {
    return null
  }

  // 获取模态框的实际尺寸
  const modalRect = modalRef.value?.getBoundingClientRect?.() || { width: 520, height: 300 }
  const modalWidth = modalRect.width || 520
  const modalHeight = modalRect.height || 300

  return {
    top: 0,
    left: 0,
    right: windowWidth.value - modalWidth,
    bottom: windowHeight.value - modalHeight
  }
})

// 计算初始位置（居中显示）
const initialPos = computed(() => {
  if (props.initialPosition.x !== 0 || props.initialPosition.y !== 0) {
    return props.initialPosition
  }

  // 默认居中
  return {
    x: (windowWidth.value - 520) / 2,
    y: Math.max(100, (windowHeight.value - 300) / 2)
  }
})

// 使用 useDraggable
const { x, y, style, isDragging } = useDraggable(modalRef, {
  initialValue: initialPos,
  boundingRect: dragBoundary,
  onStart: () => {
    // emit('drag-start')
  },
  onEnd: () => {
    // emit('drag-end')
  }
})

// 监听窗口大小变化
window.addEventListener('resize', updateWindowSize)

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize)
})

// 关闭模态框
const closeModal = () => {
  emit('update:visible', false)

  emit('close')
}

// 确认
const handleConfirm = (e) => {
  emit('confirm', e)
  // closeModal()
}

// 监听 visible 变化，重置位置
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.draggable) {
      // 重新居中
      x.value = (windowWidth.value - 520) / 2
      y.value = Math.max(100, (windowHeight.value - 300) / 2)
    }
  }
)

// ESC 键关闭
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.visible) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="modal-mask">
        <div
          v-if="header"
          ref="modalRef"
          class="modal-container"
          :class="[customClass, { 'modal-dragging': isDragging && draggable }]"
          :style="[draggable ? style : '', { width: modalWidth }]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="'modal-title-' + _uid"
        >
          <!-- 标题栏（拖拽区域） -->
          <div
            v-if="props.header"
            ref="headerRef"
            class="modal-header"
            :class="{ 'modal-header-draggable': draggable }"
          >
            <div :id="'modal-title-' + _uid" class="modal-title">
              {{ header }}
            </div>
            <span class="cursor-pointer" @click="closeModal">
              <Icon name="icon-delete" />
            </span>
          </div>

          <!-- 内容区域 -->
          <div class="modal-content">
            <slot></slot>
          </div>

          <!-- 底部按钮 -->
          <div v-if="footer" class="modal-footer">
            <slot name="footer">
              <n-button size="small" type="default" @click="closeModal">{{ t('cancel') }}</n-button>
              <n-button
                attr-type="button"
                size="small"
                type="primary"
                :loading="loading"
                @click="handleConfirm"
                >{{ t('confirm') }}</n-button
              >
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-mask {
  position: fixed;
  top: 40px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 60px;
  overflow-y: auto;
  backdrop-filter: blur(2px);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  /* 自定义滚动条：完全透明但可滚动 */
  &::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    background: transparent;
  }
}

.modal-container {
  position: absolute;
  background-color: var(--bg-content-color);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  /* overflow: hidden; */
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 120px);
  min-width: 300px;
  height: auto;
  animation: modal-appear 0.3s ease;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-container.modal-dragging {
  cursor: move;
  user-select: none;
  box-shadow: 0 16px 56px rgba(0, 0, 0, 0.2);
  opacity: 0.95;
  transition:
    box-shadow 0.2s,
    opacity 0.2s;
}

.modal-header {
  padding: 8px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.modal-header-draggable {
  cursor: move;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  user-select: none;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-content {
  padding: 8px 15px;
  flex: 1;
  overflow-y: auto;
  min-height: 100px;
}

.modal-footer {
  padding: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn-cancel {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.modal-btn-cancel:hover {
  background: #e9ecef;
}

.modal-btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-btn-confirm:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.drag-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  pointer-events: none;
  z-index: 100;
  animation: hint-pulse 2s infinite;
}

@keyframes hint-pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-mask {
    padding: 20px;
    align-items: flex-start;
  }

  .modal-container {
    width: 90% !important;
    max-width: 90% !important;
    margin-top: 20px;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 16px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
  }
}
</style>
