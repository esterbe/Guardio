import { useState, useEffect, useCallback } from "react"
import { fetchApi } from "@/lib/utils"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(endpoint: string, deps: unknown[] = []) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await fetchApi<T>(endpoint)
      setState({ data, loading: false, error: null })
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "An error occurred",
      })
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...deps])

  return { ...state, refetch: fetchData }
}

export function useMutation<T, P = unknown>(
  endpoint: string,
  method: "POST" | "PUT" | "DELETE" = "POST"
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (params?: P): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchApi<T>(endpoint, {
        method,
        body: params ? JSON.stringify(params) : undefined,
      })
      setLoading(false)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
      return null
    }
  }

  return { mutate, loading, error }
}
