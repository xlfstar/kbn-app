import request from '@renderer/utils/http'

const apiUrl = {
  DEPARTMENT_URL: '/departments'
}
export const dptApi = {
  getDepartmentList: (data) => request.get(apiUrl.DEPARTMENT_URL, data),
  createDepartment: (data) => request.post(apiUrl.DEPARTMENT_URL, data),
  updateDepartment: (data) => request.put(`${apiUrl.DEPARTMENT_URL}/${data.id}`, data),
  removeDepartment: (id) => request.delete(`${apiUrl.DEPARTMENT_URL}/${id}`),
  removeDepartments: (data) => request.delete(apiUrl.DEPARTMENT_URL, data),
  getDepartmentById: (id) => request.get(`${apiUrl.DEPARTMENT_URL}/${id}`),
  getAllDepartments: () => request.get(apiUrl.DEPARTMENT_URL, { page: 1, pageSize: 999 })
}
