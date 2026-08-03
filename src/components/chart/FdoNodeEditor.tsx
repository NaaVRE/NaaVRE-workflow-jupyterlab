import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import { IChart, INode } from '../../utils/chart';
import {
  DEFAULT_FDO_CONFIG,
  FDO_VIZ_KINDS,
  FdoVizKind,
  IFdoConfig
} from '../../utils/specialCells';

export function FdoNodeEditor({
  node,
  chart,
  setChart
}: {
  node: INode;
  chart: IChart;
  setChart: (chart: IChart) => void;
}) {
  const config: IFdoConfig = node.properties.fdoConfig ?? DEFAULT_FDO_CONFIG;

  function update(patch: Partial<IFdoConfig>) {
    setChart({
      ...chart,
      nodes: {
        ...chart.nodes,
        [node.id]: {
          ...node,
          properties: {
            ...node.properties,
            fdoConfig: { ...config, ...patch }
          }
        }
      }
    });
  }

  return (
    <div
      style={{
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <FormControl fullWidth size="small">
        <InputLabel>Viz kind</InputLabel>
        <Select
          label="Viz kind"
          value={config.vizKind}
          onChange={e => update({ vizKind: e.target.value as FdoVizKind })}
        >
          {FDO_VIZ_KINDS.map(k => (
            <MenuItem key={k} value={k}>
              {k}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        size="small"
        label="Output file name"
        value={config.outputName}
        onChange={e => update({ outputName: e.target.value })}
        helperText="File name written to cloud storage (e.g. results.csv)"
      />
      <TextField
        size="small"
        label="Data format (MIME type)"
        value={config.dataFormat}
        onChange={e => update({ dataFormat: e.target.value })}
        helperText="e.g. text/csv, application/geo+json, image/png, text/html"
      />
    </div>
  );
}
