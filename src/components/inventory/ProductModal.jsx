import { useState, useEffect } from 'react';
import { X, Save, Percent, Scale } from 'lucide-react';
import { useProductStore } from '../../store/productStore';

const initialState = {
  descripcion: '',
  presentacion: '',
  unidad_medida: 'Unidad',
  codigo_barras: '',
  costo: '',
  precio_venta: '',
  stock_actual: '',
  stock_minimo: '',
  aplica_iva: false,
  porcentaje_iva: 16,
  es_granel: false,
};

export default function ProductModal({ isOpen, onClose, productToEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addProduct, updateProduct } = useProductStore();

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        ...initialState, // Asegurar que los campos nuevos tengan defaults si no existen
        ...productToEdit
      });
    } else {
      setFormData(initialState);
    }
  }, [productToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Cálculo del margen dinámico
  const calcularMargen = () => {
    const costo = parseFloat(String(formData.costo).replace(',', '.')) || 0;
    const precio = parseFloat(String(formData.precio_venta).replace(',', '.')) || 0;
    if (costo === 0) return 0;
    return (((precio - costo) / costo) * 100).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const dataToSend = { ...formData };
    
    if (!dataToSend.codigo_barras || String(dataToSend.codigo_barras).trim() === '') {
      dataToSend.codigo_barras = null;
    }

    dataToSend.costo = parseFloat(String(dataToSend.costo).replace(',', '.')) || 0;
    dataToSend.precio_venta = parseFloat(String(dataToSend.precio_venta).replace(',', '.')) || 0;
    dataToSend.stock_actual = parseFloat(String(dataToSend.stock_actual).replace(',', '.')) || 0;
    dataToSend.stock_minimo = parseFloat(String(dataToSend.stock_minimo).replace(',', '.')) || 0;
    dataToSend.porcentaje_iva = parseFloat(String(dataToSend.porcentaje_iva).replace(',', '.')) || 16;

    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, dataToSend);
      } else {
        await addProduct(dataToSend);
      }
      onClose();
    } catch (error) {
      console.error("Detalle del error:", error);
      alert('Error al guardar el producto. Revisa la consola.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const margen = calcularMargen();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl relative my-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">
            {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Columna Izquierda */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Descripción (Nombre)</label>
                <input required type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Presentación (Ej. 500g, 1L)</label>
                <input type="text" name="presentacion" value={formData.presentacion} onChange={handleChange} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Unidad de Medida</label>
                <select name="unidad_medida" value={formData.unidad_medida} onChange={handleChange} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none">
                  <option value="Unidad">Unidad</option>
                  <option value="Kg">Kilogramo (Kg)</option>
                  <option value="Litro">Litro (L)</option>
                  <option value="Caja">Caja</option>
                  <option value="Paquete">Paquete</option>
                  <option value="900 gramos">900 gramos</option>
                  <option value="500 gramos">500 gramos</option>
                  <option value="250 gramos">250 gramos</option>
                  <option value="200 gramos">200 gramos</option>
                  <option value="100 gramos">100 gramos</option>
                  <option value="50 gramos">50 gramos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Código de Barras</label>
                <input type="text" name="codigo_barras" value={formData.codigo_barras || ''} onChange={handleChange} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none" />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Costo ($ USD)</label>
                <input required type="text" inputMode="decimal" name="costo" value={formData.costo} onChange={handleChange} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none" placeholder="0.00" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Precio de Venta ($ USD)</label>
                <input required type="text" inputMode="decimal" name="precio_venta" value={formData.precio_venta} onChange={handleChange} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none" placeholder="0.00" />
                
                {/* Margen Dinámico */}
                {margen > 0 && (
                  <p className="text-xs font-medium text-emerald-400 mt-1.5 flex items-center">
                    <Percent className="w-3 h-3 mr-1" /> Margen de ganancia: {margen}%
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Stock Actual</label>
                  <input required type="text" inputMode="decimal" name="stock_actual" value={formData.stock_actual} onChange={handleChange} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">S. Mínimo</label>
                  <input required type="text" inputMode="decimal" name="stock_minimo" value={formData.stock_minimo} onChange={handleChange} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none" placeholder="0" />
                </div>
              </div>

              {/* Opciones de Venezuela */}
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl space-y-3 mt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="es_granel" checked={formData.es_granel} onChange={handleChange} className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                  <span className="text-gray-300 font-medium flex items-center"><Scale className="w-4 h-4 mr-2 text-orange-400"/> Producto a Granel (Pesable)</span>
                </label>
                
                <div className="border-t border-gray-800 pt-3">
                  <label className="flex items-center space-x-3 cursor-pointer mb-2">
                    <input type="checkbox" name="aplica_iva" checked={formData.aplica_iva} onChange={handleChange} className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                    <span className="text-gray-300 font-medium">Aplica IVA</span>
                  </label>
                  
                  {formData.aplica_iva && (
                    <div className="pl-8 flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Porcentaje:</span>
                      <input type="text" inputMode="decimal" name="porcentaje_iva" value={formData.porcentaje_iva} onChange={handleChange} className="w-20 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-1 focus:border-blue-500 outline-none text-sm" />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 flex justify-end space-x-4 border-t border-gray-800 pt-6">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20">
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}