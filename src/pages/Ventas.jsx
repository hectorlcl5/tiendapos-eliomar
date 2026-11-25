import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { usePosStore } from "../store/posStore";
import TurnManager from "../components/pos/TurnManager";
import ProductSearch from "../components/pos/ProductSearch";
import TicketCart from "../components/pos/TicketCart";
import CheckoutModal from "../components/pos/CheckoutModal";

export default function Ventas() {
  const { user } = useAuthStore();
  const { activeSession, isLoadingSession, checkActiveSession } = usePosStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkActiveSession(user.id);
    }
  }, [user, checkActiveSession]);

  if (isLoadingSession) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-gray-400 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-lg font-medium">Verificando estado de la caja...</p>
      </div>
    );
  }

  if (!activeSession) {
    return <TurnManager />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 -my-4 h-[calc(100vh-2rem)]">
      {/* Panel Izquierdo: Buscador (Ahora reducido al 30% aprox) */}
      <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0">
        <ProductSearch />
      </div>

      {/* Panel Derecho: Carrito (Ahora ampliado al 70% ocupando el resto) */}
      <div className="flex-1 min-w-0">
        <TicketCart onOpenCheckout={() => setIsCheckoutOpen(true)} />
      </div>

      {/* Modal de Cobro */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
