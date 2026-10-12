import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, MonitorPlay } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';
import NewLocationDialog from '../components/NewLocationDialog';
import ScreenList from '../components/ScreenList';
import ScreenSettings from '../components/ScreenSettings';
import LocationEditor from '../components/LocationEditor';
import type { Location, Screen } from '../types';

const Locations = () => {
  const [isNewLocationDialogOpen, setIsNewLocationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { locations, isLoading, error, fetchLocations, deleteLocation } = useLocationStore();

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteLocation = async (locationId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta sucursal? Se eliminarán todas las pantallas asociadas.')) {
      try {
        await deleteLocation(locationId);
      } catch (error) {
        console.error('Error al eliminar la sucursal:', error);
        alert('Error al eliminar la sucursal');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Sucursales</h1>
        <button
          onClick={() => setIsNewLocationDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base w-fit"
          disabled={locations.length >= 2}
          title={locations.length >= 2 ? 'Máximo 2 sucursales permitidas' : undefined}
        >
          <Plus size={20} className="flex-shrink-0" />
          <span>Nueva Sucursal</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar sucursal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Pantallas</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <React.Fragment key={location.id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{location.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {location.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                          {location.screens.length} pantallas
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedLocation(location.id)}
                            className="p-1 text-gray-400 hover:text-primary transition-colors"
                            title="Gestionar Pantallas"
                          >
                            <MonitorPlay size={18} />
                          </button>
                          <button
                            onClick={() => setEditingLocation(location)}
                            className="p-1 text-gray-400 hover:text-primary transition-colors"
                            title="Editar Sucursal"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(location.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar Sucursal"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {selectedLocation === location.id && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 bg-gray-50">
                          <ScreenList
                            locationId={location.id}
                            onScreenSelect={setSelectedScreen}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron sucursales
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewLocationDialog
        isOpen={isNewLocationDialogOpen}
        onClose={() => setIsNewLocationDialogOpen(false)}
      />

      {selectedScreen && (
        <ScreenSettings
          screen={selectedScreen}
          onClose={() => setSelectedScreen(null)}
        />
      )}

      {editingLocation && (
        <LocationEditor
          location={editingLocation}
          onClose={() => setEditingLocation(null)}
        />
      )}
    </div>
  );
};

export default Locations;