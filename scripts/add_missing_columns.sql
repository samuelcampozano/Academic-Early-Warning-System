-- SQL Script to add missing columns to socioeconomic_data table
-- Run this in Supabase SQL Editor (Database → SQL Editor → New Query)

-- Add household assets columns
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS telefono_convencional BOOLEAN DEFAULT FALSE;
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS cocina_horno BOOLEAN DEFAULT FALSE;
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS refrigeradora BOOLEAN DEFAULT FALSE;
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS lavadora BOOLEAN DEFAULT FALSE;
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS equipo_sonido BOOLEAN DEFAULT FALSE;
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS numero_tv INTEGER DEFAULT 0;
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS numero_vehiculos INTEGER DEFAULT 0;

-- Add housing condition columns
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS material_paredes TEXT;
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS material_piso TEXT;
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS cuartos_bano INTEGER DEFAULT 1;
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS tipo_sanitario TEXT;

-- Add habits/connectivity columns
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS compra_centros_comerciales BOOLEAN DEFAULT FALSE;
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS correo_electronico BOOLEAN DEFAULT FALSE;
ALTER TABLE socioeconomic_data ADD COLUMN IF NOT EXISTS redes_sociales BOOLEAN DEFAULT FALSE;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'socioeconomic_data'
ORDER BY column_name;
