import React, { CSSProperties, ForwardedRef } from 'react';
import styled from 'styled-components';
import { INodeDefaultProps } from '@mrblenny/react-flow-chart';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { ICell } from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import { TooltipOverflowLabel } from '../common/TooltipOverflowLabel';
import { INode } from '../../utils/chart';
import { NodeIODirection } from './NodeIODialog';

const NodeContainer = styled.div<{
  width?: string;
  height?: string;
  isDraft?: boolean;
}>`
  position: absolute;
  background: white;
  width: ${props => props.width || '250px'};
  height: ${props => props.height || '150px'};
  min-height: 60px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border: ${props =>
    props.isDraft ? '1px dashed darkgray' : '1px solid lightgray'};
  border-top-width: 0;
  box-shadow: rgba(0, 0, 0, 0.1) 0 7px 10px 0;
`;

function NodeTitle({
  cell,
  isSpecialNode,
  backgroundColor
}: {
  cell: ICell;
  isSpecialNode: boolean;
  backgroundColor: CSSProperties['color'];
}) {
  const regex = new RegExp(`-${cell.owner}$`);
  const title = cell.title.replace(regex, '');

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '-1px',
        width: '100%',
        borderTopLeftRadius: '5px',
        borderTopRightRadius: '5px',
        border: cell.is_draft ? '1px dashed darkgray' : '1px solid lightgray',
        borderBottomWidth: 0,
        backgroundColor: backgroundColor,
        display: 'flex',
        justifyContent: 'space-between'
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          padding: '10px',
          width: 'calc(100% - 60px + 8px)',
          alignItems: 'center',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing'
          }
        }}
      >
        <TooltipOverflowLabel variant="subtitle2" label={title} />
        {cell.is_draft && (
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            draft
          </Typography>
        )}
        {isSpecialNode || (
          <Typography variant="body2">v{cell.version}</Typography>
        )}
      </Stack>
      <IconButton
        aria-label="Info"
        style={{ borderRadius: '100%' }}
        sx={{ width: '40px', marginLeft: '-8px' }}
      >
        <InfoOutlinedIcon />
      </IconButton>
    </div>
  );
}

function getNodeHeight(node: INode) {
  const maxPortsCount = Math.max(
    Object.values(node.ports).filter(p => p.type === 'left').length,
    Object.values(node.ports).filter(p => p.type === 'right').length
  );
  const portHeightPx = 26;
  let additionalHeight = 0;
  {node.properties.cell.is_draft && (additionalHeight = 2)}
  const heightPx = (maxPortsCount + additionalHeight) * portHeightPx;
  return `${heightPx}px`;
}

function getBottomPortPosition(node: INode, side: 'left' | 'right') {
  return Object.values(node.ports)
    .filter(port => port.type === side && port.position !== undefined)
    .sort((a, b) => (b.position?.y ?? 0) - (a.position?.y ?? 0))[0]
    ?.position;
}

function ButtonAddIO({
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

export function nodeCustomFactory(
  onAddIO: (nodeId: string, direction: NodeIODirection) => void
) {
  return React.forwardRef(
    (
      { node, children, ...otherProps }: INodeDefaultProps & { node: INode },
      ref: ForwardedRef<HTMLDivElement>
    ) => {
      const isSpecialNode = node.type !== 'workflow-cell';
      const width = isSpecialNode ? '200px' : '250px';
      const height = getNodeHeight(node);

      const bottomLeftPortPosition = getBottomPortPosition(node, 'left');
      const bottomRightPortPosition = getBottomPortPosition(node, 'right');
      const yCorrection = 5;
      let addInputButtonY = yCorrection;
      let addOutputButtonY = yCorrection;
      if (node.properties.cell.is_draft && bottomLeftPortPosition) {
          addInputButtonY = bottomLeftPortPosition.y + yCorrection
          }
      if (node.properties.cell.is_draft && bottomRightPortPosition) {
          addOutputButtonY = bottomRightPortPosition.y + yCorrection;
          }
      const xCorrection = '5%';

      return (
        <NodeContainer
          width={width}
          height={height}
          isDraft={node.properties.cell.is_draft}
          ref={ref}
          {...otherProps}
        >
          <NodeTitle
            cell={node.properties.cell}
            isSpecialNode={isSpecialNode}
            backgroundColor={
              isSpecialNode
                ? 'rgb(195, 235, 202)'
                : node.properties.cell.is_draft
                  ? 'rgb(240,240,240)'
                  : 'rgb(229,252,233)'
            }
          />
          {node.properties.cell.is_draft && (
            <>
                <ButtonAddIO
                  ariaLabel="Add input"
                  title="Add input"
                  style={{
                    left: xCorrection,
                    top: addInputButtonY
                  }}
                  onClick={() => onAddIO(node.id, 'input')}
                />
                <ButtonAddIO
                  ariaLabel="Add output"
                  title="Add output"
                  style={{
                    right: xCorrection,
                    top: addOutputButtonY
                  }}
                  onClick={() => onAddIO(node.id, 'output')}
                />
            </>
          )}
          {children}
        </NodeContainer>
      );
    }
  );
}
