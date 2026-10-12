import React, { useEffect, useState } from 'react';
import { MessageSquare, Lightbulb, Clock, CheckCircle, XCircle, Trash2, Search, Filter, AlertTriangle } from 'lucide-react';
import { useSuggestionStore } from '../store/suggestionStore';
import type { Suggestion } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusLabels: Record<Suggestion['status'], string> = {
  new: 'Nueva',
  read: 'Leída',
  resolved: 'Resuelta',
};

const statusColors: Record<Suggestion['status'], string> = {
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
};

const Suggestions = () => {
  const { suggestions, isLoading, fetchSuggestions, updateStatus, deleteSuggestion } = useSuggestionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Suggestion['status'] | 'all'>('all');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Suggestion | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const filteredSuggestions = suggestions.filter((s) => {
    const matchesSearch =
      s.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const newCount = suggestions.filter((s) => s.status === 'new').length;

  const handleStatusChange = async (suggestion: Suggestion, status: Suggestion['status']) => {
    await updateStatus(suggestion.id, status);
    if (selectedSuggestion?.id === suggestion.id) {
      setSelectedSuggestion({ ...suggestion, status });
    }
  };

  const handleDeleteClick = (suggestion: Suggestion) => {
    setDeleteTarget(suggestion);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteSuggestion(deleteTarget.id);
    if (selectedSuggestion?.id === deleteTarget.id) {
      setSelectedSuggestion(null);
    }
    setDeleteTarget(null);
  };

  const openDetail = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    if (suggestion.status === 'new') {
      handleStatusChange(suggestion, 'read');
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Sugerencias</h1>
          {newCount > 0 && (
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
              {newCount} nueva{newCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-100">
            <Clock className="text-blue-600" size={22} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Nuevas</p>
            <p className="text-2xl font-semibold text-gray-900">
              {suggestions.filter((s) => s.status === 'new').length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-amber-100">
            <MessageSquare className="text-amber-600" size={22} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Leídas</p>
            <p className="text-2xl font-semibold text-gray-900">
              {suggestions.filter((s) => s.status === 'read').length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-100">
            <CheckCircle className="text-green-600" size={22} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Resueltas</p>
            <p className="text-2xl font-semibold text-gray-900">
              {suggestions.filter((s) => s.status === 'resolved').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por asunto, mensaje o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Suggestion['status'] | 'all')}
            className="bg-transparent border-none focus:outline-none text-gray-700 text-sm cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="new">Nuevas</option>
            <option value="read">Leídas</option>
            <option value="resolved">Resueltas</option>
          </select>
        </div>
      </div>

      {/* List + Detail */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* List */}
        <div className="flex-1 bg-white rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredSuggestions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => openDetail(suggestion)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-4 ${
                      selectedSuggestion?.id === suggestion.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="p-2 rounded-lg flex-shrink-0 bg-green-100">
                      <Lightbulb className="text-green-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{suggestion.subject}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[suggestion.status]}`}>
                          {statusLabels[suggestion.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{suggestion.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>{suggestion.name || 'Anónimo'}</span>
                        <span>·</span>
                        <span>{format(new Date(suggestion.created_at), "d MMM yyyy, HH:mm", { locale: es })}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No hay sugerencias para mostrar
              </div>
            )}
          </div>
        </div>

        {/* Detail panel (desktop) */}
        {selectedSuggestion && (
          <div className="w-full max-w-md bg-white rounded-lg shadow-sm flex flex-col overflow-hidden hidden lg:flex">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Detalle</h2>
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100">
                  <Lightbulb className="text-green-600" size={24} />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[selectedSuggestion.status]}`}>
                  {statusLabels[selectedSuggestion.status]}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedSuggestion.subject}</h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedSuggestion.message}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nombre:</span>
                  <span className="text-gray-900 font-medium">{selectedSuggestion.name || 'Anónimo'}</span>
                </div>
                {selectedSuggestion.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-900 font-medium">{selectedSuggestion.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha:</span>
                  <span className="text-gray-900 font-medium">
                    {format(new Date(selectedSuggestion.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(selectedSuggestion, 'new')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedSuggestion.status === 'new'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nueva
                </button>
                <button
                  onClick={() => handleStatusChange(selectedSuggestion, 'read')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedSuggestion.status === 'read'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Leída
                </button>
                <button
                  onClick={() => handleStatusChange(selectedSuggestion, 'resolved')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedSuggestion.status === 'resolved'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Resuelta
                </button>
              </div>
              <button
                onClick={() => handleDeleteClick(selectedSuggestion)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile detail modal */}
      {selectedSuggestion && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSuggestion(null)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Detalle</h2>
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={22} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100">
                  <Lightbulb className="text-green-600" size={24} />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[selectedSuggestion.status]}`}>
                  {statusLabels[selectedSuggestion.status]}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedSuggestion.subject}</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedSuggestion.message}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nombre:</span>
                  <span className="text-gray-900 font-medium">{selectedSuggestion.name || 'Anónimo'}</span>
                </div>
                {selectedSuggestion.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-900 font-medium">{selectedSuggestion.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha:</span>
                  <span className="text-gray-900 font-medium">
                    {format(new Date(selectedSuggestion.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(selectedSuggestion, 'new')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedSuggestion.status === 'new'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nueva
                </button>
                <button
                  onClick={() => handleStatusChange(selectedSuggestion, 'read')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedSuggestion.status === 'read'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Leída
                </button>
                <button
                  onClick={() => handleStatusChange(selectedSuggestion, 'resolved')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedSuggestion.status === 'resolved'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Resuelta
                </button>
              </div>
              <button
                onClick={() => handleDeleteClick(selectedSuggestion)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar?</h3>
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro de que deseas eliminar «{deleteTarget.subject}»? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suggestions;
