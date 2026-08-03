import React, { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';

import { ITable, parseCsv, toNumber } from './csv';

interface ISeriesModel {
  name: string;
  values: (number | null)[];
}

interface IPlotModel {
  xLabel: string;
  xIsNumeric: boolean;
  xValues: (number | string)[];
  series: ISeriesModel[];
}

function defaultAxes(table: ITable): { x: string; y: string[] } {
  const x = table.columns[0];
  return { x, y: table.columns.filter(c => c !== x) };
}

function buildModel(
  table: ITable,
  xName: string,
  yNames: string[]
): IPlotModel | { error: string } {
  if (table.columns.length < 2) {
    return { error: 'Need at least two columns to plot.' };
  }

  const xIdx = table.columns.indexOf(xName);
  if (xIdx === -1) {
    return { error: `x column "${xName}" not found.` };
  }
  if (yNames.length === 0) {
    return { error: 'Select at least one y column.' };
  }

  const xIsNumeric = table.rows.every(r => toNumber(r[xIdx] ?? '') !== null);
  const xValues: (number | string)[] = table.rows.map(r =>
    xIsNumeric ? (toNumber(r[xIdx] ?? '') as number) : (r[xIdx] ?? '')
  );

  // Columns the user selected but that hold no numbers at all are dropped
  // rather than plotted as an empty line.
  const series: ISeriesModel[] = [];
  for (const yName of yNames) {
    const yIdx = table.columns.indexOf(yName);
    if (yIdx === -1) {
      continue;
    }
    const values = table.rows.map(r => toNumber(r[yIdx] ?? ''));
    if (values.some(v => v !== null)) {
      series.push({ name: yName, values });
    }
  }

  if (series.length === 0) {
    return { error: 'No numeric data to plot.' };
  }
  return { xLabel: xName, xIsNumeric, xValues, series };
}

export function XyPlotRenderer({ text }: { text: string }) {
  const table = useMemo(() => parseCsv(text), [text]);
  const defaults = useMemo(() => defaultAxes(table), [table]);

  const [selectedX, setSelectedX] = useState(defaults.x);
  const [selectedY, setSelectedY] = useState(defaults.y);

  useEffect(() => {
    setSelectedX(defaults.x);
    setSelectedY(defaults.y);
  }, [defaults]);

  const yOptions = table.columns.filter(c => c !== selectedX);

  const handleXChange = (event: SelectChangeEvent) => {
    const x = event.target.value;
    setSelectedX(x);
    setSelectedY(y => (y.includes(x) ? y.filter(c => c !== x) : y));
  };

  const handleYChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setSelectedY(typeof value === 'string' ? value.split(',') : value);
  };

  const model = useMemo(
    () => buildModel(table, selectedX, selectedY),
    [table, selectedX, selectedY]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="xyplot-x-label">X axis</InputLabel>
          <Select
            labelId="xyplot-x-label"
            label="X axis"
            value={selectedX}
            onChange={handleXChange}
          >
            {table.columns.map(col => (
              <MenuItem key={col} value={col}>
                {col}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="xyplot-y-label">Y axis</InputLabel>
          <Select
            labelId="xyplot-y-label"
            label="Y axis"
            multiple
            value={selectedY}
            onChange={handleYChange}
          >
            {yOptions.map(col => (
              <MenuItem key={col} value={col}>
                {col}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {'error' in model ? (
        <Alert severity="warning">{model.error}</Alert>
      ) : (
        <XyPlotChart model={model} />
      )}
    </Box>
  );
}

function XyPlotChart({ model }: { model: IPlotModel }) {
  const dataset = model.xValues.map((x, i) => {
    const row: Record<string, number | string | null> = { __x: x };
    model.series.forEach(s => {
      row[s.name] = s.values[i];
    });
    return row;
  });

  return (
    <Box sx={{ width: '100%' }}>
      <LineChart
        dataset={dataset}
        xAxis={[
          {
            dataKey: '__x',
            label: model.xLabel,
            scaleType: model.xIsNumeric ? 'linear' : 'point'
          }
        ]}
        series={model.series.map(s => ({
          dataKey: s.name,
          label: s.name,
          showMark: dataset.length <= 60,
          connectNulls: false,
          curve: 'linear'
        }))}
        height={340}
        grid={{ horizontal: true }}
        hideLegend={model.series.length <= 1}
        margin={{ left: 64, right: 16, top: 16, bottom: 48 }}
        slotProps={{ legend: { toggleVisibilityOnClick: true } }}
      />
    </Box>
  );
}
