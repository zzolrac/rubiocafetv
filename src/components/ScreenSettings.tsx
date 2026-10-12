import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Plus, Trash2, Image, Search, Filter } from 'lucide-react';
import type { Screen, ContentSchedule, Content } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useContentStore } from '../store/contentStore';
import { useScheduleStore } from '../store/scheduleStore';
import ScheduleDialog from './ScheduleDialog';

interface ScreenSettingsProps {
  screen: Screen;
  onClose: () => void;
}

const daysOfWeek = [
  { id: 0, name: 'Domingo' },
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
];

const layoutTypeLabels: Record<Screen['layout_type'], string> = {
  full_text: 'Texto Completo',
  full_image: 'Imagen Completa',
  split: 'Imagen y Texto',
  video_fullscreen: 'Video Pantalla Completa'
};

const categoryLabels: Record<Content['category'], string> = {
  breakfast: 'Desayunos',
  lunch: 'Almuerzos',
  dinner: 'Cenas',
  snacks: 'Extras',
  hot_drinks: 'Bebidas Calientes',
  cold_drinks: 'Bebidas Frías',
  frappes: 'Frappés',
  others: 'Otros',
  promotion: 'Promociones'
};

const ScreenSettings: React.FC<ScreenSettingsProps> = ({ screen, onClose }) => {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Content['category'] | 'all'>('all');
  const { contents, fetchContents } = useContentStore();
  const {
    schedules,
    fetchSchedulesByScreen,
    addSchedule,
    removeSchedule,
    isLoading: isLoadingSchedules,
  } = useScheduleStore();

  useEffect(() => {
    fetchContents();
    fetchSchedulesByScreen(screen.id);
  }, [fetchContents, fetchSchedulesByScreen, screen.id]);

  const formatSchedule = (schedule: ContentSchedule) => {
    const days = schedule.days_of_week
      .map(day => daysOfWeek.find(d => d.id === day)?.name)
      .join(', ');

    return `${days} de ${format(new Date(`2024-01-01T${schedule.start_time}`), 'h:mm a', { locale: es })} a ${format(new Date(`2024-01-01T${schedule.end_time}`), 'h:mm a', { locale: es })}`;
  };

  const handleScheduleSave = async (scheduleData: {
    start_time: string;
    end_time: string;
    days_of_week: number[];
  }) => {
    if (!selectedContent) return;

    await addSchedule({
      screen_id: screen.id,
      content_id: selectedContent.id,
      ...scheduleData,
    });

    setSelectedContent(null);
  };

  const handleScheduleDelete = async (scheduleId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta programación?')) {
      await removeSchedule(scheduleId);
    }
  };

  // Get array of content IDs that are already scheduled
  const scheduledContentIds = schedules.map(schedule => schedule.content_id);

  // Filter contents that are not already scheduled and match search/category criteria
  const availableContents = contents.filter(content => {
    const isNotScheduled = !scheduledContentIds.includes(content.id);
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (content.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    return isNotScheduled && matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Configurar Pantalla: {screen.name}</h2>
            <span className="inline-block mt-2 px-2.5 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">
              {layoutTypeLabels[screen.layout_type]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Contenido Programado</h3>
            {isLoadingSchedules ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : schedules.length > 0 ? (
              <div className="space-y-4">
                {schedules.map((schedule) => {
                  const content = contents.find((c) => c.id === schedule.content_id);
                  if (!content) return null;

                  return (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                          {content.type === 'image' ? (
                            <img
                              src={content.url}
                              alt={content.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image size={24} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{content.title}</h4>
                          <p className="text-sm text-gray-500">{categoryLabels[content.category]}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatSchedule(schedule)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleScheduleDelete(schedule.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar programación"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay contenido programado
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Contenido Disponible</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar contenido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Todos
                  </button>
                  {(Object.entries(categoryLabels) as [Content['category'], string][]).map(([category, label]) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary text-white'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableContents.map((content) => (
                <div
                  key={content.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-100">
                    {content.type === 'image' ? (
                      <img
                        src={content.url}
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900">{content.title}</h4>
                    <p className="text-sm text-gray-500 mb-3">{categoryLabels[content.category]}</p>
                    <button
                      onClick={() => setSelectedContent(content)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <Clock size={16} />
                      <span>Programar</span>
                    </button>
                  </div>
                </div>
              ))}

              {availableContents.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {searchTerm || selectedCategory !== 'all'
                    ? 'No se encontró contenido que coincida con tu búsqueda'
                    : 'Todo el contenido ya está programado'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedContent && (
        <ScheduleDialog
          screen={screen}
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onSave={handleScheduleSave}
        />
      )}
    </div>
  );
};

export default ScreenSettings;