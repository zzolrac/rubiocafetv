import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, Film } from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import type { Content, Size } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

interface ContentUploaderProps {
  category?: Content['category'];
  onClose: () => void;
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

const ContentUploader: React.FC<ContentUploaderProps> = ({ category, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Content['category']>(category || 'others');
  const [price, setPrice] = useState('0.00');
  const [file, setFile] = useState<File | null>(null);
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [contentType, setContentType] = useState<'image' | 'video'>('video');
  const [sizes, setSizes] = useState<Size[]>([]);
  const [contentSizes, setContentSizes] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const { addContent, uploadFile, uploadVideoToMux } = useContentStore();

  useEffect(() => {
    const fetchSizes = async () => {
      const { data: sizesData } = await supabase
        .from('sizes')
        .select('*')
        .order('value');

      if (sizesData) {
        setSizes(sizesData);
      }
    };

    fetchSizes();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm'],
    },
    maxSize: 500 * 1024 * 1024,
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useExternalUrl && !file) return;
    if (useExternalUrl && !externalUrl.trim()) return;

    setIsUploading(true);

    try {
      let url: string;
      let type: 'image' | 'video';
      let mediaProvider: Content['media_provider'] = 'supabase';
      let muxAssetId: string | undefined;
      let muxPlaybackId: string | undefined;
      
      if (useExternalUrl) {
        url = externalUrl.trim();
        type = contentType;
        mediaProvider = url.includes('stream.mux.com') ? 'mux' : 'supabase';
      } else if (file!.type.startsWith('video/')) {
        const muxVideo = await uploadVideoToMux(file!);
        url = muxVideo.playbackUrl;
        type = 'video';
        mediaProvider = 'mux';
        muxAssetId = muxVideo.assetId;
        muxPlaybackId = muxVideo.playbackId;
      } else {
        url = await uploadFile(file!);
        type = 'image';
      }
      
      const isDrink = ['hot_drinks', 'cold_drinks', 'frappes'].includes(selectedCategory);
      const contentId = uuidv4();

      await addContent({
        id: contentId,
        title,
        description,
        category: selectedCategory,
        price: isDrink ? 0 : parseFloat(price), // Set base price to 0 for drinks
        type,
        url,
        has_sizes: isDrink,
        media_provider: mediaProvider,
        mux_asset_id: muxAssetId,
        mux_playback_id: muxPlaybackId
      });

      // Add sizes for drinks
      if (isDrink) {
        const sizesToAdd = Object.entries(contentSizes)
          .filter(([_, price]) => price !== '')
          .map(([sizeId, price]) => ({
            content_id: contentId,
            size_id: sizeId,
            price: parseFloat(price)
          }));

        if (sizesToAdd.length > 0) {
          await supabase
            .from('content_sizes')
            .insert(sizesToAdd);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error al subir el contenido:', error);
      alert('Error al subir el contenido');
    } finally {
      setIsUploading(false);
    }
  };

  const isDrink = ['hot_drinks', 'cold_drinks', 'frappes'].includes(selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Subir Contenido</h2>
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Content['category'])}
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
                        value={contentSizes[size.id] || ''}
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
              <div
                {...getRootProps()}
                className={`
                  mt-2 flex justify-center rounded-lg border border-dashed px-6 py-8
                  ${isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-primary/50'
                  }
                `}
              >
                <div className="text-center">
                  <div className="mx-auto flex justify-center">
                    {file ? (
                      file.type.startsWith('image/') ? (
                        <Image className="text-primary" size={36} />
                      ) : (
                        <Film className="text-primary" size={36} />
                      )
                    ) : (
                      <Upload className="text-gray-400" size={36} />
                    )}
                  </div>
                  
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/50">
                      <span>{file ? file.name : 'Seleccionar archivo'}</span>
                      <input {...getInputProps()} className="sr-only" />
                    </label>
                    {!file && <p className="pl-1">o arrastra y suelta</p>}
                  </div>
                  
                  <p className="text-xs leading-5 text-gray-500 mt-2">
                    PNG, JPG, WEBP, MP4 y WEBM hasta 500MB
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
              disabled={isUploading || (useExternalUrl ? !externalUrl.trim() : !file)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Procesando video...' : useExternalUrl ? 'Agregar Contenido' : 'Subir Contenido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentUploader;