"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from storage on app start
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user")
        if (userJson) {
          setUser(JSON.parse(userJson))
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    // In a real app, you would validate credentials against a backend
    // This is a simplified example for demonstration

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user exists in AsyncStorage
    const usersJson = await AsyncStorage.getItem("users")
    const users = usersJson ? JSON.parse(usersJson) : []

    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (!foundUser) {
      throw new Error("Invalid credentials")
    }

    // Create user object without password
    const authenticatedUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
    }

    // Save to state and storage
    setUser(authenticatedUser)
    await AsyncStorage.setItem("user", JSON.stringify(authenticatedUser))
  }

  const signup = async (name: string, email: string, password: string) => {
    // In a real app, you would send this data to a backend
    // This is a simplified example for demonstration

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const usersJson = await AsyncStorage.getItem("users")
    const users = usersJson ? JSON.parse(usersJson) : []

    if (users.some((u: any) => u.email === email)) {
      throw new Error("User already exists")
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In a real app, this would be hashed
    }

    // Add to users array and save
    users.push(newUser)
    await AsyncStorage.setItem("users", JSON.stringify(users))

    // Create user object without password for state
    const authenticatedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    }

    // Save to state and storage
    setUser(authenticatedUser)
    await AsyncStorage.setItem("user", JSON.stringify(authenticatedUser))
  }

  const logout = async () => {
    // Clear user from state and storage
    setUser(null)
    await AsyncStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

