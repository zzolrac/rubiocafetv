import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import type { Content, ContentSize, Size } from '../types';
import { useContentStore } from '../store/contentStore';
import { supabase } from '../lib/supabase';

interface ContentEditorProps {
  content: Content;
  onClose: () => void;
  onSave: (content: Partial<Content>) => Promise<void>;
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

const ContentEditor: React.FC<ContentEditorProps> = ({ content, onClose, onSave }) => {
  const [title, setTitle] = useState(content.title);
  const [description, setDescription] = useState(content.description || '');
  const [category, setCategory] = useState(content.category);
  const [price, setPrice] = useState(content.price.toString());
  const [file, setFile] = useState<File | null>(null);
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [externalUrl, setExternalUrl] = useState(content.url);
  const [contentType, setContentType] = useState<'image' | 'video'>(content.type);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [contentSizes, setContentSizes] = useState<Record<string, string>>({});
  const { uploadFile } = useContentStore();

  useEffect(() => {
    const fetchSizes = async () => {
      const { data: sizesData } = await supabase
        .from('sizes')
        .select('*')
        .order('value');

      if (sizesData) {
        setSizes(sizesData);
      }

      if (content.has_sizes) {
        const { data: contentSizesData } = await supabase
          .from('content_sizes')
          .select('*')
          .eq('content_id', content.id);

        if (contentSizesData) {
          const sizesPrices = contentSizesData.reduce((acc, size) => ({
            ...acc,
            [size.size_id]: size.price.toString()
          }), {});
          setContentSizes(sizesPrices);
        }
      }
    };

    // Check if the current URL is from Supabase Storage or external
    const isSupabaseUrl = content.url.includes(import.meta.env.VITE_SUPABASE_URL);
    setUseExternalUrl(!isSupabaseUrl);
    
    fetchSizes();
  }, [content.id, content.has_sizes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updates: Partial<Content> = {
        title,
        description: description || null,
        category,
        price: parseFloat(price),
      };

      if (useExternalUrl) {
        updates.url = externalUrl.trim();
        updates.type = contentType;
      } else if (file) {
        const url = await uploadFile(file);
        updates.url = url;
        updates.type = file.type.startsWith('image/') ? 'image' : 'video';
      }

      await onSave(updates);

      // Update content sizes if needed
      if (content.has_sizes) {
        const sizesToUpdate = Object.entries(contentSizes).map(([sizeId, price]) => ({
          content_id: content.id,
          size_id: sizeId,
          price: parseFloat(price)
        }));

        await supabase
          .from('content_sizes')
          .upsert(sizesToUpdate, { onConflict: 'content_id,size_id' });
      }

      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar los cambios');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDrink = ['hot_drinks', 'cold_drinks', 'frappes'].includes(category);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Editar Contenido</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Content['category'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
            />
          </div>

          {isDrink ? (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Precios por tamaño</h3>
              {sizes
                .filter(size => size.value !== 'standard')
                .map(size => (
                  <div key={size.id}>
                    <label htmlFor={`price-${size.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Precio {size.name}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        id={`price-${size.id}`}
                        value={contentSizes[size.id] || '0.00'}
                        onChange={(e) => setContentSizes(prev => ({
                          ...prev,
                          [size.id]: e.target.value
                        }))}
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de contenido
            </label>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setUseExternalUrl(false)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  !useExternalUrl
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Subir Archivo
              </button>
              <button
                type="button"
                onClick={() => setUseExternalUrl(true)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  useExternalUrl
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                URL Externa (Mux/YouTube)
              </button>
            </div>

            {useExternalUrl ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="externalUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    URL del video/imagen
                  </label>
                  <input
                    type="url"
                    id="externalUrl"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://stream.mux.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de contenido
                  </label>
                  <select
                    id="contentType"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as 'image' | 'video')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="video">Video</option>
                    <option value="image">Imagen</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none"
                    >
                      <span>Subir archivo</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF, MP4 hasta 10MB
                  </p>
                  {file && (
                    <p className="text-sm text-primary font-medium">
                      {file.name}
                    </p>
                  )}
                </div>
              </div>
            )}
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentEditor;