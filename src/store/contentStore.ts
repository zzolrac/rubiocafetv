import { create } from 'zustand';
import { contentQueries } from './db';
import { supabase } from '../lib/supabase';
import type { Content } from '../types';

interface ContentState {
  contents: Content[];
  isLoading: boolean;
  error: string | null;
  fetchContents: () => Promise<void>;
  addContent: (content: Omit<Content, 'id' | 'created_at'>) => Promise<void>;
  updateContent: (id: string, updates: Partial<Content>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
  uploadVideoToMux: (file: File) => Promise<{ playbackUrl: string; playbackId: string; assetId: string }>;
}

export const useContentStore = create<ContentState>((set) => ({
  contents: [],
  isLoading: false,
  error: null,

  fetchContents: async () => {
    set({ isLoading: true, error: null });
    try {
      const contents = await contentQueries.getAll();
      set({ contents });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addContent: async (content) => {
    set({ isLoading: true, error: null });
    try {
      const newContent = await contentQueries.create({
        ...content,
        created_at: new Date().toISOString()
      });

      set((state) => ({
        contents: [newContent, ...state.contents],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateContent: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedContent = await contentQueries.update(id, updates);
      set((state) => ({
        contents: state.contents.map((content) =>
          content.id === id ? updatedContent : content
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteContent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const content = await contentQueries.getById(id);

      // Si el contenido vive en Mux, eliminar el asset remoto (best-effort:
      // aunque falle, se elimina el registro local).
      const muxAssetId = (content as Content).mux_asset_id;
      if (muxAssetId) {
        try {
          await supabase.functions.invoke('mux-video', {
            body: { action: 'delete-asset', assetId: muxAssetId },
          });
        } catch (muxError) {
          console.warn('No se pudo eliminar el asset de Mux:', muxError);
        }
      }

      // Si la URL es de Supabase Storage, eliminar el archivo
      if (content.url.includes(supabase.storageUrl)) {
        const path = new URL(content.url).pathname.split('/').pop();
        if (path) {
          await supabase.storage.from('media').remove([path]);
        }
      }

      await contentQueries.delete(id);
      set((state) => ({
        contents: state.contents.filter((content) => content.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  uploadFile: async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      throw new Error('Error al procesar el archivo');
    }
  },

  uploadVideoToMux: async (file: File) => {
    if (!file.type.startsWith('video/')) {
      throw new Error('El archivo seleccionado no es un video');
    }

    const { data: createData, error: createError } = await supabase.functions.invoke('mux-video', {
      body: {
        action: 'create-upload',
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      },
    });

    if (createError || !createData?.uploadId || !createData?.uploadUrl) {
      console.error('Error al crear la carga de Mux:', createError ?? createData);
      const raw = `${createError?.message ?? ''} ${JSON.stringify(createData ?? {})}`;
      if (raw.includes('mux_not_configured') || raw.includes('not configured')) {
        throw new Error('Mux no está configurado: faltan las credenciales (MUX_TOKEN_ID / MUX_TOKEN_SECRET) en Supabase.');
      }
      throw new Error('No se pudo iniciar la carga del video');
    }

    const uploadResponse = await fetch(createData.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('No se pudo enviar el video a Mux');
    }

    for (let attempt = 0; attempt < 90; attempt += 1) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 2000));

      const { data: statusData, error: statusError } = await supabase.functions.invoke('mux-video', {
        body: {
          action: 'check-upload',
          uploadId: createData.uploadId,
        },
      });

      if (statusError) {
        console.error('Error al consultar la carga de Mux:', statusError);
        throw new Error('No se pudo comprobar el procesamiento del video');
      }

      if (statusData?.status === 'errored' || statusData?.status === 'cancelled') {
        throw new Error('Mux no pudo procesar el video');
      }

      if (
        statusData?.status === 'ready' &&
        typeof statusData.playbackUrl === 'string' &&
        typeof statusData.playbackId === 'string' &&
        typeof statusData.assetId === 'string'
      ) {
        return {
          playbackUrl: statusData.playbackUrl,
          playbackId: statusData.playbackId,
          assetId: statusData.assetId,
        };
      }
    }

    throw new Error('El video está tardando demasiado en procesarse');
  },
}));