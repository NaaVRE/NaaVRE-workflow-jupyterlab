import React from 'react';
import Edit from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export function ModifyTitle({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip title="Modify the title">
      <IconButton
        aria-label="Modify the title"
        size="small"
        onClick={event => {
          event.stopPropagation();
          onClick();
        }}
        onMouseDown={event => event.stopPropagation()}
        onMouseUp={event => event.stopPropagation()}
      >
        <Edit fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
