<template>
  <Transition name="modal">
    <div
      v-if="visible"
      class="modal-container absolute w-full h-full flex items-center justify-center"
    >
      <div class="mask"></div>
      <login-com />
    </div>
  </Transition>
</template>
<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@renderer/stores'
import { LoginCom } from '@renderer/components'
const authStore = useAuthStore()

const visible = computed(() => !authStore.isAuthenticated)
</script>
<style scoped lang="scss">
.modal-container {
  z-index: 99;
  -webkit-app-region: drag;
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg-color);
  }
  .modal-body {
    position: relative;
    background-color: var(--bg-content-color);
    padding: 30px;
  }
}
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
