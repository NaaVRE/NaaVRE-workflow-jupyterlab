import React, { useEffect, useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { Skeleton, Stack } from '@mui/material';
import { SxProps } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonIcon from '@mui/icons-material/Person';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { REACT_FLOW_CHART } from '@mrblenny/react-flow-chart';

import { ICell } from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import { ISpecialCell } from '../../utils/specialCells';
import { cellToChartNode } from '../../utils/chart';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

function TooltipOverflowLabel({ label }: { label: string}) {
  const [isOverflowed, setIsOverflow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    ref.current &&
      setIsOverflow(ref.current.scrollWidth > ref.current.clientWidth);
  }, []);

  return (
    <Tooltip
      title={label}
      disableHoverListener={!isOverflowed}
      placement="bottom"
      arrow
    >
      <span
        ref={ref}
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }}
      >
        {label}
      </span>
    </Tooltip>
  );
}

function CellTitle({
  cell,
  isSpecialNode,
  sx
}: {
  cell: ICell | ISpecialCell;
  isSpecialNode: boolean;
  sx?: SxProps;
}) {
  const regex = new RegExp(`-${cell.owner}$`);
  const title = cell.title.replace(regex, '');

  return (
    <Stack sx={sx}>
      <TooltipOverflowLabel label={title} />
      {isSpecialNode || (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'flex-end'
          }}
        >
          <LocalOfferIcon color="action" fontSize="inherit" />
          <span>v{cell.version}</span>
          {cell.owner && (
            <>
              <PersonIcon color="action" fontSize="inherit" />
              <TooltipOverflowLabel label={cell.owner} />
            </>
          )}
        </Stack>
      )}
    </Stack>
  );
}

export function CellNode({
  cell,
  selectedCellInList,
  setSelectedCell
}: {
  cell: ICell | ISpecialCell;
  selectedCellInList: ICell | null;
  setSelectedCell: (c: ICell | null, n: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const node = cellToChartNode(cell);
  const isSpecialNode = node.type !== 'workflow-cell';

  function onClick() {
    selectedCellInList === cell
      ? setSelectedCell(null, null)
      : setSelectedCell(cell, ref.current || null);
  }

  return (
    <Box
      ref={ref}
      onClick={onClick}
      draggable={true}
      onDragStart={(event: any) => {
        event.dataTransfer.setData(
          REACT_FLOW_CHART,
          JSON.stringify({
            type: node.type,
            ports: node.ports,
            properties: node.properties
          })
        );
      }}
      sx={{
        margin: '10px',
        fontSize: '14px',
        display: 'flex',
        height: '25px',
        border: '1px solid lightgray',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgb(195, 235, 202)',
        backgroundColor: isSpecialNode
          ? 'rgb(195, 235, 202)'
          : 'rgb(229,252,233)',
        borderRadius: '5px',
        padding: '10px',
        paddingRight: '1px',
        cursor: 'move'
      }}
    >
      <CellTitle
        cell={cell}
        isSpecialNode={isSpecialNode}
        sx={{ width: 'calc(100% - 40px)' }}
      />
      <IconButton
        aria-label="Info"
        style={{ borderRadius: '100%' }}
        sx={{ width: '40px' }}
      >
        <InfoOutlinedIcon />
      </IconButton>
    </Box>
  );
}

export function LoadingCellNode() {
  return (
    <Skeleton
      variant="rounded"
      style={{
        margin: '10px',
        fontSize: '14px',
        display: 'flex',
        height: '25px',
        border: '1px solid transparent',
        padding: '10px',
        borderRadius: '5px'
      }}
    />
  );
}
