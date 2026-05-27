// Importa las cajas desde el Excel "Inventario_Cajas_final" a la base de datos.
// Uso:  node importExcel.js  [ruta_al_excel]
import ExcelJS from 'exceljs';
import path from 'path';
import { db } from './db.js';

// Ruta por defecto del Excel (se puede pasar otra por argumento)
const DEFAULT_EXCEL = 'C:/Users/ANTHONY/Downloads/qodifica/scrap_data/descargas/Inventario_Cajas_final (1).xlsx';
const excelPath = process.argv[2] || DEFAULT_EXCEL;

// Normaliza un valor de celda de exceljs a string limpio
const norm = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    if (v.text) return String(v.text).trim();
    if (v.result !== undefined) return String(v.result).trim();
    if (v.richText) return v.richText.map((r) => r.text).join('').trim();
    return '';
  }
  return String(v).trim();
};

async function main() {
  console.log('Leyendo Excel:', excelPath);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(excelPath);
  const sheet = wb.getWorksheet('Inventario') || wb.worksheets[0];

  // Mapa de categorías existentes (nombre -> id)
  const [cats] = await db.query('SELECT id, nombre FROM categorias');
  const catMap = new Map(cats.map((c) => [c.nombre, c.id]));

  const filas = [];
  sheet.eachRow((row, n) => {
    if (n < 7) return; // saltar encabezados (filas 1-6)
    const v = row.values.slice(1).map(norm);
    // Columnas: 0 N°CAJA 1 CANTIDAD 2 MARCA 3 MODELO 4 DESCRIPCION 5 TIPO 6 USO 7 CARACTERISTICAS 8 CATEGORIA
    if (!v[0]) return;
    filas.push(v);
  });

  console.log(`Filas a importar: ${filas.length}`);

  // Asegurar que las categorías del Excel existan
  for (const v of filas) {
    const catNombre = v[8];
    if (catNombre && !catMap.has(catNombre)) {
      const [r] = await db.query('INSERT IGNORE INTO categorias (nombre) VALUES (?)', [catNombre]);
      if (r.insertId) catMap.set(catNombre, r.insertId);
      else {
        const [[row]] = await db.query('SELECT id FROM categorias WHERE nombre = ?', [catNombre]);
        if (row) catMap.set(catNombre, row.id);
      }
    }
  }

  // Limpiar cajas previas para no duplicar en reimportaciones
  await db.query('DELETE FROM cajas');
  console.log('Tabla cajas limpiada antes de importar.');

  let insertadas = 0;
  for (const v of filas) {
    const cantidad = parseInt((v[1] || '0').replace(/\D/g, ''), 10) || 0;
    const categoria_id = v[8] ? catMap.get(v[8]) || null : null;
    await db.query(
      `INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [v[0], cantidad, v[2] || null, v[3] || null, v[4] || null, v[5] || null, v[6] || null, v[7] || null, categoria_id]
    );
    insertadas++;
  }

  console.log(`\n✅ Importación completa: ${insertadas} cajas cargadas.`);
  await db.end();
}

main().catch((err) => {
  console.error('✗ Error al importar:', err.message);
  process.exit(1);
});
