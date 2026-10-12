import React, { useState, useEffect } from 'react';
import { Coffee, Send, Lightbulb, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Location } from '../types';

const SuggestionForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      if (data) setLocations(data);
    };
    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('suggestions')
        .insert({
          type: 'suggestion',
          name: name.trim() || null,
          email: email.trim() || null,
          subject: subject.trim(),
          message: message.trim(),
          location_id: locationId || null,
          status: 'new',
        });

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err) {
      setError('Ocurrió un error al enviar. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setLocationId('');
    setSubmitted(false);
    setError(null);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#FFF0E6] to-[#FFE8D6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Gracias por tu aporte!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Hemos recibido tu sugerencia y la revisaremos lo antes posible.
            Tu opinión nos ayuda a mejorar.
          </p>
          <button
            onClick={resetForm}
            className="w-full py-3 px-6 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Enviar otra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#FFF0E6] to-[#FFE8D6]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E9967A]/20 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Coffee className="text-primary" size={32} />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">RubioCafé</h1>
            <p className="text-xs sm:text-sm text-gray-500">Sugerencias</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Tu opinión importa
          </h2>
          <p className="text-gray-600 text-sm sm:text-base px-2">
            Comparte tu experiencia con nosotros. Todos los mensajes son leídos por nuestro equipo.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 animate-slide-up">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={18} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 text-base"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 text-base"
              />
            </div>

            {/* Location */}
            {locations.length > 0 && (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sucursal <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    id="location"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 text-base appearance-none bg-white"
                  >
                    <option value="">Selecciona una sucursal</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                Asunto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Breve descripción de tu idea"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 text-base"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos tu sugerencia con el mayor detalle posible..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 text-base resize-none"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !message.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-white rounded-xl font-medium text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar Sugerencia
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 px-4">
          Tus datos personales no serán compartidos. Solo los usamos para responder si es necesario.
        </p>
      </main>
    </div>
  );
};

export default SuggestionForm;
