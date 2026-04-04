import request from '@renderer/utils/http'

const URL = '/purchase-orders'

export const purchaseOrderApi = {
  getPurchaseOrders: (data) => request.get(URL, data),
  getPurchaseOrderByid: (id) => request.get(`${URL}/${id}`),
  createPurchaseOrder: (data) => request.post(URL, data),
  updatePurchaseOrder: (id, data) => request.put(`${URL}/${id}`, data),
  deletePurchaseOrder: (id) => request.delete(`${URL}/${id}`)
}
