import React from 'react';
import Paper from '@mui/material/Paper';
import { useClickOutside } from '@mantine/hooks';

import { CellInfo } from '../common/CellInfo';
import { ICell } from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export function CellPopup({
  cell,
  cellNode,
  onClose
}: {
  cell: ICell;
  cellNode: HTMLDivElement | null;
  onClose: () => void;
}) {
  const ref = useClickOutside(onClose, null, [cellNode]);

  return (
    <Paper
      ref={ref}
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
      <div
        className="naavre-workflow-section-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <p style={{ margin: '0' }}>{cell.title}</p>
        <IconButton
          aria-label="Close"
          style={{ color: 'white', borderRadius: '100%' }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </div>
      <CellInfo cell={cell} />
    </Paper>
  );
}
