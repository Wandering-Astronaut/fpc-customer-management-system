import { useState, useEffect, useCallback, useRef } from 'react'
import { customerApi } from '../services/customers.js'

/**
 * Manages customer list, search (debounced), and pagination.
 * Uses a single fetch per query change to avoid layout flicker.
 */
export function useCustomers() {
  const [customers, setCustomers] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearchInput] = useState('')
  const [query, setQuery] = useState({ search: '', page: 1 })
  const debounceRef = useRef(null)
  const requestIdRef = useRef(0)

  // Debounce search input → update query (reset to page 1)
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setQuery((prev) => ({ search: search.trim(), page: 1 }))
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  const fetchCustomers = useCallback(async (searchVal, pageVal) => {
    const id = ++requestIdRef.current
    setFetching(true)
    setError(null)
    try {
      const data = await customerApi.list({
        search: searchVal,
        page: pageVal,
        perPage: 10,
      })
      if (id !== requestIdRef.current) return
      setCustomers(data.data ?? [])
      setMeta(data.meta ?? null)
    } catch (err) {
      if (id !== requestIdRef.current) return
      setError(err.message)
    } finally {
      if (id !== requestIdRef.current) return
      setLoading(false)
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers(query.search, query.page)
  }, [query, fetchCustomers])

  const setSearch = (value) => setSearchInput(value)

  const setPage = (pageOrFn) => {
    setQuery((prev) => ({
      ...prev,
      page: typeof pageOrFn === 'function' ? pageOrFn(prev.page) : pageOrFn,
    }))
  }

  const refresh = () => fetchCustomers(query.search, query.page)

  return {
    customers,
    meta,
    loading,
    fetching,
    error,
    search,
    setSearch,
    page: query.page,
    setPage,
    refresh,
  }
}
