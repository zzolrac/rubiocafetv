# Integración de videos con Mux

- [x] Definir el flujo de carga y reproducción de videos con Mux
- [x] Agregar a contenido los datos necesarios para identificar videos de Mux
- [x] Crear y publicar la función segura para generar cargas y consultar el estado de Mux
- [x] Conectar el cargador de videos nuevos con Mux
- [x] Compilar y verificar la aplicación
- [x] Eliminar el asset remoto de Mux al borrar un contenido (best-effort)
- [x] Mensaje claro en la app cuando faltan credenciales de Mux
- [x] Conectar las credenciales de Mux y probar una carga real
- [ ] Republicar la función `mux-video` (incluye `delete-asset`) en Supabase
- [ ] Probar subida de un video real desde la app y verificar reproducción HLS

## Revisión

- La aplicación compila correctamente.
- La función `mux-video` responde correctamente: las credenciales
  `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` ya están configuradas y una prueba
  de `create-upload` devolvió 200 con URL de carga directa.- Los videos nuevos se preparan para usar URLs HLS de Mux.
- Las imágenes continúan usando Supabase Storage.
- Los videos existentes no se migran automáticamente.
- El borrado ahora intenta eliminar el asset remoto de Mux, pero requiere
  republicar la función para que `delete-asset` exista en el servidor.
- El reproductor (Preview) ya maneja HLS (.m3u8) con hls.js + Safari nativo.
