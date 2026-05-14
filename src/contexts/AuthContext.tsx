import React, { createContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '../api/authApi'
import type { AuthResponse, User, StoredUser } from '../types/auth.types'
import { isTokenValid } from '../api/axiosConfig'
import toast from 'react-hot-toast'

interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
    hasRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('token')
            const storedUser = localStorage.getItem('user')

            if (storedToken && isTokenValid() && storedUser) {
                try {
                    const parsedUser: StoredUser = JSON.parse(storedUser)
                    setToken(storedToken)

                    // Convertir StoredUser en User - INCLURE IMAGEURL
                    const userData: User = {
                        id: parsedUser.id,
                        name: parsedUser.name,
                        email: parsedUser.email,
                        role: parsedUser.role,
                        imageUrl: parsedUser.imageUrl,  // ← AJOUTER CETTE LIGNE
                        accountNonLocked: true,
                        createdAt: new Date().toISOString(),
                    }
                    setUser(userData)
                } catch (error) {
                    console.error('Error parsing stored user:', error)
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                }
            }
            setIsLoading(false)
        }

        loadUser()
    }, [])

    const login = async (email: string, password: string) => {
        try {
            const response: AuthResponse = await authApi.login({ email, password })
            const { token, type, expiration, imageUrl, ...userData } = response

            // Stocker les données dans localStorage - INCLURE IMAGEURL
            const storedUser: StoredUser = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                type: type,
                expiration: expiration,
                imageUrl: imageUrl,  // ← AJOUTER CETTE LIGNE
            }

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(storedUser))
            setToken(token)

            // Créer l'objet User pour l'état - INCLURE IMAGEURL
            const userState: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                imageUrl: imageUrl,  // ← AJOUTER CETTE LIGNE
                accountNonLocked: true,
                createdAt: new Date().toISOString(),
            }
            setUser(userState)
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed'
            toast.error(message)
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
        // Pas de toast ici car il est déjà géré dans la page login
    }

    const hasRole = (roles: string[]): boolean => {
        if (!user) return false
        return roles.includes(user.role)
    }

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user && isTokenValid(),
        hasRole,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = React.useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}