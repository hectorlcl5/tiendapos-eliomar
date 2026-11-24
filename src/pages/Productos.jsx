import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, DollarSign } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { useConfigStore } from '../store/configStore';
import { useAuthStore } from '../store/authStore';
import ProductModal from '../components/inventory/ProductModal';

export default function Productos() {
  const { products, isLoading, fetchProducts, deleteProduct, updateProduct } = useProductStore();
  const { tasaBcv, setTasaBcv } = useConfigStore();
  const { profile } = useAuthStore();
  const isAdmin = profile?.rol === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [tasaInput, setTasaInput] = useState(String(tasaBcv || ''));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setTasaInput(String(tasaBcv || ''));
  }, [tasaBcv]);

  const handleTasaChange = (e) => {
    if (!isAdmin) return;
    const rawValue = e.target.value;
    setTasaInput(rawValue);
    const parsed = parseFloat(rawValue.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      setTasaBcv(parsed);
    }
  };

  const handleToggleIva = async (product) => {
    if (!isAdmin) return;
    try {
      await updateProduct(product.id, {
        aplica_iva: !product.aplica_iva,
        porcentaje_iva: product.porcentaje_iva || 16,
      });
    } catch (error) {
      console.error('Error al actualizar IVA:', error.message);
    }
  };

  const handleOpenNew = () => {
    if (!isAdmin) return;
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    if (!isAdmin) return;
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProduct(id);
    }
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.descripcion?.toLowerCase().includes(term) ||
      p.codigo_barras?.toLowerCase().includes(term)
    );
  });

  const tasa = parseFloat(tasaBcv) || 1;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Inventario de Productos</h1>
          <p className="text-gray-400">
            {isAdmin
              ? 'Administra tu catálogo, precios, IVA y tasa BCV'
              : 'Consulta de precios y disponibilidad de inventario'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Tasa BCV */}
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
            <DollarSign className="w-4 h-4 text-emerald-400 mr-1.5" />
            <span className="text-xs text-gray-400 mr-2 font-medium">Tasa BCV (Bs.):</span>
            <input
              type="text"
              inputMode="decimal"
              value={tasaInput}
              onChange={handleTasaChange}
              disabled={!isAdmin}
              className="w-24 bg-gray-950 border border-gray-700 text-emerald-400 font-bold rounded-lg px-2 py-1 text-right outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Botón Nuevo Producto (Solo Admin) */}
          {isAdmin && (
            <button
              onClick={handleOpenNew}
              className="flex items-center bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nombre o código de barras..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 text-white rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Tabla de Productos */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-950 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4 text-center">IVA</th>
                <th className="px-6 py-4 text-right">Costo</th>
                <th className="px-6 py-4 text-right">Precio Venta</th>
                <th className="px-6 py-4 text-center">Stock</th>
                {isAdmin && <th className="px-6 py-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center py-10 text-gray-500">
                    Cargando inventario...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-gray-500">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Producto */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{product.descripcion}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          {product.codigo_barras || 'Sin código'}
                        </span>
                        {product.es_granel && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            A Granel (Kg)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* IVA */}
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(product.aplica_iva)}
                        onChange={() => handleToggleIva(product)}
                        disabled={!isAdmin}
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        title={
                          product.aplica_iva
                            ? `IVA Activo (${product.porcentaje_iva || 16}%)`
                            : 'Sin IVA'
                        }
                      />
                    </td>

                    {/* Costo */}
                    <td className="px-6 py-4 text-right">
                      <p className="text-gray-300 font-semibold">
                        ${(product.costo || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Bs. {((product.costo || 0) * tasa).toFixed(2)}
                      </p>
                    </td>

                    {/* Precio Venta */}
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-blue-400">
                        ${(product.precio_venta || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        Bs. {((product.precio_venta || 0) * tasa).toFixed(2)}
                      </p>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          (product.stock_actual || 0) <= (product.stock_minimo || 0)
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {product.es_granel
                          ? `${Number(product.stock_actual || 0).toFixed(3)} Kg`
                          : product.stock_actual || 0}
                      </span>
                    </td>

                    {/* Acciones (Solo Admin) */}
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-2 rounded-lg bg-gray-800 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-lg bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Producto (Solo Admin) */}
      {isAdmin && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productToEdit={editingProduct}
        />
      )}
    </div>
  );
}