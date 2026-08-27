import React, { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { ITable, parseCsv, toNumber } from './csv';

function jsonToTable(json: unknown): ITable | null {
  if (!Array.isArray(json) || json.length === 0) {
    return null;
  }
  const columns: string[] = [];
  for (const row of json) {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      for (const k of Object.keys(row)) {
        if (!columns.includes(k)) {
          columns.push(k);
        }
      }
    }
  }
  if (columns.length === 0) {
    return null;
  }
  const rows = json.map(row => {
    const r = (row ?? {}) as Record<string, unknown>;
    return columns.map(c =>
      r[c] === undefined || r[c] === null ? '' : String(r[c])
    );
  });
  return { columns, rows };
}

function buildTable(text: string, encodingFormat?: string): ITable | null {
  const isJson =
    encodingFormat?.includes('json') || text.trimStart().startsWith('[');
  if (isJson) {
    try {
      const t = jsonToTable(JSON.parse(text));
      if (t) {
        return t;
      }
    } catch {
      // fall through to CSV
    }
  }
  const csv = parseCsv(text);
  return csv.columns.length > 0 ? csv : null;
}

export function TableRenderer({
  text,
  encodingFormat
}: {
  text: string;
  encodingFormat?: string;
}) {
  const table = useMemo(
    () => buildTable(text, encodingFormat),
    [text, encodingFormat]
  );

  const { columns, rows } = useMemo(() => {
    if (!table) {
      return {
        columns: [] as GridColDef[],
        rows: [] as Record<string, unknown>[]
      };
    }
    const allNumeric = table.columns.map((_, ci) =>
      table.rows.every(r => r[ci] === '' || toNumber(r[ci] ?? '') !== null)
    );
    const columns: GridColDef[] = table.columns.map((col, ci) => ({
      field: `c${ci}`,
      headerName: col,
      flex: 1,
      minWidth: 120,
      type: allNumeric[ci] ? 'number' : 'string',
      valueGetter: value =>
        allNumeric[ci] && value !== '' ? toNumber(value as string) : value
    }));
    const rows = table.rows.map((r, ri) => {
      const row: Record<string, unknown> = { id: ri };
      table.columns.forEach((_, ci) => {
        row[`c${ci}`] = r[ci] ?? '';
      });
      return row;
    });
    return { columns, rows };
  }, [table]);

  if (!table) {
    return <Alert severity="warning">Could not read tabular data.</Alert>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        density="compact"
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25, page: 0 } }
        }}
        autoHeight
        sx={{
          '& .MuiDataGrid-cell': { fontSize: '0.8125rem' }
        }}
      />
    </Box>
  );
}
