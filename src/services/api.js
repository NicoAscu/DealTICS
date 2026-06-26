import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 15000,
})

// Guarda el user_id en memoria para usarlo en las requests
export let currentUserId = null
export const setCurrentUserId = (id) => { currentUserId = id }

export default api