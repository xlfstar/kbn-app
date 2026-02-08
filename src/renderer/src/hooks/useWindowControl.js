import { ref, onMounted } from 'vue'

/**
 * 简化的 Electron 窗口控制 Hook
 * 只处理：最大化、最小化、还原、关闭
 */
function useWindowControls() {
  // 状态
  const isMaximized = ref(false)
  const isAvailable = ref(false)

  // 检查 Electron API 是否可用
  const checkElectronAPI = () => {
    const hasElectronAPI = window.electron && typeof window.electron === 'object'
    const hasIPC = window.electron?.ipcRenderer
    isAvailable.value = hasElectronAPI && hasIPC
    return isAvailable.value
  }

  // 安全调用 Electron API
  const safeCall = async (method) => {
    try {
      if (!checkElectronAPI()) {
        throw new Error('Electron API 不可用')
      }

      // 调用主进程方法
      return await window.electron.ipcRenderer.invoke(method)
    } catch (error) {
      console.error('调用窗口控制失败:', error)
      return null
    }
  }

  // 获取窗口状态
  const getWindowStatus = async () => {
    if (!isAvailable.value) return

    const maximized = await safeCall('window-is-maximized')
    if (maximized !== null) {
      isMaximized.value = maximized
    }
  }

  // 窗口控制方法
  const minimize = async () => {
    await safeCall('window-minimize')
    await getWindowStatus()
  }

  const maximize = async () => {
    await safeCall('window-maximize')
    await getWindowStatus()
  }

  const unmaximize = async () => {
    await safeCall('window-unmaximize')
    await getWindowStatus()
  }

  // 切换最大化/还原
  const toggleMaximize = async () => {
    await safeCall('window-toggle-maximize')
    await getWindowStatus()
  }

  const close = async () => {
    await safeCall('window-close')
  }

  // 初始化
  onMounted(async () => {
    checkElectronAPI()
    if (isAvailable.value) {
      await getWindowStatus()

      // 监听窗口状态变化
      if (window.electron.ipcRenderer.on) {
        window.electron.ipcRenderer.on('window-maximized', () => {
          isMaximized.value = true
        })

        window.electron.ipcRenderer.on('window-unmaximized', () => {
          isMaximized.value = false
        })
      }
    }
  })

  return {
    // 状态
    isMaximized,
    isAvailable,

    // 控制方法
    minimize,
    maximize,
    unmaximize,
    toggleMaximize,
    close
  }
}
export default useWindowControls
