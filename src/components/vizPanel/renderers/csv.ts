export interface ITable {
  columns: string[];
  rows: string[][];
}

export function parseCsv(text: string): ITable {
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    record.push(field);
    field = '';
  };
  const pushRecord = () => {
    pushField();
    records.push(record);
    record = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      pushField();
    } else if (c === '\n') {
      pushRecord();
    } else if (c === '\r') {
      // Dropping bare CR makes CRLF files parse like LF ones.
    } else {
      field += c;
    }
  }
  if (field !== '' || record.length > 0) {
    pushRecord();
  }

  if (records.length === 0) {
    return { columns: [], rows: [] };
  }
  const [header, ...rows] = records;
  return { columns: header, rows };
}

export function toNumber(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
