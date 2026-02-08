import request from '@renderer/utils/http'

const apiUrl = {
  GOODS_URL: '/goods',
  PACKAGE_URL: 'packaging-units',
  WEIGHT_URL: 'weight-units'
}
export const goodsApi = {
  getGoodsList: (data) => request.get(apiUrl.GOODS_URL, data),
  createGoods: (data) => request.post(apiUrl.GOODS_URL, data),
  updateGoods: (data) => request.put(`${apiUrl.GOODS_URL}/${data.id}`, data),
  removeGoods: (id) => request.delete(`${apiUrl.GOODS_URL}/${id}`),
  removeGoodsList: (data) => request.delete(apiUrl.GOODS_URL, data),
  getGoodsById: (id) => request.get(`${apiUrl.GOODS_URL}/${id}`),
  getPackageList: (data) => request.get(apiUrl.PACKAGE_URL, data),
  getWeightList: (data) => request.get(apiUrl.WEIGHT_URL, data),
  createPackage: (data) => request.post(apiUrl.PACKAGE_URL, data),
  createWeight: (data) => request.post(apiUrl.WEIGHT_URL, data),
  updatePackage: (data) => request.put(`${apiUrl.PACKAGE_URL}/${data.id}`, data),
  updateWeight: (data) => request.put(`${apiUrl.WEIGHT_URL}/${data.id}`, data),
  removePackage: (id) => request.delete(`${apiUrl.PACKAGE_URL}/${id}`),
  removeWeight: (id) => request.delete(`${apiUrl.WEIGHT_URL}/${id}`),
  removePackageList: (data) => request.delete(apiUrl.PACKAGE_URL, data),
  removeWeightList: (data) => request.delete(apiUrl.WEIGHT_URL, data),
  getPackageById: (id) => request.get(`${apiUrl.PACKAGE_URL}/${id}`),
  getWeightById: (id) => request.get(`${apiUrl.WEIGHT_URL}/${id}`)
}
