import request from '@renderer/utils/http'

const apiUrl = {
  USER_URL: '/admins'
}
export const usersApi = {
  getUserList: (data) => request.get(apiUrl.USER_URL, data),
  createUser: (data) => request.post(apiUrl.USER_URL, data),
  updateUser: (data) => request.put(`${apiUrl.USER_URL}/${data.id}`, data),
  removeUser: (id) => request.delete(`${apiUrl.USER_URL}/${id}`),
  removeUsers: (data) => request.delete(apiUrl.USER_URL, data)
}
