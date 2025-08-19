'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: 'student' | 'teacher' | 'admin'
  isDemo: boolean
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    notifications: boolean
    studyGoal: number
  }
}

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Partial<User>) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  demoLogin: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Demo user data
  const demoUser: User = {
    id: 'demo-1',
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@demo.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'student',
    isDemo: true,
    preferences: {
      theme: 'light',
      notifications: true,
      studyGoal: 25
    }
  }

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('examPrepUser')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to parse saved user:', error)
        localStorage.removeItem('examPrepUser')
      }
    }
    setIsLoading(false)
  }, [])

  const saveUserToStorage = (userData: User | null) => {
    if (userData) {
      localStorage.setItem('examPrepUser', JSON.stringify(userData))
    } else {
      localStorage.removeItem('examPrepUser')
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, accept any email/password combination
      if (email && password) {
        const mockUser: User = {
          id: 'user-1',
          firstName: email.split('@')[0],
          lastName: 'User',
          email,
          avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=0ea5e9&color=fff&size=150`,
          role: 'student',
          isDemo: false,
          preferences: {
            theme: 'light',
            notifications: true,
            studyGoal: 20
          }
        }
        
        setUser(mockUser)
        saveUserToStorage(mockUser)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        firstName: userData.firstName || 'New',
        lastName: userData.lastName || 'User',
        email: userData.email || 'user@example.com',
        avatar: `https://ui-avatars.com/api/?name=${userData.firstName || 'New'}&background=0ea5e9&color=fff&size=150`,
        role: 'student',
        isDemo: false,
        preferences: {
          theme: 'light',
          notifications: true,
          studyGoal: 20
        }
      }
      
      setUser(newUser)
      saveUserToStorage(newUser)
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    saveUserToStorage(null)
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      saveUserToStorage(updatedUser)
    }
  }

  const demoLogin = () => {
    setUser(demoUser)
    saveUserToStorage(demoUser)
  }

  const value: UserContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    demoLogin
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
