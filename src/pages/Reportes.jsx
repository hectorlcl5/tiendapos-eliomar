import { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  Receipt,
  ClipboardCheck,
  Eye,
  DollarSign,
  Wallet,
  CreditCard,
  CheckCircle,
  Smartphone,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import SaleDetailModal from '../components/reports/SaleDetailModal';

const PAYMENT_LABELS = {
  usd_efectivo: { label: '$ Efectivo', color: 'text-emerald-400', icon: DollarSign, prefix: '$' },
  bs_efectivo: { label: 'Bs. Efectivo', color: 'text-blue-400', icon: Wallet, prefix: 'Bs.' },
  bs_punto: { label: 'Bs. Punto', color: 'text-purple-400', icon: CreditCard, prefix: 'Bs.' },
  bs_biopago: { label: 'Bs. Bio Pago', color: 'text-orange-400', icon: CheckCircle, prefix: 'Bs.' },
  bs_pagomovil: { label: 'Bs. Pago Móvil', color: 'text-pink-400', icon: Smartphone, prefix: 'Bs.' },
};

const getTodayString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

export default function Reportes() {
  const { user, profile } = useAuthStore();
  const isAdmin = profile?.rol === 'admin';

  const [activeTab, setActiveTab] = useState('ventas');
  const [fechaInicio, setFechaInicio] = useState(getTodayString());
  const [fechaFin, setFechaFin] = useState(getTodayString());
  const [selectedVendor, setSelectedVendor] = useState('todos');

  const [vendedores, setVendedores] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase.from('perfiles').select('id, nombre_completo, rol');
      if (data) setVendedores(data);
    };
    fetchProfiles();
  }, []);

  const vendorMap = useMemo(() => {
    const map = {};
    vendedores.forEach((v) => {
      map[v.id] = v.nombre_completo;
    });
    return map;
  }, [vendedores]);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user?.id) return;
      setIsLoading(true);

      try {
        const startISO = new Date(`${fechaInicio}T00:00:00`).toISOString();
        const endISO = new Date(`${fechaFin}T23:59:59`).toISOString();

        // 1. Consultar sesiones filtradas por rol / vendedor
        let sesionesQuery = supabase.from('sesiones_ventas').select('*');

        if (!isAdmin) {
          sesionesQuery = sesionesQuery.eq('usuario_id', user.id);
        } else if (selectedVendor !== 'todos') {
          sesionesQuery = sesionesQuery.eq('usuario_id', selectedVendor);
        }

        const { data: allUserSessions, error: sesError } = await sesionesQuery;
        if (sesError) throw sesError;

        const sessionIds = (allUserSessions || []).map((s) => s.id);
        const sessionUserMap = {};
        (allUserSessions || []).forEach((s) => {
          sessionUserMap[s.id] = s.usuario_id;
        });

        const filteredSessions = (allUserSessions || [])
          .filter((s) => {
            const fechaStr = s.fecha_apertura || s.created_at;
            if (!fechaStr) return true;
            const fecha = new Date(fechaStr).getTime();
            return fecha >= new Date(startISO).getTime() && fecha <= new Date(endISO).getTime();
          })
          .sort(
            (a, b) =>
              new Date(b.fecha_apertura || b.created_at || 0) -
              new Date(a.fecha_apertura || a.created_at || 0)
          );
        setSesiones(filteredSessions);

        // 2. Consultar ventas de esas sesiones y filtrar por fecha en JS
        if (sessionIds.length > 0) {
          const { data: ventasData, error: ventasError } = await supabase
            .from('ventas')
            .select('*')
            .in('sesion_id', sessionIds);

          if (ventasError) throw ventasError;

          const enrichedVentas = (ventasData || [])
            .map((v) => ({
              ...v,
              usuario_id: sessionUserMap[v.sesion_id],
              fecha_efectiva: v.fecha_venta || v.fecha || v.created_at,
            }))
            .filter((v) => {
              if (!v.fecha_efectiva) return true;
              const fecha = new Date(v.fecha_efectiva).getTime();
              return fecha >= new Date(startISO).getTime() && fecha <= new Date(endISO).getTime();
            })
            .sort((a, b) => new Date(b.fecha_efectiva || 0) - new Date(a.fecha_efectiva || 0));

          setVentas(enrichedVentas);
        } else {
          setVentas([]);
        }
      } catch (error) {
        console.error('Error cargando reportes:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [user, isAdmin, fechaInicio, fechaFin, selectedVendor]);

  const resumen = useMemo(() => {
    const totales = {
      totalBs: 0,
      totalUsd: 0,
      ivaBs: 0,
      metodos: {
        usd_efectivo: 0,
        bs_efectivo: 0,
        bs_punto: 0,
        bs_biopago: 0,
        bs_pagomovil: 0,
      },
    };

    ventas.forEach((v) => {
      totales.totalBs += parseFloat(v.total_bs) || 0;
      totales.totalUsd += parseFloat(v.total) || 0;
      totales.ivaBs += parseFloat(v.iva_bs) || 0;

      if (v.metodo_pago === 'usd_efectivo') {
        totales.metodos.usd_efectivo += parseFloat(v.total) || 0;
      } else if (totales.metodos[v.metodo_pago] !== undefined) {
        totales.metodos[v.metodo_pago] += parseFloat(v.total_bs) || 0;
      }
    });

    return totales;
  }, [ventas]);

  const formatDuration = (start, end) => {
    if (!start) return '—';
    if (!end) return 'En curso';
    const diffMs = new Date(end) - new Date(start);
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado y Filtros */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Historial y Reportes</h1>
          <p className="text-gray-400">
            {isAdmin
              ? 'Vista de Administrador: consolidado general y auditoría por vendedor'
              : 'Tus ventas registradas y cierres de caja'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-xs text-gray-500 mr-2">Desde:</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-transparent text-white text-sm outline-none"
            />
          </div>

          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-xs text-gray-500 mr-2">Hasta:</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-transparent text-white text-sm outline-none"
            />
          </div>

          {isAdmin && (
            <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-blue-400 mr-2" />
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="bg-gray-900 text-white text-sm outline-none pr-2"
              >
                <option value="todos">Todos los vendedores</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nombre_completo}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tarjetas KPI Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Facturado (Bs.)</p>
          <p className="text-2xl font-bold text-blue-400">Bs. {resumen.totalBs.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Ref: ${resumen.totalUsd.toFixed(2)}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">IVA Recaudado</p>
          <p className="text-2xl font-bold text-amber-400">Bs. {resumen.ivaBs.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Impuesto acumulado</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Transacciones</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <p className="text-2xl font-bold text-white">{ventas.length}</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">Ventas en el periodo</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Turnos Registrados</p>
          <p className="text-2xl font-bold text-purple-400">{sesiones.length}</p>
          <p className="text-xs text-gray-500 mt-1">Aperturas en el periodo</p>
        </div>
      </div>

      {/* Desglose por Método de Pago */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(PAYMENT_LABELS).map(([key, info]) => {
          const Icon = info.icon;
          return (
            <div
              key={key}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${info.color}`} />
                <span className="text-xs font-medium text-gray-400">{info.label}</span>
              </div>
              <p className="text-lg font-bold text-white">
                {info.prefix} {resumen.metodos[key].toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex space-x-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('ventas')}
          className={`flex items-center px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'ventas'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Receipt className="w-4 h-4 mr-2" />
          Historial de Ventas ({ventas.length})
        </button>
        <button
          onClick={() => setActiveTab('cierres')}
          className={`flex items-center px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'cierres'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <ClipboardCheck className="w-4 h-4 mr-2" />
          Cierres de Caja ({sesiones.length})
        </button>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {activeTab === 'ventas' ? (
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-950 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Fecha y Hora</th>
                  {isAdmin && <th className="px-6 py-4">Vendedor</th>}
                  <th className="px-6 py-4">Método de Pago</th>
                  <th className="px-6 py-4 text-right">IVA (Bs.)</th>
                  <th className="px-6 py-4 text-right">Total Cobrado</th>
                  <th className="px-6 py-4 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-10 text-gray-500">
                      Cargando ventas...
                    </td>
                  </tr>
                ) : ventas.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-gray-500">
                      No hay ventas registradas en este rango de fechas.
                    </td>
                  </tr>
                ) : (
                  ventas.map((v) => {
                    const methodInfo = PAYMENT_LABELS[v.metodo_pago] || {
                      label: v.metodo_pago,
                      color: 'text-gray-400',
                    };
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-300">
                          {v.fecha_efectiva
                            ? new Date(v.fecha_efectiva).toLocaleString()
                            : 'Sin fecha'}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 font-medium text-white">
                            {vendorMap[v.usuario_id] || 'Usuario'}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${methodInfo.color}`}>
                            {methodInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-amber-400/90">
                          Bs. {(v.iva_bs || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-bold text-white">Bs. {(v.total_bs || 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">${(v.total || 0).toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedSale(v)}
                            className="p-2 rounded-lg bg-gray-800 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Ver productos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-950 border-b border-gray-800">
                <tr>
                  {isAdmin && <th className="px-6 py-4">Vendedor</th>}
                  <th className="px-6 py-4">Apertura / Cierre</th>
                  <th className="px-6 py-4 text-center">Duración</th>
                  <th className="px-6 py-4 text-right">Bs. (Sistema vs Físico)</th>
                  <th className="px-6 py-4 text-right">$ USD (Sistema vs Físico)</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-10 text-gray-500">
                      Cargando cierres...
                    </td>
                  </tr>
                ) : sesiones.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-gray-500">
                      No hay turnos registrados en este rango de fechas.
                    </td>
                  </tr>
                ) : (
                  sesiones.map((s) => {
                    const sisBs =
                      (s.sistema_bs_efectivo || 0) +
                      (s.sistema_bs_punto || 0) +
                      (s.sistema_bs_biopago || 0) +
                      (s.sistema_bs_pagomovil || 0);
                    const decBs =
                      (s.cierre_bs_efectivo || 0) +
                      (s.cierre_bs_punto || 0) +
                      (s.cierre_bs_biopago || 0) +
                      (s.cierre_bs_pagomovil || 0);
                    const diffBs = decBs - sisBs;

                    const sisUsd = s.sistema_usd_efectivo || 0;
                    const decUsd = s.cierre_usd_efectivo || 0;
                    const diffUsd = decUsd - sisUsd;

                    const fechaInicioTurno = s.fecha_apertura || s.created_at;

                    return (
                      <tr
                        key={s.id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors"
                      >
                        {isAdmin && (
                          <td className="px-6 py-4 font-bold text-white">
                            {vendorMap[s.usuario_id] || 'Usuario'}
                          </td>
                        )}
                        <td className="px-6 py-4 text-xs">
                          <p className="text-gray-300">
                            <span className="text-gray-500">Inicio:</span>{' '}
                            {fechaInicioTurno
                              ? new Date(fechaInicioTurno).toLocaleString()
                              : '—'}
                          </p>
                          <p className="text-gray-400 mt-1">
                            <span className="text-gray-500">Cierre:</span>{' '}
                            {s.fecha_cierre ? new Date(s.fecha_cierre).toLocaleString() : '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-400">
                          {formatDuration(fechaInicioTurno, s.fecha_cierre)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-xs text-gray-500">Sis: Bs. {sisBs.toFixed(2)}</p>
                          <p className="font-bold text-blue-400">Fís: Bs. {decBs.toFixed(2)}</p>
                          {s.estado === 'cerrada' && Math.abs(diffBs) >= 0.01 && (
                            <p
                              className={`text-xs font-semibold ${
                                diffBs > 0 ? 'text-blue-400' : 'text-red-400'
                              }`}
                            >
                              Dif: {diffBs > 0 ? '+' : ''}
                              {diffBs.toFixed(2)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-xs text-gray-500">Sis: ${sisUsd.toFixed(2)}</p>
                          <p className="font-bold text-emerald-400">Fís: ${decUsd.toFixed(2)}</p>
                          {s.estado === 'cerrada' && Math.abs(diffUsd) >= 0.01 && (
                            <p
                              className={`text-xs font-semibold ${
                                diffUsd > 0 ? 'text-blue-400' : 'text-red-400'
                              }`}
                            >
                              Dif: {diffUsd > 0 ? '+' : ''}
                              {diffUsd.toFixed(2)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              s.estado === 'abierta'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                          >
                            {s.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Detalle de Productos Vendidos */}
      <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </div>
  );
}