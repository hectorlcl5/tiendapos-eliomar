import { Receipt, Trash2 } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useConfigStore } from "../../store/configStore";

export default function TicketCart({ onOpenCheckout }) {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getSubtotal,
    getIvaTotal,
    getTotal,
  } = useCartStore();
  const { tasaBcv } = useConfigStore();

  const tasa = parseFloat(tasaBcv) || 1;
  const subtotalUsd = getSubtotal();
  const ivaUsd = getIvaTotal();
  const totalUsd = getTotal();

  const subtotalBs = subtotalUsd * tasa;
  const ivaBs = ivaUsd * tasa;
  const totalBs = totalUsd * tasa;

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
        <div className="flex items-center">
          <Receipt className="w-5 h-5 text-gray-400 mr-3" />
          <h2 className="text-lg font-bold text-white">Ticket Actual</h2>
        </div>
        <span className="bg-blue-600/20 text-blue-400 py-1 px-3 rounded-full text-sm font-bold">
          {cart.length} ítems
        </span>
      </div>

      {/* Lista lineal compacta */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
            <Receipt className="w-12 h-12 opacity-20" />
            <p>El carrito está vacío</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-800 gap-3 hover:bg-gray-900 transition-colors"
            >
              {/* 1. Cantidad / Peso */}
              <div className="flex items-center w-20 shrink-0">
                <input
                  type="text"
                  inputMode="decimal"
                  defaultValue={item.cantidad}
                  key={`${item.id}-${item.cantidad}`}
                  onBlur={(e) => {
                    const parsed = parseFloat(e.target.value.replace(",", "."));
                    if (!isNaN(parsed) && parsed > 0) {
                      updateQuantity(item.id, parsed);
                    } else {
                      e.target.value = item.cantidad;
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.target.blur();
                    }
                  }}
                  className="w-14 bg-gray-900 border border-gray-700 text-white rounded-md px-1 py-0.5 text-center focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* 2. Nombre del Producto + Etiqueta IVA */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <h4
                  className="text-white font-medium truncate text-sm"
                  title={item.descripcion}
                >
                  {item.descripcion}
                </h4>
                {item.aplica_iva && (
                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    +{item.porcentaje_iva || 16}%
                  </span>
                )}
              </div>

              {/* 3. Precio Unitario */}
              <div className="w-24 shrink-0 text-right hidden sm:block">
                <p className="text-gray-400 text-xs">
                  Bs. {(item.precio_venta * tasa).toFixed(2)}
                </p>
              </div>

              {/* 4. Precio Total de esa línea (Base) */}
              <div className="w-24 shrink-0 text-right">
                <p className="text-blue-400 font-bold text-sm">
                  Bs. {(item.cantidad * item.precio_venta * tasa).toFixed(2)}
                </p>
              </div>

              {/* 5. Botón Eliminar */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-gray-500 hover:text-red-500 transition-colors shrink-0 p-1 rounded-md hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer con Desglose de Subtotal, IVA y Total */}
      <div className="px-4 py-2.5 border-t border-gray-800 bg-gray-900/80">
        <div className="space-y-1 mb-2 pb-2 border-b border-gray-800 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span>
              Bs. {subtotalBs.toFixed(2)}{" "}
              <span className="text-gray-500 text-xs">
                (${subtotalUsd.toFixed(2)})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-amber-400/90">
            <span>IVA</span>
            <span>
              Bs. {ivaBs.toFixed(2)}{" "}
              <span className="text-amber-500/60 text-xs">
                (${ivaUsd.toFixed(2)})
              </span>
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-0.5">
          <p className="text-gray-300 text-lg font-medium">Total a Pagar</p>
          <p className="text-4xl font-bold text-white leading-none">
            Bs. {totalBs.toFixed(2)}
          </p>
        </div>
        <div className="flex justify-end mb-2.5">
          <p className="text-gray-500 text-sm font-medium">
            Ref: ${totalUsd.toFixed(2)}
          </p>
        </div>

        <button
          onClick={onOpenCheckout}
          disabled={cart.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xl"
        >
          Procesar Pago
        </button>
      </div>
    </div>
  );
}
