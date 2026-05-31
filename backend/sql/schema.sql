-- =====================================================================
-- Sistema de Control de Inventario  — esquema completo
-- Caja (lean): código QR, estado, detalles, varias imágenes.
-- Producto (rico): nombre, SN, categoría, marca, tipo, descripción, uso,
-- características, estado, 1+ imágenes. Vinculado a una caja.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS sistema_inventario
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sistema_inventario;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(120),
  rol VARCHAR(20) DEFAULT 'admin',
  estado TINYINT DEFAULT 1,
  ultimo_login DATETIME NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) UNIQUE NOT NULL,
  color VARCHAR(20) DEFAULT '#2563eb'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cajas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_qr VARCHAR(80) UNIQUE NOT NULL,
  cantidad INT NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
  detalles TEXT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NULL,
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS caja_imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caja_id INT NOT NULL,
  ruta VARCHAR(255) NOT NULL,
  fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_caja (caja_id),
  CONSTRAINT fk_caja_img FOREIGN KEY (caja_id) REFERENCES cajas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caja_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  categoria_id INT NULL,
  marca VARCHAR(200) NULL,
  modelo VARCHAR(200) NULL,
  tipo VARCHAR(300) NULL,
  descripcion TEXT NULL,
  uso TEXT NULL,
  caracteristicas TEXT NULL,
  nombre VARCHAR(200) NOT NULL,
  numero_serie VARCHAR(120) NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NULL,
  INDEX idx_caja (caja_id),
  INDEX idx_sn (numero_serie),
  INDEX idx_estado (estado),
  INDEX idx_pcat (categoria_id),
  CONSTRAINT fk_prod_caja FOREIGN KEY (caja_id) REFERENCES cajas(id) ON DELETE CASCADE,
  CONSTRAINT fk_prod_cat  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS producto_imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  ruta VARCHAR(255) NOT NULL,
  fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_producto (producto_id),
  CONSTRAINT fk_imgprod FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
