import {useState, useEffect, useCallback} from 'react'

export const useFetch = (url) => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])

  const get = useCallback(async () => {
    const response = await fetch(url)
    const resp = await response.json()
    setData(resp)
    setIsLoading(false)
  }, [url])

  useEffect(() => {
    get()
  }, [url, get])
  return {isLoading, data}
}
