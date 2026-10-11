-- Limpieza: columnas que solo se usaban para el QR (ya no existe)
ALTER TABLE store_settings DROP COLUMN IF EXISTS cuit;
ALTER TABLE store_settings DROP COLUMN IF EXISTS store_city;