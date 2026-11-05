import React, { ForwardedRef } from 'react';
import styled from 'styled-components';
import { INodeDefaultProps } from '@mrblenny/react-flow-chart';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';

import { ICell } from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import { INode } from '../../utils/chart';
import { TooltipOverflowLabel } from '../common/TooltipOverflowLabel';
import { ButtonAddIO } from './ButtonAddIO';
import { NodeIODirection } from './NodeIODialog';
import { NodeCustom } from './NodeCustom';
import { EditTitle } from './EditTitle';

const DraftNodeContainer = styled.div<{ width: string; height: string }>`
  position: absolute;
  background: white;
  width: ${props => props.width};
  height: ${props => props.height};
  min-height: 60px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border: 1px dashed darkgray;
  border-top-width: 0;
  box-shadow: rgba(0, 0, 0, 0.1) 0 7px 10px 0;
`;

function DraftNodeTitle({
  cell,
  onEditTitle
}: {
  cell: ICell;
  onEditTitle: () => void;
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
        border: '1px dashed darkgray',
        borderBottomWidth: 0,
        backgroundColor: 'rgb(240,240,240)',
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
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          draft
        </Typography>
        <EditTitle onClick={onEditTitle} />
      </Stack>
    </div>
  );
}

function getNodeHeight(node: INode) {
  const maxPortsCount = Math.max(
    Object.values(node.ports).filter(port => port.type === 'left').length,
    Object.values(node.ports).filter(port => port.type === 'right').length
  );
  const portHeightPx = 26;
  return `${(maxPortsCount + 2) * portHeightPx}px`;
}

function getBottomPortPosition(node: INode, side: 'left' | 'right') {
  return Object.values(node.ports)
    .filter(port => port.type === side && port.position !== undefined)
    .sort((a, b) => (b.position?.y ?? 0) - (a.position?.y ?? 0))[0]?.position;
}

export const DraftNode = React.forwardRef(
  (
    {
      node,
      children,
      onAddIO,
      onEditTitle,
      ...otherProps
    }: INodeDefaultProps & {
      node: INode;
      onAddIO: (nodeId: string, direction: NodeIODirection) => void;
      onEditTitle: (nodeId: string) => void;
    },
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    if (node.properties.cell.is_draft !== true) {
      return (
        <NodeCustom node={node} ref={ref} {...otherProps}>
          {children}
        </NodeCustom>
      );
    }

    const insertInputButtonY =
      (getBottomPortPosition(node, 'left')?.y ?? 0) + 5;
    const insertOutputButtonY =
      (getBottomPortPosition(node, 'right')?.y ?? 0) + 5;
    const width = node.type !== 'workflow-cell' ? '200px' : '250px';

    return (
      <DraftNodeContainer
        width={width}
        height={getNodeHeight(node)}
        ref={ref}
        {...otherProps}
      >
        <DraftNodeTitle
          cell={node.properties.cell}
          onEditTitle={() => onEditTitle(node.id)}
        />
        <ButtonAddIO
          ariaLabel="Add input"
          title="Add input"
          style={{ left: '5%', top: insertInputButtonY }}
          onClick={() => onAddIO(node.id, 'input')}
        />
        <ButtonAddIO
          ariaLabel="Add output"
          title="Add output"
          style={{ right: '5%', top: insertOutputButtonY }}
          onClick={() => onAddIO(node.id, 'output')}
        />
        {children}
      </DraftNodeContainer>
    );
  }
);

export function nodeCustomFactory(
  onAddIO: (nodeId: string, direction: NodeIODirection) => void,
  onEditTitle: (nodeId: string) => void
) {
  return React.forwardRef(
    (
      { node, children, ...otherProps }: INodeDefaultProps & { node: INode },
      ref: ForwardedRef<HTMLDivElement>
    ) => (
      <DraftNode
        node={node}
        onAddIO={onAddIO}
        onEditTitle={onEditTitle}
        ref={ref}
        {...otherProps}
      >
        {children}
      </DraftNode>
    )
  );
}
