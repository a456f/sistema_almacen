-- Migración 002:
--  - quita numero_serie de cajas (ahora va por producto)
--  - agrega estado e imagen a cajas
--  - crea tablas productos y producto_imagenes
USE sistema_inventario;

-- En cajas: estado y foto principal
ALTER TABLE cajas
  ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' AFTER categoria_id,
  ADD COLUMN imagen VARCHAR(255) NULL AFTER estado;

-- numero_serie ya no vive en cajas (si la migración 001 se aplicó, la quitamos)
ALTER TABLE cajas DROP INDEX idx_serie;
ALTER TABLE cajas DROP COLUMN numero_serie;

-- Productos vinculados a cajas
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caja_id INT NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  numero_serie VARCHAR(120) NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NULL,
  INDEX idx_caja (caja_id),
  INDEX idx_sn (numero_serie),
  INDEX idx_estado (estado),
  CONSTRAINT fk_prod_caja FOREIGN KEY (caja_id) REFERENCES cajas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Imágenes por producto (varias)
CREATE TABLE IF NOT EXISTS producto_imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  ruta VARCHAR(255) NOT NULL,
  fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_producto (producto_id),
  CONSTRAINT fk_imgprod FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
