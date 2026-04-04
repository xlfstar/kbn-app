import request from '@renderer/utils/http'

const apiUrl = {
  UPLOAD_URL: '/upload'
}
export const UploadApi = {
  uploadFile: (data, config) => request.post(apiUrl.UPLOAD_URL + '/file', data, config),
  uploadImage: (data, config) => request.post(apiUrl.UPLOAD_URL + '/image', data, config)
}
