// src/renderer/utils/request.js
// 不再引入 ipcRenderer，使用 preload 暴露的 window.api
import { useAuthStore } from '@renderer/stores'
import { useMessage } from 'naive-ui' // 如果你使用 antd，或者可以替换成其他 UI 库的提示组件
// 默认配置
const DEFAULT_CONFIG = {
  baseURL: import.meta.env.VITE_APP_API_BASEURL || 'https://localhost:3001/api',
  timeout: 10000
  // cancelTokenSource: new Map()
}

/**
 * 生成请求唯一标识
 * @param {Object} options 请求配置
 * @returns {String} 唯一标识
 */
const generateRequestKey = (options) => {
  const { url, method, params, data } = options
  return [method?.toUpperCase(), url, JSON.stringify(params), JSON.stringify(data)].join('_')
}

/**
 * 核心请求函数
 * @param {Object} options axios 配置项
 * @returns {Promise} 请求结果
 */
const requestCore = async (options) => {
  const authStore = useAuthStore()
  // 1. 合并默认配置
  const headers = Object.assign(
    {},
    {
      'Content-Type': 'application/json',
      // 示例：添加 token（根据你的业务调整）

      ...options.headers
    },
    authStore.token && { Authorization: `Bearer ${authStore.token}` }
  )
  const finalOptions = {
    ...DEFAULT_CONFIG,
    ...options,
    url: options.url, // 拼接完整 URL
    headers
  }

  // 2. 取消重复请求（可选，保留原有逻辑）
  // const requestKey = generateRequestKey(finalOptions)
  // if (DEFAULT_CONFIG.cancelTokenSource.has(requestKey)) {
  //   DEFAULT_CONFIG.cancelTokenSource.get(requestKey).cancel('重复请求已取消')
  //   DEFAULT_CONFIG.cancelTokenSource.delete(requestKey)
  // }
  // 注：axios CancelToken 在渲染进程无需引入，这里简化重复请求逻辑（如需保留可自行调整）

  try {
    // 3. 调用 preload 暴露的 api.requestApi 方法
    const result = await window.api.requestApi(finalOptions)

    // 4. 处理响应结果
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error.message || `请求失败（状态码：${result.error.status}）`)
    }
  } catch (error) {
    // 5. 统一错误处理
    let errorMsg = '网络异常，请稍后重试'
    if (error.message.includes('状态码')) {
      const status = error.message.match(/状态码：(\d+)/)?.[1]
      switch (status) {
        case '401':
          errorMsg = '登录已过期，请重新登录'
          // 示例：触发登录页跳转逻辑
          // window.location.href = '/login'
          break
        case '403':
          errorMsg = '暂无权限访问该资源'
          break
        case '404':
          errorMsg = '请求的接口不存在'
          break
        case '500':
          errorMsg = '服务器内部错误'
          break
        default:
          errorMsg = error.message
      }
    }

    console.error('请求错误1：', errorMsg)
    throw new Error(errorMsg) // 抛出错误供业务层处理
  }
}

// 简化常用请求方法
const request = {
  get: (url, params = {}, options = {}) => requestCore({ method: 'GET', url, params, ...options }),
  post: (url, data = {}, options = {}) => requestCore({ method: 'POST', url, data, ...options }),
  put: (url, data = {}, options = {}) => requestCore({ method: 'PUT', url, data, ...options }),
  delete: (url, params = {}, options = {}) =>
    requestCore({ method: 'DELETE', url, params, ...options }),
  core: requestCore
}

export default request
