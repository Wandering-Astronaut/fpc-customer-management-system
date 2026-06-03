import apiClient from './client.js'

/**
 * HTTP client for the Laravel Customer API (not the backend itself).
 * Backend lives at the repo root: /api
 */
export const customerApi = {
  list: (params = {}) =>
    apiClient.get('/customers', {
      params: {
        page:     params.page     ?? 1,
        per_page: params.perPage  ?? 15,
        search:   params.search   || undefined,
      },
    }).then((r) => r.data),

  get: (id) =>
    apiClient.get(`/customers/${id}`).then((r) => r.data),

  create: (data) =>
    apiClient.post('/customers', data).then((r) => r.data),

  update: (id, data) =>
    apiClient.put(`/customers/${id}`, data).then((r) => r.data),

  delete: (id) =>
    apiClient.delete(`/customers/${id}`).then((r) => r.data),
}
