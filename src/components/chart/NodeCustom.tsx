import React, { CSSProperties, ForwardedRef } from 'react';
import styled from 'styled-components';
import { INodeDefaultProps } from '@mrblenny/react-flow-chart';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { ICell } from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import { TooltipOverflowLabel } from '../common/TooltipOverflowLabel';
import { INode } from '../../utils/chart';
import { NodeIODirection } from './NodeIODialog';
import { ButtonAddIO } from './ButtonAddIO';
import { ModifyTitle } from './modifyTitle';

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
  backgroundColor,
  nodeId,
  onModifyTitle
}: {
  cell: ICell;
  isSpecialNode: boolean;
  backgroundColor: CSSProperties['color'];
  nodeId: string;
  onModifyTitle: (nodeId: string) => void;
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
        {cell.is_draft && <ModifyTitle onClick={() => onModifyTitle(nodeId)} />}
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
  {
    node.properties.cell.is_draft && (additionalHeight = 2);
  }
  const heightPx = (maxPortsCount + additionalHeight) * portHeightPx;
  return `${heightPx}px`;
}

function getBottomPortPosition(node: INode, side: 'left' | 'right') {
  return Object.values(node.ports)
    .filter(port => port.type === side && port.position !== undefined)
    .sort((a, b) => (b.position?.y ?? 0) - (a.position?.y ?? 0))[0]?.position;
}

export function nodeCustomFactory(
  onAddIO: (nodeId: string, direction: NodeIODirection) => void,
  onModifyTitle: (nodeId: string) => void
) {
  return React.forwardRef(
    (
      { node, children, ...otherProps }: INodeDefaultProps & { node: INode },
      ref: ForwardedRef<HTMLDivElement>
    ) => {
      const isSpecialNode = node.type !== 'workflow-cell';
      const width = isSpecialNode ? '200px' : '250px';
      const height = getNodeHeight(node);
      const yStandard = 5;
      const leftPortY = getBottomPortPosition(node, 'left')?.y;
      const insertInputButtonY =
        leftPortY === undefined ? yStandard : leftPortY + yStandard;
      const rightPortY = getBottomPortPosition(node, 'right')?.y;
      const insertOutputButtonY =
        rightPortY === undefined ? yStandard : rightPortY + yStandard;
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
            nodeId={node.id}
            onModifyTitle={onModifyTitle}
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
                  top: insertInputButtonY
                }}
                onClick={() => onAddIO(node.id, 'input')}
              />
              <ButtonAddIO
                ariaLabel="Add output"
                title="Add output"
                style={{
                  right: xCorrection,
                  top: insertOutputButtonY
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
