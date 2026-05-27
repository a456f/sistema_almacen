// Genera backend/sql/seed_cajas.sql a partir del Excel, para poder desplegar
// los datos en el VPS sin necesidad de subir el archivo Excel.
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_EXCEL = 'C:/Users/ANTHONY/Downloads/qodifica/scrap_data/descargas/Inventario_Cajas_final (1).xlsx';
const excelPath = process.argv[2] || DEFAULT_EXCEL;

const CATEGORIAS = [
  ['🔵 Red de Fibra Óptica', '#2563eb'],
  ['🟢 Red UTP / Datos', '#16a34a'],
  ['⚡ Cable / Equipo de Energía', '#f59e0b'],
  ['⚪ Otros / Accesorios', '#6b7280'],
];

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

const sql = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : 'NULL');

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(excelPath);
  const sheet = wb.getWorksheet('Inventario') || wb.worksheets[0];

  const filas = [];
  sheet.eachRow((row, n) => {
    if (n < 7) return;
    const v = row.values.slice(1).map(norm);
    if (!v[0]) return;
    filas.push(v);
  });

  let out = `-- Seed de cajas generado desde el Excel (${filas.length} cajas)\n`;
  out += `USE sistema_inventario;\n\n`;

  out += `-- Categorías\n`;
  for (const [nombre, color] of CATEGORIAS) {
    out += `INSERT IGNORE INTO categorias (nombre, color) VALUES (${sql(nombre)}, ${sql(color)});\n`;
  }

  out += `\n-- Limpiar cajas previas\nDELETE FROM cajas;\n\n-- Cajas\n`;
  for (const v of filas) {
    const cantidad = parseInt((v[1] || '0').replace(/\D/g, ''), 10) || 0;
    const cat = v[8] ? `(SELECT id FROM categorias WHERE nombre = ${sql(v[8])})` : 'NULL';
    out += `INSERT INTO cajas (numero_caja, cantidad, marca, modelo, descripcion, tipo, uso, caracteristicas, categoria_id) VALUES (`
      + `${sql(v[0])}, ${cantidad}, ${sql(v[2])}, ${sql(v[3])}, ${sql(v[4])}, ${sql(v[5])}, ${sql(v[6])}, ${sql(v[7])}, ${cat});\n`;
  }

  const dest = path.join(__dirname, 'sql', 'seed_cajas.sql');
  fs.writeFileSync(dest, out, 'utf8');
  console.log(`✓ Generado ${dest} con ${filas.length} cajas`);
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
