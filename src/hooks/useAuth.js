import { useState, useEffect } from 'react'
import { getUser } from '../utils/auth'

export function useAuth() {
  const [user, setUser] = useState(getUser())

  useEffect(() => {
    function onStorage() {
      setUser(getUser())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return user
}
