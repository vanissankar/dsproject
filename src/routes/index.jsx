import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import MainLayout from '../layouts/MainLayout'
import LoginPage from '../pages/LoginPage'
import AdminDashboard from '../pages/AdminDashboard'
import CleaningPage from '../pages/CleaningPage'
import DiseasePage from '../pages/DiseasePage'
import ScannerPage from '../pages/ScannerPage'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cleaning"
            element={
              <ProtectedRoute allowedRoles={['cleaner']}>
                <CleaningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disease"
            element={
              <ProtectedRoute allowedRoles={['disease']}>
                <DiseasePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scanner"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ScannerPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRouter
