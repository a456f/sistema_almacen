-- Migración: agregar columna numero_serie a cajas
-- Aplicar en el VPS con:
--   mysql -u appuser -p123456 sistema_inventario < backend/sql/migrations/001_add_numero_serie.sql

USE sistema_inventario;

ALTER TABLE cajas
  ADD COLUMN numero_serie VARCHAR(100) NULL AFTER numero_caja,
  ADD INDEX idx_serie (numero_serie);
