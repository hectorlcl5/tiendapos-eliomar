import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Lock, Unlock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePosStore } from '../store/posStore';
import CloseShiftModal from '../components/pos/CloseShiftModal';

export default function Dashboard() {
  const { profile, user } = useAuthStore();
  const { activeSession, checkActiveSession } = usePosStore();
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkActiveSession(user.id);
    }
  }, [user, checkActiveSession]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Encabezado */}
      <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido, <span className="text-blue-500">{profile?.nombre_completo || 'Usuario'}</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Panel de control principal • Rol: <span className="text-gray-300 font-semibold capitalize">{profile?.rol || 'Vendedor'}</span>
          </p>
        </div>

        {/* Tarjeta de Estado de Caja */}
        <div className="bg-gray-950 border border-gray-800 p-5 rounded-2xl flex items-center space-x-6 min-w-[300px]">
          <div>
            <p className="text-sm text-gray-500 mb-1 font-medium">Estado de Caja</p>
            {activeSession ? (
              <div className="flex items-center text-emerald-400 font-bold">
                <Unlock className="w-5 h-5 mr-2" /> Abierta
              </div>
            ) : (
              <div className="flex items-center text-red-400 font-bold">
                <Lock className="w-5 h-5 mr-2" /> Cerrada
              </div>
            )}
          </div>
          
          <div className="flex-1 text-right">
            <button
              onClick={() => setIsCloseModalOpen(true)}
              disabled={!activeSession}
              className="px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-semibold rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              Cerrar Turno
            </button>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div>
        <h2 className="text-xl font-bold text-gray-200 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/ventas" className="group bg-gray-900 border border-gray-800 rounded-3xl p-8 hover:border-blue-500/50 hover:bg-gray-800 transition-all shadow-lg flex items-center cursor-pointer">
            <div className="bg-blue-600/20 p-5 rounded-2xl mr-6 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-10 h-10 text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Punto de Venta</h3>
              <p className="text-gray-400">Ir a la caja y registrar ventas</p>
            </div>
          </Link>

          <Link to="/productos" className="group bg-gray-900 border border-gray-800 rounded-3xl p-8 hover:border-emerald-500/50 hover:bg-gray-800 transition-all shadow-lg flex items-center cursor-pointer">
            <div className="bg-emerald-600/20 p-5 rounded-2xl mr-6 group-hover:scale-110 transition-transform">
              <Package className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Inventario</h3>
              <p className="text-gray-400">Gestionar productos y existencias</p>
            </div>
          </Link>
        </div>
      </div>

      <CloseShiftModal isOpen={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)} />
    </div>
  );
}