/// Represents the given CSV-file text as a row-major matrix.
export function parseCSV(text: string, drop: number = 0): Array<Array<string>> {
  const rows = text.split('\n').map(row => row.split(','));
  while (drop > 0) { rows.shift(); drop -= 1; }
  return rows;
}
