# Integración de videos con Mux

- [x] Definir el flujo de carga y reproducción de videos con Mux
- [x] Agregar a contenido los datos necesarios para identificar videos de Mux
- [x] Crear y publicar la función segura para generar cargas y consultar el estado de Mux
- [x] Conectar el cargador de videos nuevos con Mux
- [x] Compilar y verificar la aplicación
- [x] Eliminar el asset remoto de Mux al borrar un contenido (best-effort)
- [x] Mensaje claro en la app cuando faltan credenciales de Mux
- [ ] Conectar las credenciales de Mux y probar una carga real
- [ ] Republicar la función `mux-video` (incluye `delete-asset`) en Supabase

## Revisión

- La aplicación compila correctamente.
- La función `mux-video` desplegada responde pero devuelve 500: faltan
  `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` en los secretos de Supabase.
- Los videos nuevos se preparan para usar URLs HLS de Mux.
- Las imágenes continúan usando Supabase Storage.
- Los videos existentes no se migran automáticamente.
- El borrado ahora intenta eliminar el asset remoto de Mux, pero requiere
  republicar la función para que `delete-asset` exista en el servidor.
- El reproductor (Preview) ya maneja HLS (.m3u8) con hls.js + Safari nativo.
