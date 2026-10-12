import { useState, useEffect } from 'react';
import { X, Cake, Send } from 'lucide-react';
import { useScreenStore } from '../store/screenStore';
import { useMessageStore } from '../store/messageStore';

interface BirthdayMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BirthdayMessageDialog({ isOpen, onClose }: BirthdayMessageDialogProps) {
  const [name, setName] = useState('');
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [duration, setDuration] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const screens = useScreenStore((state) => state.screens);
  const fetchScreens = useScreenStore((state) => state.fetchScreens);
  const createMessage = useMessageStore((state) => state.createMessage);

  useEffect(() => {
    if (isOpen) {
      fetchScreens();
    }
  }, [isOpen, fetchScreens]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedScreens.length === 0) return;

    setIsSubmitting(true);
    try {
      const message = `🎂 ¡Feliz cumpleaños ${name.trim()}! 🎉`;
      await createMessage(message, selectedScreens, duration);

      setName('');
      setSelectedScreens([]);
      setDuration(10);
      onClose();
    } catch (error) {
      console.error('Error sending birthday message:', error);
      alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleScreen = (screenId: string) => {
    setSelectedScreens(prev =>
      prev.includes(screenId)
        ? prev.filter(id => id !== screenId)
        : [...prev, screenId]
    );
  };

  const selectAll = () => {
    if (selectedScreens.length === screens.length) {
      setSelectedScreens([]);
    } else {
      setSelectedScreens(screens.map(s => s.id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Cake className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-semibold">Mensaje de Cumpleaños</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la persona
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
            {name && (
              <div className="mt-2 p-3 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Vista previa:</p>
                <p className="text-pink-600 font-medium">
                  🎂 ¡Feliz cumpleaños {name}! 🎉
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración (minutos)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.min(10, Math.max(1, parseInt(e.target.value) || 10)))}
              min="1"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              El mensaje se mostrará por {duration} minutos (máximo 10 min)
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Seleccionar pantallas
              </label>
              <button
                type="button"
                onClick={selectAll}
                className="text-sm text-pink-600 hover:text-pink-700"
              >
                {selectedScreens.length === screens.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>
            <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
              {screens.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">
                  No hay pantallas disponibles
                </p>
              ) : (
                <div className="divide-y">
                  {screens.map((screen) => (
                    <label
                      key={screen.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedScreens.includes(screen.id)}
                        onChange={() => toggleScreen(screen.id)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">{screen.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedScreens.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                {selectedScreens.length} pantalla{selectedScreens.length !== 1 ? 's' : ''} seleccionada{selectedScreens.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || selectedScreens.length === 0 || isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
