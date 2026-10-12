-- Habilitar RLS para todas las tablas
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla content
CREATE POLICY "Enable read access for all users"
ON content FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON content FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON content FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
ON content FOR DELETE
TO authenticated
USING (true);

-- Políticas para la tabla locations
CREATE POLICY "Enable read access for all users on locations"
ON locations FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only on locations"
ON locations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only on locations"
ON locations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only on locations"
ON locations FOR DELETE
TO authenticated
USING (true);

-- Políticas para la tabla screens
CREATE POLICY "Enable read access for all users on screens"
ON screens FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only on screens"
ON screens FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only on screens"
ON screens FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only on screens"
ON screens FOR DELETE
TO authenticated
USING (true);

-- Políticas para la tabla content_schedule
CREATE POLICY "Enable read access for all users on content_schedule"
ON content_schedule FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only on content_schedule"
ON content_schedule FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only on content_schedule"
ON content_schedule FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only on content_schedule"
ON content_schedule FOR DELETE
TO authenticated
USING (true);

-- Políticas para storage.objects
CREATE POLICY "Enable read access for all users on storage"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Enable insert for authenticated users only on storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Enable update for authenticated users only on storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Enable delete for authenticated users only on storage"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');