import { useEffect, useState } from 'react';
import { X, Receipt, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';

export default function SaleDetailModal({ sale, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      if (!sale?.id) return;
      setLoading(true);
      try {
        const { data: saleItems, error } = await supabase
          .from('ventas_items')
          .select('*')
          .eq('venta_id', sale.id);

        if (error) throw error;

        // Obtener nombres de productos de forma segura
        const productIds = [...new Set((saleItems || []).map((i) => i.producto_id))];
        let productsMap = {};

        if (productIds.length > 0) {
          const { data: prods } = await supabase
            .from('productos')
            .select('id, descripcion, es_granel, unidad_medida')
            .in('id', productIds);

          (prods || []).forEach((p) => {
            productsMap[p.id] = p;
          });
        }

        const enriched = (saleItems || []).map((item) => ({
          ...item,
          producto: productsMap[item.producto_id] || { descripcion: 'Producto eliminado' },
        }));

        setItems(enriched);
      } catch (error) {
        console.error('Error cargando detalle de venta:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [sale]);

  if (!sale) return null;

  const tasa = parseFloat(sale.tasa_bcv) || 1;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-600/20 p-2.5 rounded-xl">
            <Receipt className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Detalle de Venta</h3>
            <p className="text-xs text-gray-400">
              {sale.fecha_efectiva ? new Date(sale.fecha_efectiva).toLocaleString() : 'Sin fecha'} • Tasa BCV: Bs. {tasa.toFixed(2)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm"
              >
                <div className="min-w-0 pr-3">
                  <p className="text-white font-semibold truncate">{item.producto.descripcion}</p>
                  <p className="text-xs text-gray-500">
                    {item.cantidad} {item.producto.es_granel ? 'Kg' : 'und'} × Bs.{' '}
                    {(item.precio_unitario * tasa).toFixed(2)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-blue-400 font-bold">
                    Bs. {(item.subtotal * tasa).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">${Number(item.subtotal).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-gray-800 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span>Bs. {((sale.subtotal_usd || sale.total) * tasa).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-amber-400">
            <span>IVA</span>
            <span>Bs. {(sale.iva_bs || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gray-800">
            <span>Total Cobrado</span>
            <div className="text-right">
              <p>Bs. {(sale.total_bs || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-500 font-normal">Ref: ${(sale.total || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}