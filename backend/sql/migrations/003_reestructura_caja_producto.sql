-- Migración 003 — Reestructura definitiva
--   Caja queda LEAN:  id, codigo_qr (único), estado, cantidad (auto), detalles, imágenes (varias)
--   Producto queda RICO: marca, modelo, categoría, tipo, descripción, uso, características, SN, estado, fotos
USE sistema_inventario;

SET FOREIGN_KEY_CHECKS = 0;

-- Limpiamos tablas (empezamos de cero)
TRUNCATE TABLE producto_imagenes;
TRUNCATE TABLE productos;
TRUNCATE TABLE cajas;

-- Quitamos foreign keys e índices que ya no aplican en cajas
ALTER TABLE cajas DROP FOREIGN KEY fk_caja_categoria;
ALTER TABLE cajas DROP INDEX idx_categoria;

-- Quitamos columnas que ahora viven en producto
ALTER TABLE cajas
  DROP COLUMN marca,
  DROP COLUMN modelo,
  DROP COLUMN descripcion,
  DROP COLUMN tipo,
  DROP COLUMN uso,
  DROP COLUMN caracteristicas,
  DROP COLUMN categoria_id,
  DROP COLUMN imagen;

-- Renombramos numero_caja -> codigo_qr y la hacemos UNIQUE
ALTER TABLE cajas
  CHANGE COLUMN numero_caja codigo_qr VARCHAR(80) NOT NULL,
  ADD COLUMN detalles TEXT NULL AFTER estado,
  ADD UNIQUE KEY uk_codigo_qr (codigo_qr);

ALTER TABLE cajas DROP INDEX idx_numero;
ALTER TABLE cajas ADD INDEX idx_estado (estado);

-- Imágenes de caja (varias)
CREATE TABLE IF NOT EXISTS caja_imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caja_id INT NOT NULL,
  ruta VARCHAR(255) NOT NULL,
  fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_caja (caja_id),
  CONSTRAINT fk_caja_img FOREIGN KEY (caja_id) REFERENCES cajas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Producto: agregar campos que vivían en caja
ALTER TABLE productos
  ADD COLUMN cantidad INT NOT NULL DEFAULT 1 AFTER caja_id,
  ADD COLUMN categoria_id INT NULL AFTER cantidad,
  ADD COLUMN marca VARCHAR(200) NULL AFTER categoria_id,
  ADD COLUMN modelo VARCHAR(200) NULL AFTER marca,
  ADD COLUMN tipo VARCHAR(300) NULL AFTER modelo,
  ADD COLUMN descripcion TEXT NULL AFTER tipo,
  ADD COLUMN uso TEXT NULL AFTER descripcion,
  ADD COLUMN caracteristicas TEXT NULL AFTER uso,
  ADD INDEX idx_pcat (categoria_id),
  ADD CONSTRAINT fk_prod_cat FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL;

-- Historial (cambios y eventos)
CREATE TABLE IF NOT EXISTS historial (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entidad ENUM('CAJA', 'PRODUCTO') NOT NULL,
  entidad_id INT NOT NULL,
  accion VARCHAR(40) NOT NULL,
  descripcion TEXT NULL,
  usuario_id INT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entidad (entidad, entidad_id),
  INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
