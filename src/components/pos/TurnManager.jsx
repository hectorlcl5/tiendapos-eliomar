import { useState, useEffect } from 'react';
import { Calculator, Clock, PlayCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usePosStore } from '../../store/posStore';

export default function TurnManager() {
  const [time, setTime] = useState(new Date());
  const [isStarting, setIsStarting] = useState(false);
  const { user } = useAuthStore();
  const { startSession } = usePosStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartSession = async () => {
    setIsStarting(true);
    await startSession(user.id);
    setIsStarting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 flex flex-col items-center shadow-2xl max-w-md w-full text-center">
        <div className="bg-emerald-500/20 p-5 rounded-full mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <Calculator className="w-12 h-12 text-emerald-400" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">Caja Cerrada</h2>
        <p className="text-gray-400 mb-8">Debes iniciar un turno para poder registrar ventas y facturar.</p>

        <div className="flex items-center space-x-3 bg-gray-950 px-6 py-4 rounded-xl border border-gray-800 mb-8 w-full justify-center">
          <Clock className="w-6 h-6 text-gray-400" />
          <span className="text-2xl font-mono font-semibold text-gray-200 tracking-wider">
            {time.toLocaleTimeString()}
          </span>
        </div>

        <button
          onClick={handleStartSession}
          disabled={isStarting}
          className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:ring-4 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
        >
          <PlayCircle className="w-6 h-6" />
          <span>{isStarting ? 'Abriendo caja...' : 'Abrir Turno de Caja'}</span>
        </button>
      </div>
    </div>
  );
}