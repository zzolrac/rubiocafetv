import React, { useEffect, useState } from 'react';
import { Plus, LayoutGrid, List, Filter } from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import ContentGrid from '../components/ContentGrid';
import ContentList from '../components/ContentList';
import ContentUploader from '../components/ContentUploader';
import ContentEditor from '../components/ContentEditor';
import type { Content } from '../types';

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

const Products = () => {
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Content['category'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { contents, fetchContents, updateContent, deleteContent } = useContentStore();

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const filteredContents = contents.filter(content => {
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (content.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
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
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Content['category'] | 'all')}
              className="bg-transparent border-none focus:outline-none text-gray-700"
            >
              <option value="all">Todas las categorías</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <ContentGrid
          contents={filteredContents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <ContentList
          contents={filteredContents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isUploadingContent && (
        <ContentUploader 
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

export default Products;