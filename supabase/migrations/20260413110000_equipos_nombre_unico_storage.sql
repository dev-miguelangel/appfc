-- ============================================================
-- Nombre único en equipos + bucket fotos con políticas storage
-- ============================================================

-- ─── 1. Nombre único (case-insensitive) ─────────────────────
ALTER TABLE public.equipos
  ADD CONSTRAINT equipos_nombre_unico UNIQUE (nombre);

-- ─── 2. Bucket público "fotos" ──────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos', 'fotos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ─── 3. Políticas de storage ────────────────────────────────
-- Lectura pública para todos
CREATE POLICY "Fotos acceso público"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fotos');

-- Subida para usuarios autenticados (avatars/ y escudos/)
CREATE POLICY "Autenticado sube fotos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'fotos' AND (
      name LIKE 'avatars/%' OR
      name LIKE 'escudos/%'
    )
  );

-- Reemplazar archivo propio (upsert)
CREATE POLICY "Autenticado actualiza sus fotos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'fotos');

-- Eliminar foto propia
CREATE POLICY "Autenticado elimina sus fotos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'fotos');
