// Helper que aplica un estilo profesional a una hoja de ExcelJS.
// - Header: blanco/bold sobre azul, frozen
// - Bordes sutiles
// - Zebra striping
// - Columnas de fecha con formato dd/mm/yyyy hh:mm
// - Columna de estado con color de fondo según el valor

const STATE_COLORS = {
  ACTIVO:     'FF16A34A',
  REVISION:   'FFF59E0B',
  SUSPENDIDO: 'FF6B7280',
  NO_HABIDO:  'FFDC2626',
  AGREGADO:   'FF2563EB',
  RETIRADO:   'FF94A3B8',
};

export function styleSheet(ws, { dateColumns = [], stateColumn = null, headerColor = 'FF1D4ED8' } = {}) {
  // ── HEADER ──
  const headerRow = ws.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Segoe UI' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    cell.border = {
      top:    { style: 'thin', color: { argb: 'FF1E3A8A' } },
      bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
      left:   { style: 'thin', color: { argb: 'FF1E3A8A' } },
      right:  { style: 'thin', color: { argb: 'FF1E3A8A' } },
    };
  });

  // Frozen header
  ws.views = [{ state: 'frozen', ySplit: 1, showGridLines: false }];

  // ── DATA ROWS ──
  for (let i = 2; i <= ws.rowCount; i++) {
    const row = ws.getRow(i);
    row.height = 22;
    const isOdd = i % 2 === 1;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = cell.font || { name: 'Segoe UI', size: 10 };
      if (!cell.font.name) cell.font.name = 'Segoe UI';
      if (!cell.font.size) cell.font.size = 10;
      cell.alignment = cell.alignment || { vertical: 'middle', indent: 1 };
      cell.border = {
        top:    { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left:   { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right:  { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
      if (isOdd) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    });
  }

  // ── DATE COLUMNS ──
  dateColumns.forEach((col) => {
    try {
      ws.getColumn(col).numFmt = 'dd/mm/yyyy hh:mm';
    } catch (_) {}
  });

  // ── STATE COLUMN ──
  if (stateColumn) {
    for (let i = 2; i <= ws.rowCount; i++) {
      let cell;
      try { cell = ws.getRow(i).getCell(stateColumn); } catch (_) { continue; }
      const value = String(cell.value || '').toUpperCase();
      const color = STATE_COLORS[value];
      if (color) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, name: 'Segoe UI', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  }
}
