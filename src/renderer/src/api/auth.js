// import request from '@renderer/utils/request'
import request from '@renderer/utils/http'
const authUrl = {
  BASE: '/admins',
  SELF_RULES: '/admin-rules/mine',
  GROUPS: '/admin-groups',
  GROUP_ACCESS: '/admin-group-access'
}
export const authApi = {
  login: (data) => request.post(`${authUrl.BASE}/login`, data),
  getMenuTree: () => request.get(authUrl.SELF_RULES),
  getGroups: (data) => request.get(authUrl.GROUPS, data),
  getGroupById: (id) => request.get(`${authUrl.GROUPS}/${id}`),
  createGroup: (data) => request.post(authUrl.GROUPS, data),
  updateGroup: (data) => request.put(`${authUrl.GROUPS}/${data.id}`, data),
  removeGroup: (id) => request.delete(`${authUrl.GROUPS}/${id}`),
  createGroupAccess: (data) => request.post(`${authUrl.GROUP_ACCESS}`, data),
  updateGroupAccess: (userId, groupId) =>
    request.put(`${authUrl.GROUP_ACCESS}/${userId}/${groupId}`)
}
