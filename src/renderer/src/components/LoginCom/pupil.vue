<template>
  <div
    ref="pupilRef"
    class="rounded-full"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: pupilColor,
      transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
      transition: 'transform 0.1s ease-out'
    }"
  />
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const { size, maxDistance, pupilColor, forceLookX, forceLookY } = defineProps({
  size: {
    type: Number,
    default: 12
  },
  maxDistance: {
    type: Number,
    default: 5
  },
  pupilColor: {
    type: String,
    default: 'black'
  },
  forceLookX: Number,
  forceLookY: Number
})
const pupilRef = ref(null)
const isPurpleBlinking = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)

const calculatePupilPosition = () => {
  if (!pupilRef.value) return { x: 0, y: 0 }

  // If forced look direction is provided, use that instead of mouse tracking
  if (forceLookX !== undefined && forceLookY !== undefined) {
    return { x: forceLookX, y: forceLookY }
  }

  const pupil = pupilRef.value.getBoundingClientRect()
  const pupilCenterX = pupil.left + pupil.width / 2
  const pupilCenterY = pupil.top + pupil.height / 2

  const deltaX = mouseX.value - pupilCenterX
  const deltaY = mouseY.value - pupilCenterY
  const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance)

  const angle = Math.atan2(deltaY, deltaX)
  const x = Math.cos(angle) * distance
  const y = Math.sin(angle) * distance

  return { x, y }
}
let blinkTimeout = null
const getRandomBlinkInterval = () => Math.random() * 4000 + 3000
const scheduleBlink = () => {
  blinkTimeout = setTimeout(() => {
    isPurpleBlinking.value = true
    setTimeout(() => {
      isPurpleBlinking.value = false
      scheduleBlink()
    }, 150)
  }, getRandomBlinkInterval())
}
const pupilPosition = computed(() => calculatePupilPosition())
const handleMouseMove = (event) => {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
}
onMounted(() => {
  scheduleBlink()
  window.addEventListener('mousemove', handleMouseMove)
})
onBeforeUnmount(() => {
  if (blinkTimeout) {
    clearTimeout(blinkTimeout)
  }
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>
<style lang="scss" scoped></style>
