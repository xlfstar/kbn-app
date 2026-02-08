import request from '@renderer/utils/http'

const apiUrl = {
  RULES_URL: '/admin-rules'
}
export const rulesApi = {
  getAllRules: (data) => request.get(apiUrl.RULES_URL, { ...data, ...{ page: 1, pageSize: 999 } }),
  createRule: (data) => request.post(apiUrl.RULES_URL, data),
  updateRule: (data) => request.put(`${apiUrl.RULES_URL}/${data.id}`, data),
  removeRule: (id) => request.delete(`${apiUrl.RULES_URL}/${id}`)
}
