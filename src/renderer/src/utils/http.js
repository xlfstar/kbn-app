// utils/request.js
import axios from 'axios'
import { useAuthStore } from '@renderer/stores'

const instance = axios.create({
  // 基础配置
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 可以在这里添加 token 等认证信息
    // const token = localStorage.getItem('token')
    const token = useAuthStore().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么

    // 根据你的后端返回结构进行调整
    const { data } = response

    // 如果后端有特定的成功码，可以在这里处理
    // if (data.code === 200) {
    //   return data.data;
    // } else {
    //   return Promise.reject(data);
    // }

    return data
  },
  (error) => {
    // 对响应错误做点什么

    let errorMessage = '请求失败'

    if (error.response) {
      // 请求成功发出且服务器也响应了状态码，但状态码超出了 2xx 的范围
      const { status, data } = error.response

      switch (status) {
        case 400:
          errorMessage = data.message || '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          // 可以在这里跳转到登录页
          // window.location.href = '/login';
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求地址不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        case 502:
          errorMessage = '网关错误'
          break
        case 503:
          errorMessage = '服务不可用'
          break
        case 504:
          errorMessage = '网关超时'
          break
        default:
          errorMessage = data.message || `请求失败: ${status}`
      }
    } else if (error.request) {
      // 请求已经成功发起，但没有收到响应
      if (error.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请检查网络连接'
      } else {
        errorMessage = '网络错误，请检查网络连接'
      }
    } else {
      // 发送请求时出了点问题
      errorMessage = error.message || '请求发送失败'
    }
    console.error(errorMessage)
    // 显示错误提示（根据你的 UI 框架选择合适的方式）
    // if (message) {
    //   // message.error(errorMessage)
    // } else {
    //   console.error(errorMessage)
    //   // 或者使用 Electron 的 dialog
    //   // window.electron?.dialog?.showErrorBox?.('请求错误', errorMessage);
    // }

    return Promise.reject(error)
  }
)

// 封装的请求方法
const request = {
  // GET 请求
  get: (url, params = {}, config = {}) => {
    return instance.get(url, {
      params,
      ...config
    })
  },

  // POST 请求
  post: (url, data = {}, config = {}) => {
    return instance.post(url, data, config)
  },

  // PUT 请求
  put: (url, data = {}, config = {}) => {
    return instance.put(url, data, config)
  },

  // DELETE 请求
  delete: (url, params = {}, config = {}) => {
    return instance.delete(url, {
      params,
      ...config
    })
  },

  // PATCH 请求
  patch: (url, data = {}, config = {}) => {
    return instance.patch(url, data, config)
  },

  // 上传文件（FormData）
  upload: (url, formData, config = {}) => {
    return instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  },

  // 下载文件（获取 blob 数据）
  download: (url, params = {}, config = {}) => {
    return instance.get(url, {
      params,
      responseType: 'blob',
      ...config
    })
  },

  // 原始 axios 实例，用于特殊情况
  axiosInstance: instance,

  // 设置 baseURL
  setBaseURL: (baseURL) => {
    instance.defaults.baseURL = baseURL
  },

  // 设置 token
  setToken: (token) => {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },

  // 移除 token
  removeToken: () => {
    delete instance.defaults.headers.common['Authorization']
  },

  // 设置请求头
  setHeader: (key, value) => {
    instance.defaults.headers.common[key] = value
  }
}

export default request
