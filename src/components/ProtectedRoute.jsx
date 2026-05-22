import { Navigate, Outlet } from 'react-router-dom'
import { getUser, ROLE_DEFAULT_ROUTE } from '../utils/auth'

function ProtectedRoute({ allowedRoles, children }) {
  const user = getUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_DEFAULT_ROUTE[user.role]} replace />
  }

  return children || <Outlet />
}

export default ProtectedRoute
