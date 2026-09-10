export const EXPORT_FORMATS = [
  { id: 'csv', label: 'CSV' },
  { id: 'excel', label: 'Excel' },
  { id: 'pdf', label: 'PDF' },
  { id: 'xml', label: 'XML' },
]

function cellText(value) {
  return String(value ?? '')
}

function escapeXml(value) {
  return cellText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function escapeHtml(value) {
  return cellText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function xmlTag(key) {
  const tag = String(key || 'col').replace(/[^\w.-]+/g, '_')
  return /^\d/.test(tag) ? `c_${tag}` : tag || 'col'
}

export function rowsToCsv(columns, rows) {
  const header = columns.map(c => c.label).join(',')
  const body = rows.map(r => columns.map(c => {
    const raw = cellText(r[c.key]).replace(/"/g, '""')
    return `"${raw}"`
  }).join(','))
  return [header, ...body].join('\n')
}

export function rowsToExcelXml(columns, rows) {
  const header = `<Row>${columns.map(c => `<Cell><Data ss:Type="String">${escapeXml(c.label)}</Data></Cell>`).join('')}</Row>`
  const body = rows.map(r => (
    `<Row>${columns.map(c => `<Cell><Data ss:Type="String">${escapeXml(r[c.key])}</Data></Cell>`).join('')}</Row>`
  )).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Export">
  <Table>
   ${header}
   ${body}
  </Table>
 </Worksheet>
</Workbook>`
}

export function rowsToXml(columns, rows) {
  const body = rows.map(r => {
    const cells = columns.map(c => `    <${xmlTag(c.key)}>${escapeXml(r[c.key])}</${xmlTag(c.key)}>`).join('\n')
    return `  <row>\n${cells}\n  </row>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<table>\n${body}\n</table>\n`
}

export function rowsToPrintHtml(columns, rows, title) {
  const th = columns.map(c => `<th>${escapeHtml(c.label)}</th>`).join('')
  const body = rows.map(r => `<tr>${columns.map(c => `<td>${escapeHtml(r[c.key])}</td>`).join('')}</tr>`).join('')
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: "IBM Plex Sans Thai", "Noto Sans Thai", sans-serif; font-size: 12px; color: #1A202C; margin: 24px; }
    h1 { font-size: 18px; color: #1B3A6B; margin: 0 0 16px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #DDE3ED; padding: 6px 8px; text-align: left; }
    th { background: #1B3A6B; color: #fff; }
    tr:nth-child(even) td { background: #F7FAFC; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <table>
    <thead><tr>${th}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</body>
</html>`
}

export function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function printTableHtml(html) {
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) {
    downloadBlob(html, 'export.html', 'text/html;charset=utf-8')
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
  win.onload = () => {
    win.print()
  }
}

export function exportTable(format, { columns, rows, filename, title }) {
  const cols = (columns || []).map(c => ({ key: c.key, label: c.label }))
  const data = rows || []
  const name = filename || 'export'
  const heading = title || name

  if (format === 'excel') {
    downloadBlob(rowsToExcelXml(cols, data), `${name}.xls`, 'application/vnd.ms-excel')
    return
  }
  if (format === 'xml') {
    downloadBlob(rowsToXml(cols, data), `${name}.xml`, 'application/xml;charset=utf-8')
    return
  }
  if (format === 'pdf') {
    printTableHtml(rowsToPrintHtml(cols, data, heading))
    return
  }
  downloadBlob(rowsToCsv(cols, data), `${name}.csv`, 'text/csv;charset=utf-8;')
}
