import React, { useState } from 'react';
import { Building2, MonitorUp, Trash2, ExternalLink, Link, Settings } from 'lucide-react';
import type { Location, Screen } from '../types';
import ScreenList from './ScreenList';
import ScreenSettings from './ScreenSettings';
import { useScreenStore } from '../store/screenStore';

interface LocationCardProps {
  location: Location;
}

const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  const [isManagingScreens, setIsManagingScreens] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const { deleteScreen } = useScreenStore();

  const handleDeleteScreen = async (screenId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta pantalla? Se eliminarán todas las programaciones asociadas.')) {
      try {
        await deleteScreen(screenId);
      } catch (error) {
        console.error('Error al eliminar la pantalla:', error);
        alert('Error al eliminar la pantalla');
      }
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="text-primary" size={24} />
        <h2 className="text-xl font-semibold text-gray-900">{location.name}</h2>
      </div>
      
      <p className="text-gray-600 mb-4">{location.address}</p>
      
      {isManagingScreens ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700">Gestión de Pantallas</h3>
            <button
              onClick={() => setIsManagingScreens(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cerrar
            </button>
          </div>
          <ScreenList
            locationId={location.id}
            onScreenSelect={setSelectedScreen}
          />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {location.screens.map((screen) => (
              <div key={screen.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">{screen.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {screen.layout_type === 'split' && 'Imagen y Texto'}
                      {screen.layout_type === 'full_image' && 'Imagen Completa'}
                      {screen.layout_type === 'full_text' && 'Texto Completo'}
                    </p>
                    {screen.short_url && (
                      <p className="text-sm text-primary mt-1">
                        URL corta: {screen.short_url}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyShortUrl(screen)}
                      className="p-2 text-gray-400 hover:text-primary transition-colors"
                      title="Copiar URL"
                    >
                      <Link size={18} />
                    </button>
                    <button
                      onClick={() => openPreview(screen)}
                      className="p-2 text-gray-400 hover:text-primary transition-colors"
                      title="Ver pantalla"
                    >
                      <ExternalLink size={18} />
                    </button>
                    <button
                      onClick={() => setSelectedScreen(screen)}
                      className="p-2 text-gray-400 hover:text-primary transition-colors"
                      title="Configurar pantalla"
                    >
                      <Settings size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteScreen(screen.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Eliminar pantalla"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {location.screens.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No hay pantallas configuradas
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsManagingScreens(true)}
              className="text-primary hover:text-primary/80 font-medium flex items-center gap-2"
            >
              <MonitorUp size={18} />
              <span>Administrar Pantallas</span>
            </button>
          </div>
        </>
      )}

      {selectedScreen && (
        <ScreenSettings
          screen={selectedScreen}
          onClose={() => setSelectedScreen(null)}
        />
      )}
    </div>
  );
}

export default LocationCard;