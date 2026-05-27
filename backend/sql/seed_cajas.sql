-- Seed de cajas generado desde el Excel (67 cajas)
USE sistema_inventario;

-- Categorías
INSERT IGNORE INTO categorias (nombre, color) VALUES ('🔵 Red de Fibra Óptica', '#2563eb');
INSERT IGNORE INTO categorias (nombre, color) VALUES ('🟢 Red UTP / Datos', '#16a34a');
INSERT IGNORE INTO categorias (nombre, color) VALUES ('⚡ Cable / Equipo de Energía', '#f59e0b');
INSERT IGNORE INTO categorias (nombre, color) VALUES ('⚪ Otros / Accesorios', '#6b7280');

-- Limpiar cajas previas
DELETE FROM cajas;

-- Cajas
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-001', 16, 'FCS – Furukawa Cabling System', 'SlimBox™ BW12', 'es un distribuidor interno de fibra óptica compacto diseñado para la organización, protección y administración de enlaces de fibra óptica. Permite alojar empalmes y conexiones ópticas de forma segura, siendo ideal para redes de telecomunicaciones, FTTH, CCTV y proyectos de cableado estructurado.', 'Distribuidor Interno Óptico (DIO) / Optical Distribution Frame (ODF)', 'Gestión, organización, terminación y distribución de fibra óptica', 'Capacidad: Hasta 12 fibras / 12 puertos (BW12).
Aplicación: Instalaciones FTTH, telecomunicaciones, redes LAN/WAN y CCTV sobre fibra óptica.
Formato compacto: Diseño tipo caja/bandeja interna de tamaño reducido.
Gestión de fibra: Permite organizar empalmes, adaptadores y reserva de cable óptico.
Protección: Resguarda las conexiones y empalmes de la fibra óptica contra manipulación y daños.', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-002', 1, 'FBS / Amatel – Furukawa Broadband System', NULL, 'Laptops y accesorios para área de TI', 'Bastidor óptico modular 19" con divisor óptico (Splitter óptico modular)', 'Faltan 3 cargadores', 'Formato: Rack / Bastidor 19 pulgadas.
Configuración del splitter: 2 × 1x32.
Tipo de fibra: G.657A (fibra óptica flexible con alta resistencia a curvaturas).
Conectorización: SC/APC – SC/APC.', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-003', 14, 'ATEN', 'VS182A / VS184A', 'Papelería, bolígrafos, resaltadores y clips', 'es un splitter HDMI diseñado para distribuir una única fuente de video HDMI hacia 2 o 4 pantallas al mismo tiempo, manteniendo alta calidad de imagen.', 'Distribución de video en salas de monitoreo', '1 entrada HDMI – 2 o 4 salidas HDMI (según modelo)
• Compatible con HDCP
• Soporte Full HD 1080p
• Compatible con Ultra HD 4K×2K
• Soporte Deep Color', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-003', 21, 'ATEN', '2L-7D03DP', 'Es un cable DisplayPort de 3 metros diseñado para transmitir señales de audio y video digital de alta calidad entre dispositivos compatibles con interfaz DisplayPort.', 'Cable DisplayPort (Cable de video digital)', 'Transmitir señales de audio y video digital', 'Interfaz: DisplayPort a DisplayPort.
Longitud: 3 metros.
Aplicación: Conexión de equipos con interfaz DisplayPort.', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-004', 14, 'FBS – Furukawa Broadband System', NULL, 'kit de adaptadores ópticos monomodo SC/APC, compuesto por 8 adaptadores con shutter angular verde, diseñado para la conexión y alineación segura de enlaces de fibra óptica.', 'Kit de adaptadores ópticos monomodo SC/APC (Angled Shutter)', NULL, 'Configuración: Kit de 08 piezas.
Tipo de fibra: SM (Single Mode / Monomodo).
Interfaz de conexión: SC/APC.', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-005', 15, 'FBS – Furukawa Broadband System', NULL, 'El FBS 35260412 es un kit de bandeja de empalme Stack 12F diseñado para organizar y proteger hasta 12 empalmes de fibra óptica.', 'Kit Bandeja de Empalme Stack 12F', 'Utilizado para alojar, organizar y proteger empalmes de fibra óptica dentro de distribuidores y cajas ópticas,', 'Configuración: Kit de bandeja de empalme para 12 fibras.
Capacidad: 12F (12 fibras ópticas).
Tipo de aplicación: Organización y protección de empalmes de fibra óptica.
Diseño: Bandeja tipo Stack (apilable).', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-006', 47, 'Bticino – Idrobox', 'Idrobox Plus IP66', 'La Bticino Idrobox Plus IP66 es una cubierta o caja hermética diseñada para brindar alta protección a instalaciones eléctricas y de telecomunicaciones.', 'Cubierta / Caja hermética de protección', 'Utilizada para proteger interruptores, tomacorrientes, conexiones eléctricas y componentes de telecomunicacione', 'Diseño: Caja hermética con tapa transparente.
Protección: Contra polvo, humedad y salpicaduras de agua.
Instalación: Sobrepuesta en pared o superficie', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-007', 1, 'TIBOX', 'Polyester Enclosure 400x300x200 mm', 'es una caja hermética fabricada en poliéster reforzado', 'Gabinete / Caja hermética de poliéster', 'Utilizado para alojar y proteger equipos eléctricos, tableros de control, dispositivos de telecomunicaciones, empalmes y componentes electrónicos en redes de telecomunicaciones,', 'Dimensiones: 400 x 300 x 200 mm.
Tipo de instalación: Mural / sobrepuesta.
Diseño: Gabinete con puerta frontal y cierre de seguridad.
Protección: Resistente a humedad, polvo y corrosión.', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 39, 'DIXON', 'Patch Cord', 'Patch cord de red de categoría 6, con conectores RJ-45 en ambos extremos - 3 METROS', NULL, 'Conexión de equipos de red (computadoras, switches, routers) en interiores', 'Categoría: Cat 6 (soporta hasta 1 Gbps y 250 MHz) .
Longitud: 3 metros .
Color: Azul', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 30, 'DIXON', 'Patch Cord', 'Patch cord de red de categoría 6, con conectores RJ-45 en ambos extremos- 1  METRO', NULL, 'Conexión de equipos de red (computadoras, switches, routers) en interiores', 'Categoría: Cat 6 (soporta hasta 1 Gbps y 250 MHz) .
Longitud: 1 metros .
Color: Azul', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 18, 'LT USA', 'Patch Cord', 'Patch cord de red de categoría 6 SFTP, con conectores RJ-45 en ambos extremos- 0.5 METRO', NULL, 'Conexión de equipos de red (computadoras, switches, routers) en interiores', 'Categoría: Cat 6 (soporta hasta 1 Gbps y 250 MHz) .
Longitud: 0.5 metros .
Color: Azul', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 14, 'SOLYA', 'Patch Cord', 'Patch cord de red de categoría 6, con conectores RJ-45 en ambos extremos- 1  METRO', NULL, 'Conexión de equipos de red (computadoras, switches, routers) en interiores', 'Categoría: Cat 6 (soporta hasta 1 Gbps y 250 MHz) .
Longitud: 1 metros .
Color: Azul', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 5, 'PANDUIT', 'Patch Cord', 'Patch cord de red de categoría 6, con conectores RJ-45 en ambos extremos- 15  METRO', NULL, 'Conexión de equipos de red (computadoras, switches, routers) en interiores', 'Categoría: Cat 6 (soporta hasta 1 Gbps y 250 MHz) .
Longitud: 15 metros .
Color: Azul', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 2, 'OPTISAIT', 'Patch Cord', 'Patch cord de red de categoría 6, con conectores RJ-45 en ambos extremos- 2  METRO', NULL, 'Conexión de equipos de red (computadoras, switches, routers) en interiores', 'Categoría: Cat 6 (soporta hasta 1 Gbps y 250 MHz) .
Longitud: 2 metros .
Color: Azul', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 1, 'TRAUTECH', 'Patch Cord', 'Patch cord de red de categoría 6, con conectores RJ-45 en ambos extremos- 10 METROS', NULL, 'Conexión de equipos de red (computadoras, switches, routers) en interiores', 'Categoría: Cat 6 (soporta hasta 1 Gbps y 250 MHz) .
Longitud: 10 metros .
Color: Azul', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 1, 'MACROTEL', 'Patch Cord', 'Patch cord de red de categoría 6, con conectores RJ-45 en ambos extremos- 5 METRO', NULL, 'Conexión de equipos de red (computadoras, switches, routers) en interiores', 'Categoría: Cat 6 (soporta hasta 1 Gbps y 250 MHz) .
Longitud: 5 metros .
Color: Azul', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 1, 'BRAND-REX', 'Patch Cord', 'Patch cord de red de categoría 6, con conectores RJ-45 en ambos extremos- 16 METRO', NULL, 'Conexión de equipos de red (computadoras, switches, routers) en interiores', 'Categoría: Cat 6 (soporta hasta 1 Gbps y 250 MHz) .
Longitud: 16 metros .
Color: Azul', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 2, 'BRAND-REX', 'Patch Cord', 'Cable de conexión (patch cord) de fibra óptica dúplex con conectores LC en ambos extremos', NULL, 'Redes de alta velocidad, conexiones entre switches, servidores y paneles de parcheo en centros de datos.', 'Tipo de Fibra: Monomodo (OS1/OS2) 9/125 µm .
Longitud: 2 metros - Morado', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 18, NULL, 'Optical Patch Cord - JUP-LC-LC', 'Cable de conexión (patch cord) de fibra óptica dúplex con conectores LC en ambos extremos 3M', 'Patch Cord (Cable de conexión) de fibra óptica', 'Redes de alta velocidad, conexiones entre switches, servidores y paneles de parcheo en centros de datos.', 'Tipo de Fibra: Monomodo (OS1/OS2) 9/125 µm .
Longitud: 3 metros - Amarillo', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 2, 'BRAND-REX', 'HOPLC008020LC203', 'Cable de conexión (patch cord) de fibra óptica dúplex con conectores LC en ambos extremos-2M', 'Patch Cord (Cable de conexión) de fibra óptica', 'Redes de alta velocidad, conexiones entre switches, servidores y paneles de parcheo en centros de datos.', 'Tipo de Fibra: Monomodo (OS1/OS2) 9/125 µm .
Longitud: 2 metro', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 6, NULL, 'SC-SC OM2 multimodo dual-fibra', 'Cable de conexión (patch cord) de fibra óptica SC-SC, multimodo OM2, dúplex (dos fibras).', 'Patch Cord (Cable de conexión) de fibra óptica', 'de corta a media distancia, típicamente en interiores de edificios o centros de datos', 'Conectores: SC a SC (ambos extremos).
Tipo de fibra: Multimodo OM2 (diámetro de núcleo 50/125 µm).
Configuración: Dual-fibra / Dúplex (dos)', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-008', 2, 'BRAND-REX', 'DX17069731', 'Cable de conexión (patch cord) de fibra óptica LC a LC dúplex, multimodo OM3, de 3 metros de longitud', 'Patch Cord (Cable de conexión) de fibra óptica', 'Redes de alta velocidad en centros de datos o LAN empresariales,', 'Conectores: LC a LC (ambos extremos, tipo dúplex).
- Longitud: 3 metros.
- Tipo de fibra: Multimodo', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('NO TIENE CAJA', 3, '??', 'brackets de montaje para cámaras de seguridad', 'brackets de montaje para cámaras de seguridad', 'Bracket / soporte de pared para cámara de seguridad tipo bullet', 'Montaje de cámaras IP o analógicas tipo bullet en paredes, techos', '• Material: aluminio / metal pintado blanco
• Color: Blanco
• Tipos visibles:  — Largo (~25 cm): soporte recto con abrazadera ajustable y pasacable  — Mediano (~20 cm): similar al largo, sin cable visible  — Corto/angular (~10 cm): soporte curvo compacto', (SELECT id FROM categorias WHERE nombre = '⚪ Otros / Accesorios'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-009', 120, 'FBS – Furukawa Broadband System', 'Kit de adptadores opticos 01F SM SC,APC', 'Kit de 2 adaptadores ópticos SC-APC monomodo, color verde — para empalme/unión de conectores SC/APC en rosetas, patch panels y cajas de distribución', 'Optical Adapter Kit — SC/APC — Monomodo (SM) — 01F', 'Unión de conectores SC/APC en puntos de terminación de fibra óptica FTTH — rosetas, ODF', 'Tipo adaptador: SC-APC (ángulo 8°)
• Fibra: Monomodo (SM)
• Configuración: 01F (simplex — 1 fibra)
• Color: Verde (estándar APC) ✓
• Cantidad: Kit 02 pcs (2 adaptadores por bolsa)', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-009', 22, 'Furukawa (Furukawa Broadband System)', NULL, 'Kit con 10 conectores ópticos de campo SM SC-APC EZ!, diseñados para cables planos (flat) de 1.6x2 mm y 3x2 mm.', 'Kit de conectores ópticos de campo (Field connector', 'Instalación en campo de terminaciones de fibra óptica monomodo, en interiores', 'Tipo de fibra: Monomodo (SM). Conector: SC-APC (pulido Angled Physical Contact, 8°).
Cantidad: 10 conectores por kit.G30', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-009', 6, 'FURUKAWA (ELECTRIC GRUOP)', 'G-652D SC-APC/SC.UPC 2.5M', NULL, 'SIMPLEX OPTICAL PATCH CORD', 'Redes de alta velocidad en centros de datos o LAN empresariales,', 'Tipo de Fibra: Monomodo (OS1/OS2) 9/125 µm .
Longitud: 2.5 metros', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-010', 1420, 'FURUKAWA (ELECTRIC GRUOP)', 'G657A SC-APC 1.5M', 'Extensión o cable pigtail de fibra óptica monofibra (monofibrilha), con conector SC-APC, de 1.5 metros de longitud, color blanco.', 'Pigtail (cable de terminación) o extensión de fibra óptica', 'Terminación de fibras monomodo en cajas de empalme, bandejas ópticas o conectores de campo. Se empalma (fusiona) a un cable de fibra para crear un conector hembra.', 'Conector: SC-APC (Angled Physical Contact, pulido a 8°, color verde típicamente).
Longitud: 1.5 metros
Tipo de fibra: Monomodo (SM).', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-011', 85, 'MIZU', 'MFC-SC/APC-Q', 'Conector de fibra óptica SC/APC de campo, tipo rápido (quick/fast connector), pre-pulido de fábrica, sin necesidad de pulido manual en campo', 'Conector SC/APC Simplex — Monomodo (Single Mode)', 'Redes FTTH / FTTP', '• Ferrula cerámica de zirconia pre-pulida con ángulo de 8°
• Contacto físico angulado (APC) para mínima reflexión de retorno
• Fibra monomodo 9/125 µm (G.652D / G.657A)
• Compatible con cables de 0.9 / 2.0 / 3.0 mm', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-011', 9, 'HI-LINK', 'MZFI 2H', 'ONT (Optical Network Terminal) con función de router WiFi para redes FTTH — convierte señal óptica a señal Ethernet/WiFi para uso en el hogar', 'ONT/ONU GPON con WiFi integrado', 'Punto final de la red óptica pasiva (PON)', '• Puerto PON SC/APC (fibra óptica entrada)
• WiFi integrado (2.4 GHz — por confirmar si es dual band)
• Puertos LAN Ethernet (GE)', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-012', 1, 'INDECO S.A. (empresa Nexans)', 'CTM 2 x 16 AWG', 'Cable duplex (mellizo) paralelo, color blanco, conductor de cobre, calibre 16 AWG, presentación en rollo', 'Cable eléctrico flexible duplex — TM (Termoplástico)', 'Instalaciones eléctricas residenciales y comerciales, circuitos de iluminación, tomacorrientes de baja potencia', 'Conductor: Cobre electrolítico 100% puro
• Calibre: 16 AWG (1.31 mm²)
• Número de conductores: 2 (duplex/mellizo)
• Aislamiento: PVC termoplástico
• Color: Blanco', (SELECT id FROM categorias WHERE nombre = '⚡ Cable / Equipo de Energía'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-013', 1, 'DIXON', '9040 LSZH', 'Cable UTP Cat.6 sólido de 4 pares trenzados, cubierta LSZH (Low Smoke Zero Halogen), conductor de cobre desnudo, presentación en caja de 305 metros', 'Cable de red UTP (Unshielded Twisted Pair) — Categoría 6', 'Redes LAN, instalaciones de datos en edificios, oficinas, centros de datos, cableado estructurado horizontal', 'Pares: 4 pares trenzados (8 conductores)
• Conductor: Cobre desnudo sólido (Bare Copper)
• Calibre: 24 AWG
• Categoría: CAT.6
• Apantallamiento: UTP (sin blindaje)', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-014', 1, 'DIXON', '8041 STP Exteriores', 'Cable STP Cat.5e de 4 pares trenzados blindados, conductor sólido de cobre, cubierta PE exterior resistente a UV, para instalaciones en exteriores', 'Cable de red STP (Shielded Twisted Pair) — Categoría 5e — Exterior/Outdoor', 'Redes LAN en exteriores, enlaces entre edificios, instalaciones aéreas o enterradas, cámaras IP exteriores, puntos de acceso WiFi outdoor,', 'Pares: 4 pares trenzados blindados (8 conductores)
• Conductor: Cobre sólido desnudo (Bare Copper) — 24 AWG
• Categoría: CAT.5e', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-015', 1, 'LS Cable & System', 'UTP-E-C5G-E1ZN-X 0.5X004P/GY', 'Cable UTP Categoría 5e, 4 pares, conductor sólido 24 AWG, cubierta LSZH, color gris, presentación en caja de 305 metros en carrete', 'Cable de red UTP (Unshielded Twisted Pair) — Categoría 5e — Interior', 'Cableado estructurado horizontal, redes LAN en oficinas y edificios, instalaciones bajo norma TIA/EIA-568 e ISO/IEC 11801', '• Pares: 4 pares trenzados (4PR)
• Conductor: Cobre sólido — 24 AWG (0.5 mm)
• Categoría: CAT.5e
• Apantallamiento: UTP (sin blindaje)', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-016', 1, 'LEGRAND (Francia)', NULL, 'Cable U/UTP Categoría 6, 4 pares LSZH, color azul.', 'Cable de red U/UTP (Unshielded Twisted Pair) — Categoría 6 — Interior', 'Cableado estructurado en edificios, redes LAN, oficinas.', '• Pares: 4 pares trenzados (4 pairs)
• Categoría: CAT.6
• Apantallamiento: U/UTP (sin blindaje)', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-017', 1, 'CABLESCOM', NULL, 'Rollo de cable gris envuelto con cinta de embalaje CABLESCOM — sin etiqueta técnica legible', 'Aparenta ser cable UTP/FTP de red (por grosor y color gris)', 'Cableado estructurado en edificios, redes LAN, oficinas.', '• Pares: 4 pares trenzados (4 pairs)
• Categoría: CAT.6
• Apantallamiento: U/UTP (sin blindaje)', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-018', 1, 'HIKVISION', '(serie DS-2DE4x / DS-2AE4x', 'Cámara Speed Dome PTZ IR para uso interior y exterior, con posicionamiento inteligente 3D, LEDs IR', 'Cámara PTZ IR Speed Dome — Indoor/Outdoor', 'Videovigilancia profesional en interiores y exteriores', '• Movimiento PTZ (Pan / Tilt / Zoom)
• Posicionamiento inteligente 3D
• Función de memoria post-apagado (Power-off memory)
• Enmascaramiento de privacidad (Privacy masking)
• Movimiento PTZ programado (Scheduled PTZ movement)', (SELECT id FROM categorias WHERE nombre = '⚪ Otros / Accesorios'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-019', 19, 'DIXON', 'KJ8-C6-US/BKN', 'Jack RJ-45 Cat.6 tipo poncheo (punch-down / IDC), color negro', 'Jack Keystone RJ-45 — Categoría 6 — Poncheo 110', 'Terminación de cable UTP/FTP Cat.6 en puntos de red', '• Conector: RJ-45 (8P8C)
• Categoría: CAT.6
• Tipo de terminación: Poncheo / IDC (punch-down 110)
• Color: Negro (BKN)', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-019', 34, 'RJ45', NULL, NULL, NULL, NULL, NULL, (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-019', 64, 'Protector / boot para conector RJ-45', NULL, 'Capuchas protectoras de goma/PVC para conectores RJ-45, color azul, en bolsa a granel', 'Boot / capucha protectora para plug RJ-45', 'Protección del conector RJ-45 y alivio de tensión del cable', '• Color: Azul
• Material: PVC / goma flexible
• Compatible con conectores RJ-45', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-020', 1, 'ZTE', 'ZTE F660 / F670', 'ONT/Router GPON con WiFi integrado, 4 puertos LAN, antenas externas, marcado con logo del ISP Nubyx', 'ONT GPON + Router WiFi', NULL, 'Puerto PON (SC/APC — fibra óptica)
• 4 puertos LAN Gigabit Ethernet
• WiFi integrado (2.4 GHz — antenas externas visibles)', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-021', 19, 'NVIDIA', 'NV P/N: 030-0851-000', 'Adaptador original NVIDIA de DisplayPort a DVI', 'Adaptador activo/pasivo DisplayPort → DVI', 'Conexión de monitor con entrada DVI a tarjeta gráfica NVIDIA con salida DisplayPort — uso en PC de escritorio con GPU NVIDIA', 'Conector entrada: DisplayPort (DP macho)
• Conector salida: DVI-D (hembra)', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-021', 6, 'OEM / genérico', NULL, 'Cable adaptador de alimentación Molex 4-pin (IDE) a SATA', 'Cable adaptador de poder Molex → SATA', 'Alimentación de discos duros SATA, SSDs, unidades ópticas SATA, desde fuentes de poder que tienen salidas Molex (IDE)', '• Conector entrada: Molex 4-pin (blanco — +12V amarillo, +5V rojo, GND negro)
• Conector salida: SATA power (negro — 15 pines)
• Cables: 3 hilos (amarillo +12V / rojo +5V / negro GND)', (SELECT id FROM categorias WHERE nombre = '⚡ Cable / Equipo de Energía'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-021', 6, 'OEM / genérico', NULL, 'Cable adaptador 2x Molex 4-pin (IDE) a 1x PCI-E 8-pin (6+2) —', 'Cable adaptador de poder 2x Molex → PCIe 8-pin (6+2)', 'Alimentación de tarjetas gráficas dedicadas (GPU) PCIe que requieren conector de 8 pines', '• Conector entrada: 2x Molex 4-pin (blanco — +12V amarillo / GND negro)
• Conector salida: 1x PCIe 8-pin (6+2) (blanco)
• Cables: negro y amarillo (estándar ATX)', (SELECT id FROM categorias WHERE nombre = '⚡ Cable / Equipo de Energía'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-022', 7, 'FURUKAWA ELECTRIC GROUP', 'FBS Rosette 2P 4x2', 'Roseta óptica de superposición (superficie) para 2 puertos, caja 4x2, color blanco', 'Roseta óptica de pared — superposición / sobreponer', 'Punto de terminación de fibra óptica en instalaciones FTTH residenciales y comerciales', '• Capacidad: 2 puertos ópticos (2P)
• Dimensiones caja: 4x2 (formato estándar)
• Tipo de instalación: Superposición / sobreponer (surface mount — sin embutir)', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-023', 12, 'DIXON', 'JE317A-V4/WH', 'Placa ejecutiva de pared para 4 puertos keystone, color blanco — soporte para jacks RJ-45', 'Faceplate / Placa ejecutiva — 4 puertos — formato estándar', 'Instalación en pared o caja de salida para alojar jacks keystone RJ-45 Cat.5e/Cat.6/Cat.6A', '• Puertos: 4 posiciones keystone
• Color: Blanco (WH)
• Tipo: Ejecutiva (diseño slim/moderno)', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-023', 17, NULL, NULL, 'Conector tipo buje / unión recta para tubería conduit rígida o flexible de PVC — permite empalmar dos tramos de tubo o conectar tubo a caja eléctrica', 'Conector / Bushing para conduit PVC — rosca exterior', 'Instalaciones eléctricas y de telecomunicaciones', 'Material: PVC rígido (policloruro de vinilo)
• Color: Gris/blanco
• Diámetro aparente: ~20 mm (3/4") o 25 mm (1") — requiere medición exacta', (SELECT id FROM categorias WHERE nombre = '⚪ Otros / Accesorios'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-023', 2, 'TE Connectivity / AMP', NULL, 'Jack RJ-45 Cat.6 SL (Slim Line) tipo poncheo 110, color negro, estándar 568A/B — línea premium AMP NETCONNECT TrueNet', 'Jack Keystone RJ-45 — Categoría 6 SL (Slim Line)', 'Terminación de cable UTP/FTP Cat.6 en puntos de red, rosetas, patch panels', '• Conector: RJ-45 (8P8C)
• Categoría: CAT.6 SL (Slim Line)
• Terminación: Poncheo 110 IDC', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-024', 8, 'ATP-Link', 'MGB-LX', 'Módulo SFP Gigabit 1000BASE-LX para fibra monomodo, longitud de onda 1310nm', 'Transceptor SFP 1000BASE-LX — Fibra monomodo', 'Conexión de fibra óptica monomodo en switches gestionables, routers y equipos con slot SFP', 'Estándar: 1000BASE-LX (IEEE 802.3z)
• Velocidad: 1 Gbps (Gigabit)
• Longitud de onda: 1310 nm
• Tipo de fibra: Monomodo (SMF)', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-024', 8, 'PLANET (Networking & Communication)', 'GT-905A', 'Convertidor de medios gestionado 10/100/1000BASE-T a Mini-GBIC (SFP)', 'Managed Media Converter Gigabit', 'Extensión de red Gigabit sobre fibra óptica, enlaces entre edificios, conversión de medios en redes LAN/WAN', 'Puerto cobre: 10/100/1000BASE-T (RJ-45 auto-negociación)
• Puerto fibra: Mini-GBIC (SFP) — soporta MM y SM según módulo instalado
• Gestionado vía Web / SNMP v1, v2c, Trap', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-024', 8, NULL, NULL, 'Cajas plásticas de terminación para fibra óptica tipo NAP (Network Access Point) o caja de distribución de pared', 'Caja de terminación / NAP de fibra óptica', 'Punto de terminación y distribución de fibra óptica en instalaciones FTTH', '• Material: ABS plástico — color blanco
• Orificios de entrada para cable de fibra
• Ranura frontal para adaptador SC/APC o SC/UPC', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-024', 2, 'Logitech', 'MK120', 'Combo teclado y mouse con cable USB, plug and play.', 'Combo teclado y mouse con cable USB', 'Uso diario en PC de escritorio', 'Conexión: USB con cable (Plug and Play)
• Teclado: tamaño completo con teclado numérico — teclas de perfil bajo
• Mouse: óptico con cable USB — diseño ergonómico', (SELECT id FROM categorias WHERE nombre = '⚪ Otros / Accesorios'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-024', 1, 'Logitech', 'MK220', 'Combo teclado y mouse inalámbrico compacto, receptor USB nano unificado, color negro', 'Combo teclado + mouse inalámbrico (wireless)', 'Uso diario en PC de escritorio', 'Conexión: Inalámbrica 2.4 GHz — receptor Nano USB unificado (1 solo receptor para ambos dispositivos)
• Teclado: compacto sin teclado numérico — perfil bajo', (SELECT id FROM categorias WHERE nombre = '⚪ Otros / Accesorios'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-024', 2, 'COMMSCOPE', 'CPP-SDDM-SL-1U-24', 'Patch panel Cat.6A SL (Slim Line) de 24 puertos, 1U rack, con jacks keystone integrados — línea NETCONNECT de CommScope (antes AMP)', 'Patch Panel Cat.6A — 24 puertos', 'Centro de distribución en rack para cableado estructurado Cat.6A', 'Puertos: 24 puertos RJ-45 keystone integrados
• Categoría: CAT.6A (10 Gigabit Ethernet)
• Altura: 1U (rack 19")
• Tipo: SL (Slim Line) — diseño delgado', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-024', 1, NULL, NULL, 'Regleta de energía tipo PDU rack 1U con múltiples tomas de corriente', 'PDU (Power Distribution Unit) — Regleta rack 1U', 'Tomas visibles: aproximadamente 8 salidas (tipo Schuko/universal)• Interruptor principal con luz indicadora de seguridad (rojo)• Cable de alimentación incluido• Formato: 1U rack 19" con orejas de montaje', 'Tomas visibles: aproximadamente 8 salidas (tipo Schuko/universal)
• Interruptor principal con luz indicadora de seguridad (rojo)
• Cable de alimentación incluido
• Formato: 1U rack 19" con orejas de montaje', (SELECT id FROM categorias WHERE nombre = '⚡ Cable / Equipo de Energía'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-025', 1, 'PROCET (PoE System)', 'PT-PSE109GBR0-AH', 'Inyector PoE Gigabit de un puerto', 'PoE Injector — Gigabit — IEEE 802.3bt / alta potencia', 'Alimentación de dispositivos PoE- cuando el switch no tiene PoE nativo.', 'Puertos: 1x LAN (entrada) + 1x PoE (salida con energía)
• Velocidad datos: 10/100/1000 Mbps (Gigabit)
• Alimentación entrada: 100-240V AC ~ 2.0A — 50/60Hz
• Salida PoE: 55V DC — 1.5A', (SELECT id FROM categorias WHERE nombre = '⚡ Cable / Equipo de Energía'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-025', 1, 'FURUKAWA (FBS — Furukawa Broadband System)', 'NT-G400R', 'ONT (Optical Network Terminal) GPON', 'ONT/ONU GPON — Equipo terminal de usuario FTTH', 'Conexión de fibra óptica GPON al hogar o empresa — punto terminal de red óptica pasiva', '• Alimentación: 12V DC = 1A', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-025', 1, NULL, NULL, 'Switch de escritorio de 5 puertos RJ-45, compacto, color blanco', 'Switch Ethernet no gestionado — 5 puertos — desktop', 'Expansión de red LAN en hogar, oficina o PYME — conectar múltiples dispositivos desde un solo punto de red', '• Puertos: 5x RJ-45 (numerados 1-5 visibles)
• LED indicador en la parte superior (verde visible)
• Color: Blanco', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-025', 1, 'ASTER', NULL, 'Tornillos dentados de alta penetración — cabeza Philips (estrella),', 'Tornillos autorroscantes de alta penetración', 'Fijación en madera, aglomerado, drywall, estructura liviana', '• Tipo: Dentados de alta penetración (rosca agresiva)
• Cabeza: Philips (estrella / PH2)
• Acabado: Zincado amarillo (protección anticorrosión)
• Punta: burlón (autorroscante)', (SELECT id FROM categorias WHERE nombre = '⚪ Otros / Accesorios'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-025', 2, 'MIZU', 'CAM-7R', 'Fiber Cleaver (clivador) de precisión para fibra óptica — herramienta de corte recto de la fibra antes de empalme o conectorización', 'Fiber Cleaver — Clivador de fibra óptica de precisión', 'Corte preciso de fibra óptica monomodo y multimodo para empalme por fusión (fusion splicer) o instalación de conectores rápidos', '• Cuerpo: aluminio anodizado azul + componentes negros
• Cuchilla: diamante o carburo de tungsteno (giratoria/reemplazable)
• Compatible con fibra: SM (G.652 / G.657) y MM
• Diámetro fibra: 125 µm (con buffer 250 µm y 900 µm)', (SELECT id FROM categorias WHERE nombre = '🔵 Red de Fibra Óptica'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-025', 1, 'TP-Link', 'TL-SG105', 'Switch Gigabit no gestionado de 5 puertos, carcasa metálica, diseño desktop', 'Switch Ethernet Gigabit no gestionado — 5 puertos — desktop', 'Expansión de red LAN Gigabit en hogar, oficina o PYME — conectar PCs, NAS, impresoras, cámaras IP, APs desde un solo punto', '• Puertos: 5x RJ-45 Gigabit (10/100/1000 Mbps)
• Plug and Play — sin configuración ni software
• Carcasa: metal (durable, disipación de calor)', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-025', 1, 'TP-Link (línea LiteWave)', 'LS1005', 'Switch Fast Ethernet no gestionado de 5 puertos 10/100 Mbps, carcasa plástica blanca, diseño desktop', 'Switch Ethernet Fast Ethernet no gestionado — 5 puertos — desktop', 'Expansión de red LAN básica en hogar o pequeña oficina', 'Puertos: 5x RJ-45 Fast Ethernet (10/100 Mbps)
• Velocidad máxima: hasta 200 Mbps (full duplex', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-025', 2, 'BANDING', 'Stainless Steel Banding', 'Cinta de acero inoxidable para amarre de cables, postes y estructuras — rollo de 30.5 metros, ancho 12.7 mm, espesor 0.7 mm', 'Cinta de fleje de acero inoxidable', 'Sujeción y amarre de cables de fibra óptica, cables coaxiales y eléctricos en postes, torres, mástiles y estructuras metálicas', 'Material: SS304 (acero inoxidable 304) ✓ marcado
• Ancho: 12.7 mm
• Espesor: 0.7 mm
• Longitud: 30.5 metros por rollo
• Alta resistencia a corrosión, UV y temperatura', (SELECT id FROM categorias WHERE nombre = '⚪ Otros / Accesorios'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-025', 5, 'ABB', 'SH202 C20', 'Interruptor automático termomagnético bipolar (2 polos) de 20A, curva C — para protección de circuitos eléctricos', 'Interruptor termomagnético 2P', 'Protección de circuitos eléctricos', 'Polos: 2P (bipolar)
• Corriente nominal: 20A
• Curva de disparo: C (uso general — motores pequeños, iluminación, tomas)
• Tensión nominal: 230/400V AC
• Poder de corte: 6 kA', (SELECT id FROM categorias WHERE nombre = '⚡ Cable / Equipo de Energía'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-025', 1, NULL, 'SNMP Web Pro', 'Tarjeta de gestión SNMP para UPS — permite monitoreo y control remoto vía Web y SNMP', 'SNMP Web Management Card para UPS', 'Gestión remota de UPS en centros de datos, salas de servidores y cuartos de telecomunicaciones', '• Puerto Ethernet: 10/100BASE-T (RJ-45)
• LED 100M: verde (encendido = operando a 100Mbps)
• LED Link: amarillo (parpadeando = link activo)', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('CAJA-026', 1, 'DIXON', 'P48T-K11-C6C/BK', 'Patch panel Cat.6 UTP de 48 puertos RJ-45, tipo 180°', 'Patch Panel Cat.6 — 48 puertos — 2U — rack 19"', 'Centro de distribución en rack para cableado estructurado Cat.6', 'Puertos: 48x RJ-45 (Cat.6)
• Categoría: CAT.6 ✓
• Apantallamiento: Unshielded (UTP)', (SELECT id FROM categorias WHERE nombre = '🟢 Red UTP / Datos'));
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('TOTAL', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES ('LEYENDA DE ESTADOS:', 0, NULL, 'Incompleto', 'En revisión', NULL, NULL, NULL, NULL);
