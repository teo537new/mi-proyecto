-- Agregar campos para el QR interoperable (req: posicion 50 CUIT obligatoria)
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS cuit text;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS store_name text DEFAULT 'PC AFONDO';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS store_city text;