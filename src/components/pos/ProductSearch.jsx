import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Barcode, Scale } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useCartStore } from '../../store/cartStore';
import { useConfigStore } from '../../store/configStore';

export default function ProductSearch() {
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [pesoGramos, setPesoGramos] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const barcodeInputRef = useRef(null);
  const firstAddBtnRef = useRef(null);

  const { addToCart } = useCartStore();
  const { tasaBcv } = useConfigStore();

  useEffect(() => {
    const searchProducts = async () => {
      if (searchCode.trim().length === 0 && searchName.trim().length < 2) {
        setProducts([]);
        return;
      }

      setLoading(true);

      let query = supabase.from('productos').select('*').limit(12);

      if (searchCode.trim().length > 0) {
        query = query.ilike('codigo_barras', `%${searchCode}%`);
      } else if (searchName.trim().length >= 2) {
        query = query.ilike('descripcion', `%${searchName}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    const delayDebounceFn = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchCode, searchName]);

  const handleAddToCart = (product) => {
    let qty = 1;
    // Si es a granel, toma el peso en gramos y lo convierte a Kg. Si está vacío, asume 1000g (1kg)
    if (product.es_granel) {
      const gramos = parseFloat(String(pesoGramos).replace(',', '.')) || 1000;
      qty = gramos / 1000;
    }
    addToCart(product, qty);
    setSearchCode('');
    setSearchName('');
    setPesoGramos('');
    barcodeInputRef.current?.focus();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && products.length > 0) {
      e.preventDefault();
      firstAddBtnRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header con los 3 Inputs */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 space-y-3">
        <div className="flex gap-3">
          {/* Búsqueda por Código */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Barcode className="h-5 w-5 text-gray-500" />
            </div>
            <input
              ref={barcodeInputRef}
              type="text"
              value={searchCode}
              onChange={(e) => {
                setSearchCode(e.target.value);
                setSearchName('');
              }}
              onKeyDown={handleSearchKeyDown}
              className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Cód. Barras"
            />
          </div>

          {/* Peso Granel */}
          <div className="relative w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Scale className="h-5 w-5 text-orange-500" />
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={pesoGramos}
              onChange={(e) => setPesoGramos(e.target.value.replace(/[^0-9.,]/g, ''))}
              className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              placeholder="Gramos (Ej. 500)"
            />
          </div>
        </div>

        {/* Búsqueda por Nombre */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              setSearchCode('');
            }}
            onKeyDown={handleSearchKeyDown}
            className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Buscar por nombre de producto..."
          />
        </div>
      </div>

      {/* Resultados */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && <p className="text-gray-400 text-center py-4">Buscando...</p>}
        {!loading && products.length === 0 && (searchName.length >= 2 || searchCode.length > 0) && (
          <p className="text-gray-500 text-center py-4">No se encontraron productos.</p>
        )}

        <div className="grid grid-cols-1 gap-2">
          {products.map((product, index) => (
            <button
              key={product.id}
              ref={index === 0 ? firstAddBtnRef : null}
              onClick={() => handleAddToCart(product)}
              className="flex justify-between items-center bg-gray-950 border border-gray-800 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-4 rounded-xl transition-all group text-left relative overflow-hidden"
            >
              {product.es_granel && (
                <div className="absolute top-0 right-0 bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                  GRANEL
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-200 group-hover:text-white truncate max-w-[180px]">
                  {product.descripcion}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  {product.presentacion} • {product.codigo_barras || 'Sin código'}
                </p>

                {/* Precios: Principal en Bs, Secundario en USD */}
                <p className="text-blue-400 font-bold text-lg leading-none">
                  Bs. {(product.precio_venta * tasaBcv).toFixed(2)}
                </p>
                <p className="text-gray-500 text-xs font-medium mt-0.5">
                  Ref: ${product.precio_venta?.toFixed(2)}
                </p>
              </div>

              <div className="bg-blue-600/20 p-2 rounded-lg group-hover:bg-blue-600/40 transition-colors ml-2 shrink-0">
                <Plus className="w-5 h-5 text-blue-400" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}