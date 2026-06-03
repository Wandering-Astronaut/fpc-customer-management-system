import { useState, useEffect, useCallback, useRef } from 'react'
import { customerApi } from '../services/customers.js'

/**
 * Custom hook that manages customer list state, pagination, and search.
 * Debounces the search query to avoid hammering the API.
 */
export function useCustomers() {
  const [customers, setCustomers]   = useState([])
  const [meta, setMeta]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const debounceRef                 = useRef(null)

  const fetchCustomers = useCallback(async (searchVal, pageVal) => {
    setLoading(true)
    setError(null)
    try {
      const data = await customerApi.list({ search: searchVal, page: pageVal, perPage: 10 })
      setCustomers(data.data)
      setMeta(data.meta)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce search, reset page to 1 on new query
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchCustomers(search, 1)
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [search]) // eslint-disable-line

  useEffect(() => {
    fetchCustomers(search, page)
  }, [page]) // eslint-disable-line

  const refresh = () => fetchCustomers(search, page)

  return {
    customers,
    meta,
    loading,
    error,
    search, setSearch,
    page,   setPage,
    refresh,
  }
}
