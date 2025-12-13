import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: number
  type: 'client' | 'vendor' | 'organizer'
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  city?: string
  companyName?: string
  contactPerson?: string
  createdAt?: string
  favorites?: number[]
  calendar?: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false
}

// Загружаем из localStorage при инициализации
const loadFromStorage = (): AuthState => {
  try {
    const saved = localStorage.getItem('auth')
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        user: parsed.user,
        token: parsed.token,
        isAuthenticated: !!parsed.user
      }
    }
  } catch (error) {
  }
  return initialState
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadFromStorage(),
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token?: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token || null
      state.isAuthenticated = true
      
      // Сохраняем в localStorage
      try {
        localStorage.setItem('auth', JSON.stringify({
          user: action.payload.user,
          token: action.payload.token || null
        }))
      } catch (error) {
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        
        // Обновляем в localStorage
        try {
          const saved = localStorage.getItem('auth')
          if (saved) {
            const parsed = JSON.parse(saved)
            localStorage.setItem('auth', JSON.stringify({
              ...parsed,
              user: state.user
            }))
          }
        } catch (error) {
        }
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      
      // Удаляем из localStorage
      try {
        localStorage.removeItem('auth')
      } catch (error) {
      }
    }
  }
})

export const { setUser, updateUser, logout } = authSlice.actions
export default authSlice.reducer

