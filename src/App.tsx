import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import RecetasPage from './pages/RecetasPage'
import CrearPage from './pages/RecetaCrearPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RecetaDetailPage from './pages/RecetaDetailPage'
import ProtectedRoute from './routing/ProtectedRoute'

function App() {

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/recetas" replace />} />
        <Route path='recetas' element={<ProtectedRoute><RecetasPage /></ProtectedRoute>} />
        <Route path='crear' element={<ProtectedRoute><CrearPage /></ProtectedRoute>} />
        <Route path='login' element={<LoginPage />} />
        <Route path='register' element={<RegisterPage />} />
        <Route path='recetas/:id' element={<ProtectedRoute><RecetaDetailPage /></ProtectedRoute>} />
        <Route path='*' element={<p className='card'>La página indicada no existe</p>} />
      </Route>
    </Routes>
  )
}

export default App
