import request from '@renderer/utils/http'

const apiUrl = {
  RULES_URL: '/goods-categories'
}
export const categoryApi = {
  getCategories: (data) => request.get(apiUrl.RULES_URL, data),
  createCategory: (data) => request.post(apiUrl.RULES_URL, data),
  updateCategory: (data) => request.put(`${apiUrl.RULES_URL}/${data.id}`, data),
  removeCategory: (id) => request.delete(`${apiUrl.RULES_URL}/${id}`),
  removeCategories: (data) => request.delete(apiUrl.RULES_URL, data),
  getCategoryById: (id) => request.get(`${apiUrl.RULES_URL}/${id}`)
}
