import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.response?.statusText ??
      'An unexpected error occurred.'

    const validationErrors = error.response?.data?.errors ?? null

    return Promise.reject({ message, validationErrors, status: error.response?.status })
  }
)

export default apiClient
