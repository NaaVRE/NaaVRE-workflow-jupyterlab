import React from 'react';
import { Paper } from '@mui/material';

import { NaaVRECatalogue } from '../../naavre-common/types';
import ICell = NaaVRECatalogue.WorkflowCells.ICell;
import { CellInfo } from '../common/CellInfo';

export function CellPopup({ cell }: { cell: ICell }) {
  return (
    <Paper
      elevation={12}
      sx={{
        position: 'absolute',
        top: 20,
        left: 'calc(20px + 250px)',
        width: 380,
        maxHeight: 'calc(100% - 40px)',
        overflowX: 'clip',
        overflowY: 'scroll'
      }}
    >
      <p className="section-header">{cell.title}</p>
      <CellInfo cell={cell} />
    </Paper>
  );
}
