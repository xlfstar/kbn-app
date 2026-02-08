import request from '@renderer/utils/http'

const apiUrl = {
  AREA_URL: '/areas'
}
export const areaApi = {
  getAreaList: (data) => request.get(apiUrl.AREA_URL + '?tree=true', data),
  createArea: (data) => request.post(apiUrl.AREA_URL, data),
  updateArea: (data) => request.put(`${apiUrl.AREA_URL}/${data.id}`, data),
  removeArea: (id) => request.delete(`${apiUrl.AREA_URL}/${id}`),
  removeAreas: (data) => request.delete(apiUrl.AREA_URL, data),
  getAreaById: (id) => request.get(`${apiUrl.AREA_URL}/${id}`),
  getAllAreas: () => request.get(apiUrl.AREA_URL + '?tree=true&parentId=null&page=1&pageSize=1000')
}
