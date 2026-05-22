import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiHome, FiShield, FiAlertTriangle, FiCamera, FiLogOut, FiUser } from 'react-icons/fi'
import { getUser, logout, ROLE_ALLOWED_ROUTES } from '../utils/auth'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: FiHome },
  { path: '/cleaning', label: 'Cleaning', icon: FiShield },
  { path: '/disease', label: 'Disease', icon: FiAlertTriangle },
  { path: '/scanner', label: 'Scanner', icon: FiCamera },
]

function MainLayout() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const user = getUser()

  const allowedRoutes = user ? ROLE_ALLOWED_ROUTES[user.role] : []
  const visibleNavItems = navItems.filter((item) => allowedRoutes.includes(item.path))

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <FiShield className="text-emerald-600 text-xl" />
              <span className="text-lg font-semibold text-gray-800">
                BioSecure Farm Portal
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`
                  }
                >
                  <item.icon className="text-base" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiUser className="text-gray-400" />
                  <span className="capitalize">{user.role}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <FiLogOut />
                Logout
              </button>
            </div>

            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-4 py-3 space-y-1">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="text-base" />
                  {item.label}
                </NavLink>
              ))}
              {user && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                    <FiUser className="text-gray-400" />
                    <span className="capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-red-600 w-full rounded-md transition-colors"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
