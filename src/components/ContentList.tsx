import React from 'react';
import { Image, Film, Clock, Edit, Trash2 } from 'lucide-react';
import type { Content } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContentListProps {
  contents: Content[];
  onEdit: (content: Content) => void;
  onDelete: (content: Content) => void;
}

const categoryLabels: Record<Content['category'], string> = {
  breakfast: 'Desayunos',
  main: 'Platos Principales',
  drinks: 'Bebidas',
  promotion: 'Promociones',
};

const ContentList: React.FC<ContentListProps> = ({ contents, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {contents.map((content) => (
        <div
          key={content.id}
          className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="flex">
            <div className="w-48 h-32 bg-gray-100 flex-shrink-0">
              {content.type === 'image' ? (
                <img
                  src={content.url}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={32} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {content.title}
                  </h3>
                  {content.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {content.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="text-primary font-medium">
                      {categoryLabels[content.category]}
                    </span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock size={14} />
                      {format(new Date(content.created_at), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(content)}
                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(content)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {contents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay contenido disponible
        </div>
      )}
    </div>
  );
};

export default ContentList;