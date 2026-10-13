import React, { CSSProperties } from 'react';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export function ButtonAddIO({
  ariaLabel,
  title,
  style,
  onClick
}: {
  ariaLabel: string;
  title: string;
  style: Pick<CSSProperties, 'left' | 'top' | 'right'>;
  onClick: () => void;
}) {
  return (
    <Tooltip title={title}>
      <span
        style={{
          position: 'absolute',
          display: 'inline-flex',
          ...style
        }}
      >
        <IconButton
          aria-label={ariaLabel}
          size="small"
          onClick={event => {
            event.stopPropagation();
            onClick();
          }}
          onMouseDown={event => event.stopPropagation()}
          onMouseUp={event => event.stopPropagation()}
        >
          <AddIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
}
