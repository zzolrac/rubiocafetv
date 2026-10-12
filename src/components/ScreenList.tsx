import React, { useState } from 'react';
import { Monitor, Plus, Settings, ExternalLink, Pencil, Trash2, Link } from 'lucide-react';
import { useScreenStore } from '../store/screenStore';
import type { Screen } from '../types';
import ScreenEditor from './ScreenEditor';

interface ScreenListProps {
  locationId: string;
  onScreenSelect: (screen: Screen) => void;
}

const layoutTypes = [
  { id: 'split', name: 'Imagen y Texto', description: 'Diseño dividido con imagen y lista de productos' },
  { id: 'full_image', name: 'Imagen Completa', description: 'Muestra imágenes a pantalla completa' },
  { id: 'full_text', name: 'Texto Completo', description: 'Ideal para menús y listas de precios' },
  { id: 'video_fullscreen', name: 'Video Pantalla Completa', description: 'Videos de Mux con reproducción automática en bucle' },
] as const;

const ScreenList: React.FC<ScreenListProps> = ({ locationId, onScreenSelect }) => {
  const [newScreenName, setNewScreenName] = useState('');
  const [selectedLayout, setSelectedLayout] = useState<typeof layoutTypes[number]['id']>('split');
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const { screens, isLoading, error, addScreen, deleteScreen } = useScreenStore();

  const handleAddScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (screens.length >= 3) {
      alert('Máximo 3 pantallas por sucursal');
      return;
    }

    const screenNumber = screens.length + 1;
    await addScreen(locationId, { 
      name: `Pantalla ${screenNumber}`,
      layout_type: selectedLayout
    });
    setNewScreenName('');
    setSelectedLayout('split');
  };

  const handleDeleteScreen = async (screenId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta pantalla? Se eliminarán todas las programaciones asociadas.')) {
      await deleteScreen(screenId);
    }
  };

  const openPreview = (screen: Screen) => {
    const url = screen.short_url 
      ? `/p/${screen.short_url}`
      : `/pantalla/${screen.id}`;
    window.open(url, '_blank');
  };

  const copyShortUrl = (screen: Screen) => {
    const baseUrl = window.location.origin;
    const url = screen.short_url 
      ? `${baseUrl}/p/${screen.short_url}`
      : `${baseUrl}/pantalla/${screen.id}`;
    
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copiada al portapapeles');
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddScreen} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Pantalla
          </label>
          <div className="grid grid-cols-3 gap-4">
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

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Agregar Pantalla</span>
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {screens.map((screen) => (
          <div
            key={screen.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="text-primary" size={20} />
                <div>
                  <h3 className="font-medium">{screen.name}</h3>
                  <p className="text-sm text-gray-500">
                    {layoutTypes.find(l => l.id === screen.layout_type)?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyShortUrl(screen)}
                  className="text-gray-600 hover:text-primary transition-colors"
                  title="Copiar URL"
                >
                  <Link size={18} />
                </button>
                <button
                  onClick={() => openPreview(screen)}
                  className="text-gray-600 hover:text-primary transition-colors"
                  title="Abrir vista previa"
                >
                  <ExternalLink size={18} />
                </button>
                <button
                  onClick={() => setEditingScreen(screen)}
                  className="text-gray-600 hover:text-primary transition-colors"
                  title="Editar pantalla"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => onScreenSelect(screen)}
                  className="text-gray-600 hover:text-primary transition-colors"
                  title="Configurar pantalla"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={() => handleDeleteScreen(screen.id)}
                  className="text-gray-600 hover:text-red-500 transition-colors"
                  title="Eliminar pantalla"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {screen.content_schedule && screen.content_schedule.length > 0 ? (
              <div className="mt-2 text-sm text-gray-500">
                {screen.content_schedule.length} contenidos programados
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">
                Sin contenido programado
              </div>
            )}
          </div>
        ))}
      </div>

      {editingScreen && (
        <ScreenEditor
          screen={editingScreen}
          onClose={() => setEditingScreen(null)}
        />
      )}
    </div>
  );
};

export default ScreenList;