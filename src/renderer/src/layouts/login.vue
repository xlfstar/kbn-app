<template>
  <Transition name="modal">
    <div
      v-if="visible"
      class="modal-container absolute w-full h-full flex items-center justify-center"
    >
      <div class="mask"></div>
      <div class="modal-body">
        <div class="font-bold text-xl text-center mb-4">{{ t('login.login') }}</div>
        <div>
          <n-form ref="formRef" :model="loginForm" :rules="rules" label-placement="left">
            <n-form-item path="username" label="">
              <n-input v-model:value="loginForm.username" :placeholder="t('login.username')">
                <template #prefix>
                  <Icon name="icon-yonghu" size="16px" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item path="password" label="">
              <n-input
                v-model:value="loginForm.password"
                :placeholder="t('login.password')"
                type="password"
                show-password-on="mousedown"
              >
                <template #prefix>
                  <Icon name="icon-lock" size="16px" />
                </template>
              </n-input>
            </n-form-item>
          </n-form>
          <div class="flex justify-end mb-4">
            <n-checkbox v-model:checked="remember">
              <span class="text-blue-500"> {{ t('login.rememberMe') }}</span>
            </n-checkbox>
          </div>
          <div>
            <n-button type="primary" @click="handleLogin" block>{{ t('login.login') }}</n-button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { t } from '@renderer/locales'
import { Icon } from '@renderer/components'
import { useAuthStore } from '@renderer/stores'
import { NForm, NInput, NFormItem, NButton, NCheckbox } from 'naive-ui'
const authStore = useAuthStore()

const formRef = ref(null)
const visible = computed(() => !authStore.isAuthenticated)
const remember = ref(authStore.rememberMe)

const loginForm = reactive(authStore.initLoginForm)
const rules = {
  username: [
    { required: true, message: t('login.usernamePlaceholder'), trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: t('login.passwordPlaceholder'), trigger: ['blur', 'change'] }
  ]
}

const handleLogin = (e) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      await authStore.login({
        username: loginForm.username,
        password: loginForm.password,
        rememberMe: remember.value
      })
    }
  })
}
</script>
<style scoped lang="scss">
.modal-container {
  z-index: 99;
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
