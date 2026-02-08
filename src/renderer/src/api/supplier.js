import request from '@renderer/utils/http'

const apiUrl = {
  SUPPLIER_URL: '/suppliers'
}
export const supplierApi = {
  getSupplierList: (data) => request.get(apiUrl.SUPPLIER_URL, data),
  createSupplier: (data) => request.post(apiUrl.SUPPLIER_URL, data),
  updateSupplier: (data) => request.put(`${apiUrl.SUPPLIER_URL}/${data.id}`, data),
  removeSupplier: (id) => request.delete(`${apiUrl.SUPPLIER_URL}/${id}`),
  removeSupplierList: (data) => request.delete(apiUrl.SUPPLIER_URL, data),
  getSupplierById: (id) => request.get(`${apiUrl.SUPPLIER_URL}/${id}`)
}
