<template>
  <i class="iconfont" :class="name" :style="iconStyle"></i>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  size: {
    type: [Number, String],
    default: '16px'
  },
  color: {
    type: String,
    default: ''
  }
})

const iconStyle = computed(() => {
  const style = {}
  if (props.size) {
    style.fontSize = props.size
  }
  if (props.color) {
    style.color = props.color
  }
  return style
})
</script>
<style scoped>
@import '@renderer/assets/aliFonts/iconfont.css';
</style>
