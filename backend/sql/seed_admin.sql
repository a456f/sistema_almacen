-- Usuario admin por defecto  (usuario: admin / contraseña: admin123)
USE sistema_inventario;

INSERT INTO usuarios (username, password_hash, nombre, rol)
VALUES ('admin', '$2b$10$sAAAHY7XjZGLAEFa/FBAfen1dFmked8oZzx31iU0XL/F1U4U124S6', 'Administrador', 'admin')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);
