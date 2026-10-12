import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import type { Content, Screen } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ScheduleDialogProps {
  screen: Screen;
  content: Content;
  onClose: () => void;
  onSave: (schedule: {
    start_time: string;
    end_time: string;
    days_of_week: number[];
  }) => Promise<void>;
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

const presetSchedules = {
  breakfast: { start: '07:00', end: '11:00' },
  lunch: { start: '11:00', end: '16:00' },
  dinner: { start: '16:00', end: '22:00' },
  allDay: { start: '07:00', end: '22:00' },
};

const ScheduleDialog: React.FC<ScheduleDialogProps> = ({
  screen,
  content,
  onClose,
  onSave,
}) => {
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('22:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) {
      alert('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        start_time: startTime,
        end_time: endTime,
        days_of_week: selectedDays,
      });
      onClose();
    } catch (error) {
      console.error('Error al guardar la programación:', error);
      alert('Error al guardar la programación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays((current) =>
      current.includes(dayId)
        ? current.filter((id) => id !== dayId)
        : [...current, dayId].sort()
    );
  };

  const applyPreset = (preset: keyof typeof presetSchedules) => {
    const schedule = presetSchedules[preset];
    setStartTime(schedule.start);
    setEndTime(schedule.end);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Programar Contenido</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
              {content.type === 'image' ? (
                <img
                  src={content.url}
                  alt={content.title}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Clock size={32} className="text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{content.title}</h3>
              <p className="text-sm text-gray-500">
                Pantalla: {screen.name}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horarios Predefinidos
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('breakfast')}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Desayuno (7:00 - 11:00)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('lunch')}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Almuerzo (11:00 - 16:00)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('dinner')}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cena (16:00 - 22:00)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('allDay')}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Todo el día (7:00 - 22:00)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Hora de inicio
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Hora de fin
              </label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días de la semana
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedDays.includes(day.id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.name}
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
              disabled={isSubmitting || selectedDays.length === 0}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Programar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleDialog;