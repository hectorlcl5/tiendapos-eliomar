import { useState } from 'react';
import { X, DollarSign, CreditCard, Smartphone, CheckCircle, Wallet } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useCartStore } from '../../store/cartStore';
import { usePosStore } from '../../store/posStore';
import { useConfigStore } from '../../store/configStore';

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, getSubtotal, getIvaTotal, getTotal, clearCart } = useCartStore();
  const { activeSession } = usePosStore();
  const { tasaBcv } = useConfigStore();

  const [selectedMethod, setSelectedMethod] = useState('bs_punto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const tasa = parseFloat(tasaBcv) || 1;
  const subtotalUsd = getSubtotal();
  const ivaUsd = getIvaTotal();
  const totalUsd = getTotal();

  const subtotalBs = subtotalUsd * tasa;
  const ivaBs = ivaUsd * tasa;
  const totalBs = totalUsd * tasa;

  const paymentMethods = [
    { id: 'usd_efectivo', label: '$ Efectivo', icon: DollarSign, color: 'text-emerald-400' },
    { id: 'bs_efectivo', label: 'Bs. Efectivo', icon: Wallet, color: 'text-blue-400' },
    { id: 'bs_punto', label: 'Bs. Punto', icon: CreditCard, color: 'text-purple-400' },
    { id: 'bs_biopago', label: 'Bs. Bio Pago', icon: CheckCircle, color: 'text-orange-400' },
    { id: 'bs_pagomovil', label: 'Bs. Pago Móvil', icon: Smartphone, color: 'text-pink-400' },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([
          {
            sesion_id: activeSession.id,
            metodo_pago: selectedMethod,
            subtotal_usd: subtotalUsd,
            iva_usd: ivaUsd,
            iva_bs: ivaBs,
            total: totalUsd,
            tasa_bcv: tasa,
            total_bs: totalBs,
          },
        ])
        .select()
        .single();

      if (ventaError) throw ventaError;

      const itemsToInsert = cart.map((item) => ({
        venta_id: venta.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_venta,
        subtotal: item.cantidad * item.precio_venta,
      }));

      const { error: itemsError } = await supabase.from('ventas_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      for (const item of cart) {
        const { data: prodData } = await supabase
          .from('productos')
          .select('stock_actual')
          .eq('id', item.id)
          .single();
        const nuevoStock = (prodData?.stock_actual || 0) - item.cantidad;
        await supabase.from('productos').update({ stock_actual: nuevoStock }).eq('id', item.id);
      }

      setSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Error al procesar el pago:', error.message);
      alert('Hubo un error al procesar la venta. Revisa la consola.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setSelectedMethod('bs_punto');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-full max-w-xl shadow-2xl relative">
        {!success ? (
          <>
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold text-white mb-6 text-center">Confirmar Pago</h2>

            <div className="bg-gray-950 rounded-2xl p-5 mb-6 text-center border border-gray-800">
              <div className="flex justify-center gap-6 text-xs text-gray-400 mb-3 pb-3 border-b border-gray-800/80">
                <span>Subtotal: Bs. {subtotalBs.toFixed(2)}</span>
                <span className="text-amber-400">IVA: Bs. {ivaBs.toFixed(2)}</span>
              </div>
              <p className="text-gray-400 text-sm mb-1">Monto total a cobrar (Bs.)</p>
              <p className="text-5xl font-bold text-blue-400 mb-2">Bs. {totalBs.toFixed(2)}</p>
              <p className="text-gray-500 font-medium">Ref: ${totalUsd.toFixed(2)}</p>
            </div>

            <p className="text-gray-300 font-medium mb-4">Selecciona el Método de Pago</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700 hover:text-gray-300'
                  }`}
                >
                  <method.icon className={`w-6 h-6 mb-2 ${method.color}`} />
                  <span className="font-semibold text-xs text-center">{method.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 flex justify-center items-center transition-colors"
            >
              {isProcessing ? 'Procesando...' : 'Confirmar Venta'}
            </button>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="bg-emerald-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">¡Venta Exitosa!</h2>
            <p className="text-gray-400 mb-8">Transacción procesada correctamente.</p>
            <button
              onClick={handleClose}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Nueva Venta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}