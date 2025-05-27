"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../api/auth"

const AuthContext = createContext()

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem("accessToken")
    const user = localStorage.getItem("user")

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user)
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: parsedUser },
        })
      } catch (error) {
        console.error("Error parsing user data:", error)
        logout()
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("user", JSON.stringify(user))

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user },
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData)
      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("user", JSON.stringify(user))

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user },
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Signup failed",
      }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        await authAPI.logout(refreshToken)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")

      dispatch({ type: "LOGOUT" })
    }
  }

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    dispatch({
      type: "UPDATE_USER",
      payload: updatedUser,
    })
  }

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
