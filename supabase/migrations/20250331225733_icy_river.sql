/*
  # Eliminar sistema de autenticación

  1. Cambios
    - Eliminar tabla user_roles y sus políticas
    - Deshabilitar RLS en todas las tablas
    - Eliminar triggers y funciones relacionadas con usuarios
*/

-- Eliminar tabla de roles de usuario y objetos relacionados
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Deshabilitar RLS en todas las tablas
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE screens DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule DISABLE ROW LEVEL SECURITY;