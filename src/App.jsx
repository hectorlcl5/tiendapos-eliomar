import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/layout/MainLayout';
import Reportes from './pages/Reportes';

// Mock components temporales (Reemplazaremos estos luego)
import Ventas from './pages/Ventas';
import Productos from './pages/Productos';
import Usuarios from './pages/Usuarios';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="animate-pulse text-xl">Cargando sistema...</div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas envueltas en MainLayout */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/ventas" element={
          <ProtectedRoute>
            <MainLayout>
              <Ventas />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/reportes" element={
          <ProtectedRoute>
            <MainLayout>
               <Reportes />
              </MainLayout>
          </ProtectedRoute>
        } /> 
                    
        <Route path="/productos" element={
          <ProtectedRoute>
            <MainLayout>
              <Productos />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/usuarios" element={
          <ProtectedRoute>
            <MainLayout>
              <Usuarios />
            </MainLayout>
          </ProtectedRoute>
        } />

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;