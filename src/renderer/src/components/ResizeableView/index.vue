<template>
  <div
    ref="containerRef"
    class="resizable-container"
    :class="{ 'is-resizing': isResizing }"
    :style="containerStyle"
  >
    <slot></slot>

    <!-- 水平拖拽手柄 -->
    <div
      v-if="handles.includes('right')"
      class="resize-handle resize-handle-right"
      @mousedown="startResize($event, 'right')"
      @touchstart="startResize($event, 'right')"
    >
      <div class="handle-bar"></div>
    </div>

    <div
      v-if="handles.includes('left')"
      class="resize-handle resize-handle-left"
      @mousedown="startResize($event, 'left')"
      @touchstart="startResize($event, 'left')"
    >
      <div class="handle-bar"></div>
    </div>

    <!-- 垂直拖拽手柄 -->
    <div
      v-if="handles.includes('bottom')"
      class="resize-handle resize-handle-bottom"
      @mousedown="startResize($event, 'bottom')"
      @touchstart="startResize($event, 'bottom')"
    >
      <div class="handle-bar"></div>
    </div>

    <div
      v-if="handles.includes('top')"
      class="resize-handle resize-handle-top"
      @mousedown="startResize($event, 'top')"
      @touchstart="startResize($event, 'top')"
    >
      <div class="handle-bar"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  // 初始尺寸
  width: {
    type: [Number, String],
    default: 'auto'
  },
  height: {
    type: [Number, String],
    default: 'auto'
  },

  // 最小尺寸
  minWidth: {
    type: Number,
    default: 50
  },
  minHeight: {
    type: Number,
    default: 50
  },

  // 最大尺寸
  maxWidth: {
    type: Number,
    default: Infinity
  },
  maxHeight: {
    type: Number,
    default: Infinity
  },

  // 启用哪些手柄：'left', 'right', 'top', 'bottom'
  handles: {
    type: Array,
    default: () => ['right', 'bottom'],
    validator: (value) => {
      const validHandles = ['left', 'right', 'top', 'bottom']
      return value.every((handle) => validHandles.includes(handle))
    }
  },

  // 网格吸附大小 [水平, 垂直]
  grid: {
    type: Array,
    default: () => [1, 1]
  },

  // 禁用拖拽
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:width',
  'update:height',
  'resize-start',
  'resizing',
  'resize-end'
])

// 响应式状态
const containerRef = ref(null)
const isResizing = ref(false)
const activeHandle = ref(null)
const startX = ref(0)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)

// 当前尺寸
const currentWidth = ref(props.width)
const currentHeight = ref(props.height)

// 计算容器样式
const containerStyle = computed(() => {
  const style = {}

  if (typeof currentWidth.value === 'number') {
    style.width = `${currentWidth.value}px`
  } else {
    style.width = currentWidth.value
  }

  if (typeof currentHeight.value === 'number') {
    style.height = `${currentHeight.value}px`
  } else {
    style.height = currentHeight.value
  }

  if (isResizing.value) {
    style.userSelect = 'none'
    style.pointerEvents = 'none'
  }

  return style
})

// 监听 props 变化
watch(
  () => props.width,
  (newVal) => {
    if (!isResizing.value) {
      currentWidth.value = newVal
    }
  }
)

watch(
  () => props.height,
  (newVal) => {
    if (!isResizing.value) {
      currentHeight.value = newVal
    }
  }
)

// 初始化尺寸
onMounted(() => {
  if (props.width === 'auto') {
    currentWidth.value = containerRef.value?.offsetWidth || 0
  }

  if (props.height === 'auto') {
    currentHeight.value = containerRef.value?.offsetHeight || 0
  }

  // 添加全局事件监听
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('touchmove', handleMouseMove, { passive: false })
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchend', handleMouseUp)
  document.addEventListener('touchcancel', handleMouseUp)
})

// 清理事件监听
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('touchmove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchend', handleMouseUp)
  document.removeEventListener('touchcancel', handleMouseUp)
})

