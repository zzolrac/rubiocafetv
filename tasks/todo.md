# Integración de videos con Mux

- [x] Definir el flujo de carga y reproducción de videos con Mux
- [x] Agregar a contenido los datos necesarios para identificar videos de Mux
- [x] Crear y publicar la función segura para generar cargas y consultar el estado de Mux
- [x] Conectar el cargador de videos nuevos con Mux
- [x] Compilar y verificar la aplicación
- [ ] Conectar las credenciales de Mux y probar una carga real

## Revisión

- La aplicación compila correctamente.
- La función `mux-video` fue publicada.
- Los videos nuevos se preparan para usar URLs HLS de Mux.
- Las imágenes continúan usando Supabase Storage.
- Los videos existentes no se migran automáticamente.
- La eliminación de un contenido todavía no elimina su asset remoto de Mux.
