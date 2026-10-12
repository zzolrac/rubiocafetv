import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';
import { useScreenStore } from '../store/screenStore';

interface NewScreenDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const layoutTypes = [
  { 
    id: 'split', 
    name: 'Imagen y Texto', 
    description: 'Diseño dividido con imagen y lista de productos' 
  },
  { 
    id: 'full_image', 
    name: 'Imagen Completa', 
    description: 'Muestra imágenes a pantalla completa' 
  },
  { 
    id: 'full_text', 
    name: 'Texto Completo', 
    description: 'Ideal para menús y listas de precios' 
  },
  { 
    id: 'video_fullscreen', 
    name: 'Video Pantalla Completa', 
    description: 'Videos de Mux con reproducción automática en bucle' 
  }
] as const;

const NewScreenDialog: React.FC<NewScreenDialogProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedLayout, setSelectedLayout] = useState<typeof layoutTypes[number]['id']>('split');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { locations, fetchLocations } = useLocationStore();
  const { addScreen } = useScreenStore();

  useEffect(() => {
    if (isOpen) {
      fetchLocations();
    }
  }, [isOpen, fetchLocations]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocationId) {
      alert('Por favor selecciona una sucursal');
      return;
    }

    setIsSubmitting(true);

    try {
      await addScreen(selectedLocationId, { 
        name: name || 'Nueva Pantalla',
        layout_type: selectedLayout
      });
      onClose();
      setName('');
      setSelectedLocationId('');
      setSelectedLayout('split');
    } catch (error) {
      console.error('Error al crear la pantalla:', error);
      alert('Error al crear la pantalla');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Nueva Pantalla</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Pantalla
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Pantalla Principal"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Sucursal
            </label>
            <select
              id="location"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            >
              <option value="">Selecciona una sucursal</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Pantalla
            </label>
            <div className="grid grid-cols-1 gap-3">
              {layoutTypes.map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => setSelectedLayout(layout.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedLayout === layout.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{layout.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{layout.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedLocationId}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando...' : 'Crear Pantalla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewScreenDialog;