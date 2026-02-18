import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import RecetasPage from './pages/RecetasPage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RecetaDetailPage from './pages/RecetaDetailPage'
import ProtectedRoute from './routing/ProtectedRoute'

function App() {

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/recetas" replace />} />
        <Route path='recetas' element={<ProtectedRoute><RecetasPage /></ProtectedRoute>} />
        <Route path='about' element={<AboutPage />} />
        <Route path='perfil' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path='login' element={<LoginPage />} />
        <Route path='recetas/:id' element={<ProtectedRoute><RecetaDetailPage /></ProtectedRoute>} />
        <Route path='*' element={<p className='card'>La página indicada no existe</p>} />
      </Route>
    </Routes>
  )
}

export default App
