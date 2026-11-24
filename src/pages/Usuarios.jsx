import { useEffect, useState } from 'react';
import { Users as UsersIcon, Shield, User } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) setUsuarios(data);
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Personal y Usuarios</h1>
        <p className="text-gray-400">Lista de perfiles con acceso al sistema</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-950 border-b border-gray-800">
              <tr>
                <th className="px-6 py-5">Nombre Completo</th>
                <th className="px-6 py-5">Rol del Sistema</th>
                <th className="px-6 py-5 text-right">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="text-center py-10 text-gray-500">Cargando usuarios...</td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-10 text-gray-500">No hay usuarios registrados.</td>
                </tr>
              ) : (
                usuarios.map((usr) => (
                  <tr key={usr.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-gray-800 p-2 rounded-full mr-3">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="font-bold text-white">{usr.nombre_completo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        usr.rol === 'admin' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {usr.rol === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                        {usr.rol.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {new Date(usr.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}