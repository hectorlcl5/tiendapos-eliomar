import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, ShoppingCart, Package, Users, LogOut, UserCircle, BarChart3 } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const { profile, logout } = useAuthStore();

  const navLinks = [
    { name: 'Inicio', path: '/', icon: Home, show: true },
    { name: 'Ventas', path: '/ventas', icon: ShoppingCart, show: true },
    { name: 'Reportes', path: '/reportes', icon: BarChart3, show: true },
    { name: 'Productos', path: '/productos', icon: Package, show: true },
    { name: 'Usuarios', path: '/usuarios', icon: Users, show: profile?.rol === 'admin' },
    
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen text-gray-300">
      {/* Logo */}
      <div className="h-20 flex items-center px-5 border-b border-gray-800">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center mr-3 shrink-0 shadow-lg shadow-emerald-950/40">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
          >
            {/* Base del local */}
            <rect x="8" y="20" width="32" height="20" rx="3" fill="#1E293B" stroke="#38BDF8" strokeWidth="2.5" />
            {/* Puerta */}
            <rect x="13" y="27" width="9" height="13" rx="1.5" fill="#10B981" />
            <circle cx="19.5" cy="33.5" r="1" fill="#ECFDF5" />
            {/* Vitrina */}
            <rect x="26" y="27" width="9" height="7" rx="1.5" fill="#38BDF8" />
            {/* Toldo a rayas */}
            <path d="M6 14L10 8H38L42 14V18C42 20.2091 40.2091 22 38 22C35.7909 22 34 20.2091 34 18C34 20.2091 32.2091 22 30 22C27.7909 22 26 20.2091 26 18C26 20.2091 24.2091 22 22 22C19.7909 22 18 20.2091 18 18C18 20.2091 16.2091 22 14 22C11.7909 22 10 20.2091 10 18C10 20.2091 8.20914 22 6 22V14Z" fill="#F97316" />
            {/* Franjas claras del toldo */}
            <path d="M14 8H20L18 18C18 20.2091 16.2091 22 14 22C11.7909 22 10 20.2091 10 18L14 8Z" fill="#FACC15" />
            <path d="M28 8H34L34 18C34 20.2091 32.2091 22 30 22C27.7909 22 26 20.2091 26 18L28 8Z" fill="#FACC15" />
          </svg>
        </div>
        <div className="leading-tight">
          <h1 className="text-lg font-extrabold text-white tracking-wide">Abasto</h1>
          <span className="text-sm font-bold text-emerald-400 tracking-wider uppercase">
            Eliomar
          </span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navLinks.map(
          (link) =>
            link.show && (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  location.pathname === link.path
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'hover:bg-gray-800 hover:text-white border border-transparent'
                }`}
              >
                <link.icon
                  className={`w-5 h-5 mr-3 ${
                    location.pathname === link.path ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                />
                <span className="font-medium">{link.name}</span>
              </Link>
            )
        )}
      </nav>

      {/* Perfil de Usuario y Logout */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <div className="flex items-center mb-4 px-2">
          <UserCircle className="w-10 h-10 text-gray-500 mr-3" />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">
              {profile?.nombre_completo || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500 capitalize">{profile?.rol || 'Vendedor'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}