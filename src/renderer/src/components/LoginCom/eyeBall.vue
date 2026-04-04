<template>
  <div
    ref="eyeRef"
    class="rounded-full flex items-center justify-center transition-all duration-150"
    :style="{
      width: `${size}px`,
      height: isBlinking ? '2px' : `${size}px`,
      backgroundColor: eyeColor,
      overflow: 'hidden'
    }"
  >
    <div
      v-if="!isBlinking"
      class="rounded-full"
      :style="{
        width: `${pupilSize}px`,
        height: `${pupilSize}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out'
      }"
    />
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
const { forceLookX, forceLookY, isBlinking, pupilColor, eyeColor, maxDistance, pupilSize, size } =
  defineProps({
    size: {
      type: Number,
      default: 48
    },
    pupilSize: {
      type: Number,
      default: 16
    },
    maxDistance: {
      type: Number,
      default: 10
    },
    eyeColor: {
      type: String,
      default: 'white'
    },
    pupilColor: {
      type: String,
      default: 'black'
    },
    isBlinking: {
      type: Boolean,
      default: false
    },
    forceLookX: Number,
    forceLookY: Number
  })

const eyeRef = ref(null)

const mouseX = ref(0)
const mouseY = ref(0)

const calculatePupilPosition = () => {
  if (!eyeRef.value) return { x: 0, y: 0 }

  // If forced look direction is provided, use that instead of mouse tracking
  if (forceLookX !== undefined && forceLookY !== undefined) {
    return { x: forceLookX, y: forceLookY }
  }

  const eye = eyeRef.value.getBoundingClientRect()
  const eyeCenterX = eye.left + eye.width / 2
  const eyeCenterY = eye.top + eye.height / 2

  const deltaX = mouseX.value - eyeCenterX
  const deltaY = mouseY.value - eyeCenterY
  const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance)

  const angle = Math.atan2(deltaY, deltaX)
  const x = Math.cos(angle) * distance
  const y = Math.sin(angle) * distance

  return { x, y }
}

const pupilPosition = computed(() => calculatePupilPosition())

const handleMouseMove = (event) => {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
}
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>
