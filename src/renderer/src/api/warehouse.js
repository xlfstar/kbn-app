import request from '@renderer/utils/http'

const apiUrl = {
  WAREHOUSE_URL: '/warehouses',
  WAREHOUSE_AREA_URL: '/warehouse-areas',
  WAREHOUSE_LOCATION_URL: '/warehouse-locations',
  WAREHOUSE_TYPE_URL: '/warehouse-types',
  WAREHOUSE_ZONE_URL: '/zones',
  WAREHOUSE_LOCATION_TYPE_URL: '/warehouse-location-types'
}
export const warehouseApi = {
  getWarehouseList: (data) => request.get(apiUrl.WAREHOUSE_URL, data),
  createWarehouse: (data) => request.post(apiUrl.WAREHOUSE_URL, data),
  updateWarehouse: (data) => request.put(`${apiUrl.WAREHOUSE_URL}/${data.id}`, data),
  removeWarehouse: (id) => request.delete(`${apiUrl.WAREHOUSE_URL}/${id}`),
  removeWarehouses: (data) => request.delete(apiUrl.WAREHOUSE_URL, data),
  getWarehouseById: (id) => request.get(`${apiUrl.WAREHOUSE_URL}/${id}`),
  getAllWarehouses: () => request.get(apiUrl.WAREHOUSE_URL + '?page=1&pageSize=1000')
}
export const warehouseAreaApi = {
  getWarehouseAreaList: (data) => request.get(apiUrl.WAREHOUSE_AREA_URL, data),
  createWarehouseArea: (data) => request.post(apiUrl.WAREHOUSE_AREA_URL, data),
  updateWarehouseArea: (data) => request.put(`${apiUrl.WAREHOUSE_AREA_URL}/${data.id}`, data),
  removeWarehouseArea: (id) => request.delete(`${apiUrl.WAREHOUSE_AREA_URL}/${id}`),
  removeWarehouseAreas: (data) => request.delete(apiUrl.WAREHOUSE_AREA_URL, data),
  getWarehouseAreaById: (id) => request.get(`${apiUrl.WAREHOUSE_AREA_URL}/${id}`),
  getAllWarehouseAreas: () => request.get(apiUrl.WAREHOUSE_AREA_URL + '?page=1&pageSize=1000')
}
export const warehouseLocationApi = {
  getWarehouseLocationList: (data) => request.get(apiUrl.WAREHOUSE_LOCATION_URL, data),
  createWarehouseLocation: (data) => request.post(apiUrl.WAREHOUSE_LOCATION_URL, data),
  updateWarehouseLocation: (data) =>
    request.put(`${apiUrl.WAREHOUSE_LOCATION_URL}/${data.id}`, data),
  removeWarehouseLocation: (id) => request.delete(`${apiUrl.WAREHOUSE_LOCATION_URL}/${id}`),
  removeWarehouseLocations: (data) => request.delete(apiUrl.WAREHOUSE_LOCATION_URL, data),
  getWarehouseLocationById: (id) => request.get(`${apiUrl.WAREHOUSE_LOCATION_URL}/${id}`),
  batchCreateWarehouseLocation: (data) =>
    request.post(apiUrl.WAREHOUSE_LOCATION_URL + '/bulk', data),
  getMaxShelfNoByWarehouseId: (data) =>
    request.get(apiUrl.WAREHOUSE_LOCATION_URL + '/max-shelf-no', data)
}
export const warehouseTypeApi = {
  getWarehouseTypeList: (data) => request.get(apiUrl.WAREHOUSE_TYPE_URL, data),
  createWarehouseType: (data) => request.post(apiUrl.WAREHOUSE_TYPE_URL, data),
  updateWarehouseType: (data) => request.put(`${apiUrl.WAREHOUSE_TYPE_URL}/${data.id}`, data),
  removeWarehouseType: (id) => request.delete(`${apiUrl.WAREHOUSE_TYPE_URL}/${id}`),
  removeWarehouseTypes: (data) => request.delete(apiUrl.WAREHOUSE_TYPE_URL, data),
  getWarehouseTypeById: (id) => request.get(`${apiUrl.WAREHOUSE_TYPE_URL}/${id}`),
  getAllWarehouseTypes: () => request.get(apiUrl.WAREHOUSE_TYPE_URL + '?page=1&pageSize=1000')
}
export const warehouseZoneApi = {
  getWarehouseZoneList: (data) => request.get(apiUrl.WAREHOUSE_ZONE_URL, data),
  createWarehouseZone: (data) => request.post(apiUrl.WAREHOUSE_ZONE_URL, data),
  updateWarehouseZone: (data) => request.put(`${apiUrl.WAREHOUSE_ZONE_URL}/${data.id}`, data),
  removeWarehouseZone: (id) => request.delete(`${apiUrl.WAREHOUSE_ZONE_URL}/${id}`),
  removeWarehouseZones: (data) => request.delete(apiUrl.WAREHOUSE_ZONE_URL, data),
  getWarehouseZoneById: (id) => request.get(`${apiUrl.WAREHOUSE_ZONE_URL}/${id}`),
  getAllWarehouseZones: () => request.get(apiUrl.WAREHOUSE_ZONE_URL + '?page=1&pageSize=1000')
}
export const warehouseLocationTypeApi = {
  getWarehouseLocationTypeList: (data) => request.get(apiUrl.WAREHOUSE_LOCATION_TYPE_URL, data),
  createWarehouseLocationType: (data) => request.post(apiUrl.WAREHOUSE_LOCATION_TYPE_URL, data),
  updateWarehouseLocationType: (data) =>
    request.put(`${apiUrl.WAREHOUSE_LOCATION_TYPE_URL}/${data.id}`, data),
  removeWarehouseLocationType: (id) =>
    request.delete(`${apiUrl.WAREHOUSE_LOCATION_TYPE_URL}/${id}`),
  removeWarehouseLocationTypes: (data) => request.delete(apiUrl.WAREHOUSE_LOCATION_TYPE_URL, data),
  getWarehouseLocationTypeById: (id) => request.get(`${apiUrl.WAREHOUSE_LOCATION_TYPE_URL}/${id}`),
  getAllWarehouseLocationTypes: () =>
    request.get(apiUrl.WAREHOUSE_LOCATION_TYPE_URL + '?page=1&pageSize=1000')
}