// 开始拖拽
const startResize = (event, handle) => {
  if (props.disabled) return

  event.preventDefault()
  event.stopPropagation()

  isResizing.value = true
  activeHandle.value = handle

  // 获取初始位置
  const isTouch = event.type.includes('touch')
  const clientX = isTouch ? event.touches[0].clientX : event.clientX
  const clientY = isTouch ? event.touches[0].clientY : event.clientY

  startX.value = clientX
  startY.value = clientY
  startWidth.value = currentWidth.value
  startHeight.value = currentHeight.value

  // 触发开始事件
  emit('resize-start', {
    width: currentWidth.value,
    height: currentHeight.value,
    handle
  })
}

// 拖拽中
const handleMouseMove = (event) => {
  if (!isResizing.value || !activeHandle.value) return

  event.preventDefault()

  const isTouch = event.type.includes('touch')
  const clientX = isTouch ? event.touches[0].clientX : event.clientX
  const clientY = isTouch ? event.touches[0].clientY : event.clientY

  const deltaX = clientX - startX.value
  const deltaY = clientY - startY.value

  let newWidth = startWidth.value
  let newHeight = startHeight.value

  // 根据手柄计算新尺寸
  switch (activeHandle.value) {
    case 'right':
      newWidth = startWidth.value + deltaX
      break
    case 'left':
      newWidth = startWidth.value - deltaX
      break
    case 'bottom':
      newHeight = startHeight.value + deltaY
      break
    case 'top':
      newHeight = startHeight.value - deltaY
      break
  }

  // 应用网格吸附
  newWidth = snapToGrid(newWidth, props.grid[0])
  newHeight = snapToGrid(newHeight, props.grid[1])

  // 应用尺寸限制
  newWidth = Math.max(props.minWidth, Math.min(props.maxWidth, newWidth))
  newHeight = Math.max(props.minHeight, Math.min(props.maxHeight, newHeight))

  // 更新尺寸
  currentWidth.value = newWidth
  currentHeight.value = newHeight

  // 触发调整事件
  emit('resizing', {
    width: newWidth,
    height: newHeight,
    deltaX,
    deltaY,
    handle: activeHandle.value
  })
}

// 结束拖拽
const handleMouseUp = () => {
  if (!isResizing.value) return

  isResizing.value = false

  // 触发结束事件
  emit('resize-end', {
    width: currentWidth.value,
    height: currentHeight.value
  })

  // 触发更新事件
  emit('update:width', currentWidth.value)
  emit('update:height', currentHeight.value)

  activeHandle.value = null
}

// 网格吸附
const snapToGrid = (value, gridSize) => {
  if (gridSize <= 1) return value
  return Math.round(value / gridSize) * gridSize
}

// 暴露方法供父组件调用
defineExpose({
  getSize: () => ({
    width: currentWidth.value,
    height: currentHeight.value
  }),
  resetSize: () => {
    currentWidth.value = props.width
    currentHeight.value = props.height
  }
})
</script>

<style scoped>
.resizable-container {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  background: transparent;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resize-handle:hover .handle-bar {
  background-color: var(--primary-color, #409eff);
  opacity: 1;
}

.resize-handle:active .handle-bar {
  background-color: var(--primary-active-color, #337ecc);
}

/* 水平手柄 */
.resize-handle-right,
.resize-handle-left {
  top: 0;
  width: 8px;
  height: 100%;
  cursor: col-resize;
}

.resize-handle-right {
  right: -4px;
}

.resize-handle-left {
  left: -4px;
}

/* 垂直手柄 */
.resize-handle-top,
.resize-handle-bottom {
  left: 0;
  width: 100%;
  height: 8px;
  cursor: row-resize;
}

.resize-handle-top {
  top: -4px;
}

.resize-handle-bottom {
  bottom: -4px;
}

/* 手柄条 */
.handle-bar {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  background-color: #c0c4cc;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.resize-handle-top .handle-bar,
.resize-handle-bottom .handle-bar {
  width: 40px;
  height: 4px;
}

/* 拖拽指示器 */
.is-resizing {
  pointer-events: none;
}

.is-resizing .resize-handle {
  pointer-events: none;
}

.is-resizing .handle-bar {
  background-color: var(--primary-color, #409eff);
  opacity: 1;
}
</style>
