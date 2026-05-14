import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface PrivateRouteProps {
    allowedRoles?: string[]
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
    const { isAuthenticated, user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A3C5E]"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}

export default PrivateRoute