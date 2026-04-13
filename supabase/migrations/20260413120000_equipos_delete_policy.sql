-- Permite al capitán eliminar su propio equipo
CREATE POLICY "Capitan elimina su equipo"
  ON public.equipos FOR DELETE TO authenticated
  USING (capitan_id = auth.uid());
