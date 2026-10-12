import React, { useEffect, useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import ContentGrid from '../components/ContentGrid';
import ContentList from '../components/ContentList';
import ContentUploader from '../components/ContentUploader';
import ContentEditor from '../components/ContentEditor';
import type { Content } from '../types';

const Drinks = () => {
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const { contents, fetchContents, updateContent, deleteContent } = useContentStore();

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const drinkContents = contents.filter(content => content.category === 'drinks');

  const handleEdit = async (content: Content) => {
    setEditingContent(content);
  };

  const handleSave = async (updates: Partial<Content>) => {
    if (!editingContent) return;
    await updateContent(editingContent.id, updates);
    setEditingContent(null);
  };

  const handleDelete = async (content: Content) => {
    if (confirm('¿Estás seguro de que deseas eliminar este contenido?')) {
      await deleteContent(content.id);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bebidas</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Vista en lista"
            >
              <List size={20} />
            </button>
          </div>
          <button
            onClick={() => setIsUploadingContent(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
          >
            <Plus size={20} className="flex-shrink-0" />
            <span>Agregar Bebida</span>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <ContentGrid
          contents={drinkContents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <ContentList
          contents={drinkContents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isUploadingContent && (
        <ContentUploader 
          category="drinks"
          onClose={() => setIsUploadingContent(false)} 
        />
      )}

      {editingContent && (
        <ContentEditor
          content={editingContent}
          onClose={() => setEditingContent(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Drinks;