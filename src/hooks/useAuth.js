import { createContext, useContext, useState, useEffect } from "react"
import { getUser, clearSession } from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser())

  useEffect(() => {
    const onChange = () => setUser(getUser())
    window.addEventListener("auth-change", onChange)
    return () => window.removeEventListener("auth-change", onChange)
  }, [])

  const logout = () => {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
