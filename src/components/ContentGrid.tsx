import React from 'react';
import { Image, Film, Clock, Edit, Trash2 } from 'lucide-react';
import type { Content } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContentGridProps {
  contents: Content[];
  onEdit: (content: Content) => void;
  onDelete: (content: Content) => void;
}

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

const ContentGrid: React.FC<ContentGridProps> = ({ contents, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map((content) => (
        <div
          key={content.id}
          className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="aspect-video relative bg-gray-100">
            {content.type === 'image' ? (
              <img
                src={content.url}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Film size={32} className="text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => onEdit(content)}
                className="p-2 bg-white/90 rounded-full text-gray-600 hover:text-primary transition-colors"
                title="Editar"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(content)}
                className="p-2 bg-white/90 rounded-full text-gray-600 hover:text-red-500 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 line-clamp-1">
                {content.title}
              </h3>
              {content.type === 'image' ? (
                <Image size={18} className="text-gray-400 flex-shrink-0" />
              ) : (
                <Film size={18} className="text-gray-400 flex-shrink-0" />
              )}
            </div>
            {content.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {content.description}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-primary font-medium">
                {categoryLabels[content.category]}
              </span>
              <span className="text-gray-400 flex items-center gap-1">
                <Clock size={14} />
                {format(new Date(content.created_at), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
            {content.has_sizes ? (
              <div className="mt-2 space-y-1">
                {content.sizes?.map(size => (
                  <div key={size.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{size.size.name}</span>
                    <span className="font-medium">${size.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-lg font-semibold text-gray-900">
                ${content.price.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      ))}

      {contents.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          No hay contenido disponible
        </div>
      )}
    </div>
  );
};

export default ContentGrid;