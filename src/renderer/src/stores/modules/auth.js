import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { authApi } from '@renderer/api/auth'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@renderer/stores'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // 状态
    const groupList = ref([])
    const router = useRouter()
    const token = ref('')
    const user = ref(null)
    const rememberMe = ref(false)
    const isAuthenticated = ref(false)
    const initLoginForm = reactive({
      username: '',
      password: ''
    })

    // 临时状态（不持久化）
    const loading = ref(false)
    const error = ref('')

    // 计算属性
    const isLoggedIn = computed(() => !!token.value)
    const userName = computed(() => user.value?.name || '')

    // 方法
    const login = async (loginData) => {
      loading.value = true
      error.value = ''
      try {
        const res = await authApi.login(loginData)
        token.value = res.data.token
        user.value = res.data.user
        if (loginData.rememberMe) {
          rememberMe.value = true
          initLoginForm.username = loginData.username
          initLoginForm.password = loginData.password
        } else {
          rememberMe.value = false
          initLoginForm.username = ''
          initLoginForm.password = ''
        }
        isAuthenticated.value = true
        await fetchGroups()
        // 初始化菜单与动态路由
        try {
          await useMenuStore().initRoutes()
        } catch {}
        router.push('/')
      } catch (err) {
        error.value = err.message || '登录失败'
      } finally {
        loading.value = false
      }
    }

    const fetchGroups = async () => {
      try {
        const groupRes = await authApi.getGroups({ page: 1, pageSize: 999 })
        groupList.value = groupRes.data.items
      } catch (err) {
        console.log(err.message)
      }
    }
    const logout = () => {
      token.value = ''
      user.value = null
      // 临时状态重置
      loading.value = false
      error.value = ''
      isAuthenticated.value = false
      // 重置菜单
      try {
        useMenuStore().reset()
      } catch {}
    }

    const updateUser = (userData) => {
      user.value = { ...user.value, ...userData }
    }

    return {
      // 状态（会被持久化的）
      token,
      user,
      rememberMe,
      isAuthenticated,
      initLoginForm,
      groupList,

      // 临时状态（不会被持久化）
      loading,
      error,

      // 计算属性
      isLoggedIn,
      userName,

      // 方法
      login,
      logout,
      updateUser,
      fetchGroups
    }
  },
  {
    // 持久化配置
    persist: {
      key: 'auth',
      storage: localStorage,
      paths: ['token', 'user', 'rememberMe']
    }
  }
)
