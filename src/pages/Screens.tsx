import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, Settings, Clock, Plus, Trash2, Link } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';
import { useContentStore } from '../store/contentStore';
import { useScheduleStore } from '../store/scheduleStore';
import { useScreenStore } from '../store/screenStore';
import type { Screen, Content } from '../types';
import ScreenSettings from '../components/ScreenSettings';
import NewScreenDialog from '../components/NewScreenDialog';

const Screens = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [isNewScreenDialogOpen, setIsNewScreenDialogOpen] = useState(false);
  const { locations, fetchLocations } = useLocationStore();
  const { contents, fetchContents } = useContentStore();
  const { schedules, fetchSchedulesByScreen } = useScheduleStore();
  const { deleteScreen } = useScreenStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations();
    fetchContents();
  }, [fetchLocations, fetchContents]);

  const allScreens = locations.flatMap(location => 
    location.screens.map(screen => ({
      ...screen,
      locationName: location.name,
      locationAddress: location.address
    }))
  ).sort((a, b) => parseInt(a.id) - parseInt(b.id));

  const filteredScreens = allScreens.filter(screen =>
    screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screen.locationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const layoutTypeLabels = {
    'full_text': 'Texto Completo',
    'full_image': 'Imagen Completa',
    'split': 'Imagen y Texto',
    'video_fullscreen': 'Video Pantalla Completa'
  };

  const handlePreview = (screenId: string) => {
    window.open(`/pantalla/${screenId}`, '_blank');
  };

  const handleManageContent = (screen: Screen) => {
    setSelectedScreen(screen);
  };

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
    <div className="p-8 h-screen flex flex-col">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pantallas</h1>
        <button
          onClick={() => setIsNewScreenDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base w-fit"
        >
          <Plus size={20} className="flex-shrink-0" />
          <span>Agregar Pantalla</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar pantalla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredScreens.map((screen) => (
              <div
                key={screen.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow min-w-0"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{screen.name}</h2>
                      <p className="text-sm text-gray-500">Pantalla #{screen.id}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 min-w-0">
                      <button
                        onClick={() => copyShortUrl(screen)}
                        className="p-3 text-gray-500 hover:text-primary transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                        title="Copiar URL"
                      >
                        <Link size={20} />
                      </button>
                      <button
                        onClick={() => handlePreview(screen.id)}
                        className="p-3 text-gray-500 hover:text-primary transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                        title="Ver pantalla"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleManageContent(screen)}
                        className="p-3 text-gray-500 hover:text-primary transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                        title="Gestionar contenido y horarios"
                      >
                        <Settings size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteScreen(screen.id)}
                        className="p-3 text-gray-500 hover:text-red-500 transition-colors bg-gray-100 rounded-lg hover:bg-red-100"
                        title="Eliminar pantalla"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Sucursal</p>
                      <p className="font-medium text-gray-900">{screen.locationName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="font-medium text-gray-900">{screen.locationAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Pantalla</p>
                      <span className="inline-block px-2 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">
                        {layoutTypeLabels[screen.layout_type]}
                      </span>
                    </div>

                    {screen.content_schedule && screen.content_schedule.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock size={16} />
                          <span>{screen.content_schedule.length} contenidos programados</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredScreens.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No se encontraron pantallas
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedScreen && (
        <ScreenSettings
          screen={selectedScreen}
          onClose={() => setSelectedScreen(null)}
        />
      )}

      {isNewScreenDialogOpen && (
        <NewScreenDialog 
          isOpen={isNewScreenDialogOpen}
          onClose={() => setIsNewScreenDialogOpen(false)} 
        />
      )}
    </div>
  );
};

export default Screens;