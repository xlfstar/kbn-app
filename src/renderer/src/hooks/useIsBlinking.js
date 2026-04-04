import { ref, onMounted, onUnmounted } from 'vue'

function useBlinking(options = {}) {
  const { minInterval = 3000, maxInterval = 7000, blinkDuration = 150 } = options
  const isBlinking = ref(false)
  let timeoutId = null
  let isUnmounted = false

  const getRandomInterval = () => Math.random() * (maxInterval - minInterval) + minInterval

  const scheduleBlink = () => {
    if (isUnmounted) return
    timeoutId = setTimeout(() => {
      if (isUnmounted) return
      isBlinking.value = true
      setTimeout(() => {
        if (isUnmounted) return
        isBlinking.value = false
        scheduleBlink()
      }, blinkDuration)
    }, getRandomInterval())
  }

  onMounted(() => {
    scheduleBlink()
  })

  onUnmounted(() => {
    isUnmounted = true
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  })

  return { isBlinking }
}
export default useBlinking
