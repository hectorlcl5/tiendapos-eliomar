import { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Wallet,
  CreditCard,
  CheckCircle,
  Smartphone,
  CheckSquare,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { usePosStore } from '../../store/posStore';

const parseDecimal = (valor) => {
  return parseFloat(String(valor).replace(',', '.')) || 0;
};

const initialTotals = {
  usd_efectivo: 0,
  bs_efectivo: 0,
  bs_punto: 0,
  bs_biopago: 0,
  bs_pagomovil: 0,
};

const initialDeclarados = {
  usd_efectivo: '',
  bs_efectivo: '',
  bs_punto: '',
  bs_biopago: '',
  bs_pagomovil: '',
};

export default function CloseShiftModal({ isOpen, onClose }) {
  const { activeSession, closeSession } = usePosStore();
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesCount, setSalesCount] = useState(0);
  const [sistema, setSistema] = useState(initialTotals);
  const [declarados, setDeclarados] = useState(initialDeclarados);

  useEffect(() => {
    const fetchSessionSales = async () => {
      if (!isOpen || !activeSession?.id) return;

      setIsLoadingSales(true);
      try {
        const { data, error } = await supabase
          .from('ventas')
          .select('metodo_pago, total, total_bs')
          .eq('sesion_id', activeSession.id);

        if (error) throw error;

        const acumulados = { ...initialTotals };
        (data || []).forEach((venta) => {
          if (venta.metodo_pago === 'usd_efectivo') {
            acumulados.usd_efectivo += parseFloat(venta.total) || 0;
          } else if (acumulados[venta.metodo_pago] !== undefined) {
            acumulados[venta.metodo_pago] += parseFloat(venta.total_bs) || 0;
          }
        });

        setSistema(acumulados);
        setSalesCount(data?.length || 0);
        setDeclarados(initialDeclarados);
      } catch (error) {
        console.error('Error al cargar ventas del turno:', error.message);
      } finally {
        setIsLoadingSales(false);
      }
    };

    fetchSessionSales();
  }, [isOpen, activeSession]);

  const handleChange = (e) => {
    setDeclarados({
      ...declarados,
      [e.target.name]: e.target.value,
    });
  };

  const methods = [
    {
      key: 'usd_efectivo',
      label: '$ USD Efectivo',
      prefix: '$',
      icon: DollarSign,
      color: 'text-emerald-400',
      focusBorder: 'focus:border-emerald-500',
    },
    {
      key: 'bs_efectivo',
      label: 'Bs. Efectivo',
      prefix: 'Bs.',
      icon: Wallet,
      color: 'text-blue-400',
      focusBorder: 'focus:border-blue-500',
    },
    {
      key: 'bs_punto',
      label: 'Bs. Punto de Venta',
      prefix: 'Bs.',
      icon: CreditCard,
      color: 'text-purple-400',
      focusBorder: 'focus:border-purple-500',
    },
    {
      key: 'bs_biopago',
      label: 'Bs. Bio Pago',
      prefix: 'Bs.',
      icon: CheckCircle,
      color: 'text-orange-400',
      focusBorder: 'focus:border-orange-500',
    },
    {
      key: 'bs_pagomovil',
      label: 'Bs. Pago Móvil',
      prefix: 'Bs.',
      icon: Smartphone,
      color: 'text-pink-400',
      focusBorder: 'focus:border-pink-500',
    },
  ];

  const totalSistemaBs =
    sistema.bs_efectivo + sistema.bs_punto + sistema.bs_biopago + sistema.bs_pagomovil;
  const totalDeclaradoBs =
    parseDecimal(declarados.bs_efectivo) +
    parseDecimal(declarados.bs_punto) +
    parseDecimal(declarados.bs_biopago) +
    parseDecimal(declarados.bs_pagomovil);
  const diffTotalBs = totalDeclaradoBs - totalSistemaBs;

  const totalDeclaradoUsd = parseDecimal(declarados.usd_efectivo);
  const diffTotalUsd = totalDeclaradoUsd - sistema.usd_efectivo;

  const renderDiffBadge = (diff, prefix) => {
    const cleanDiff = Math.abs(diff) < 0.01 ? 0 : diff;
    if (cleanDiff === 0) {
      return (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Cuadrado
        </span>
      );
    }
    if (cleanDiff > 0) {
      return (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          +{prefix} {cleanDiff.toFixed(2)}
        </span>
      );
    }
    return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        -{prefix} {Math.abs(cleanDiff).toFixed(2)}
      </span>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeSession?.id) return;

    setIsSubmitting(true);

    const valoresDeclarados = {
      cierre_usd_efectivo: parseDecimal(declarados.usd_efectivo),
      cierre_bs_efectivo: parseDecimal(declarados.bs_efectivo),
      cierre_bs_punto: parseDecimal(declarados.bs_punto),
      cierre_bs_biopago: parseDecimal(declarados.bs_biopago),
      cierre_bs_pagomovil: parseDecimal(declarados.bs_pagomovil),
    };

    try {
      await closeSession(activeSession.id, valoresDeclarados, sistema);
      onClose();
      window.location.href = '/';
    } catch (error) {
      alert('Error al cerrar la caja. Revisa la consola para más detalles.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Cierre de Turno Asistido</h2>
          <p className="text-gray-400 text-sm">
            Compara lo registrado por el sistema ({salesCount} ventas en este turno) contra tus cierres físicos.
          </p>
        </div>

        {isLoadingSales ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Calculando ventas del turno...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Encabezados de la tabla comparativa */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-3 text-xs font-semibold text-gray-500 uppercase">
              <div className="col-span-4">Método de Pago</div>
              <div className="col-span-3 text-right">Sistema (Real)</div>
              <div className="col-span-3 text-center">Físico (Declarado)</div>
              <div className="col-span-2 text-right">Diferencia</div>
            </div>

            {/* Filas por cada método de pago */}
            <div className="space-y-2.5">
              {methods.map((method) => {
                const esperado = sistema[method.key] || 0;
                const ingresado = parseDecimal(declarados[method.key]);
                const diff = ingresado - esperado;

                return (
                  <div
                    key={method.key}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-gray-950 border border-gray-800 rounded-2xl p-3.5"
                  >
                    {/* Método */}
                    <div className="sm:col-span-4 flex items-center">
                      <method.icon className={`w-5 h-5 mr-2.5 shrink-0 ${method.color}`} />
                      <span className="text-sm font-semibold text-gray-200">{method.label}</span>
                    </div>

                    {/* Esperado del Sistema */}
                    <div className="sm:col-span-3 flex justify-between sm:justify-end items-center">
                      <span className="text-xs text-gray-500 sm:hidden">Sistema:</span>
                      <span className="text-sm font-bold text-gray-300">
                        {method.prefix} {esperado.toFixed(2)}
                      </span>
                    </div>

                    {/* Input Declarado */}
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        inputMode="decimal"
                        name={method.key}
                        value={declarados[method.key]}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-right font-semibold outline-none transition-colors text-sm ${method.focusBorder}`}
                      />
                    </div>

                    {/* Diferencia */}
                    <div className="sm:col-span-2 flex justify-between sm:justify-end items-center">
                      <span className="text-xs text-gray-500 sm:hidden">Diferencia:</span>
                      {renderDiffBadge(diff, method.prefix)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen Consolidado */}
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-between items-center sm:block">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                  Consolidado Bolívares
                </p>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xl font-bold text-blue-400">
                    Bs. {totalDeclaradoBs.toFixed(2)}
                  </p>
                  {renderDiffBadge(diffTotalBs, 'Bs.')}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sistema: Bs. {totalSistemaBs.toFixed(2)}
                </p>
              </div>

              <div className="sm:border-l sm:border-gray-800 sm:pl-4 flex justify-between items-center sm:block">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                  Consolidado $ USD
                </p>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xl font-bold text-emerald-400">
                    ${totalDeclaradoUsd.toFixed(2)}
                  </p>
                  {renderDiffBadge(diffTotalUsd, '$')}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sistema: ${sistema.usd_efectivo.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl mt-4 transition-colors disabled:opacity-50"
            >
              <CheckSquare className="w-5 h-5" />
              <span>{isSubmitting ? 'Cerrando caja...' : 'Confirmar Cierre de Caja'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}