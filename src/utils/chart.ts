import ColorHash from 'color-hash';
import {
  IChart as IChartRFC,
  INode as INodeRFC,
  IOnLinkCompleteInput
} from '@mrblenny/react-flow-chart';

import { ICell } from '../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import { ISpecialCell } from './specialCells';

export interface INodeProps {
  cell: ICell;
}

export interface IChartProps {}

export interface INode extends INodeRFC<INodeProps> {}
export interface IChart extends IChartRFC<IChartProps, INodeProps> {}

export const defaultChart: IChart = {
  offset: {
    x: 0,
    y: 0
  },
  scale: 1,
  nodes: {},
  links: {},
  properties: {},
  selected: {},
  hovered: {}
};

export function getVariableColor(name: string) {
  const colorHash = new ColorHash();
  return colorHash.hex(name);
}

export function cellToChartNode(cell: ICell | ISpecialCell): INode {
  const type = 'type' in cell ? cell.type : 'workflow-cell';

  return {
    id: cell.url,
    type: type,
    position: { x: 35, y: 15 },
    properties: {
      cell: cell
    },
    ports: Object.fromEntries([
      ...cell.inputs.map(v => {
        return [
          v.name,
          {
            id: v.name,
            type: 'left',
            properties: {
              color: getVariableColor(v.name),
              parentNodeType: type
            }
          }
        ];
      }),
      ...cell.outputs.map(v => {
        return [
          v.name,
          {
            id: v.name,
            type: 'right',
            properties: {
              color: getVariableColor(v.name),
              parentNodeType: type
            }
          }
        ];
      })
    ])
  };
}

export function validateLink(props: IOnLinkCompleteInput): boolean {
  const { fromNodeId, toNodeId } = props;
  // no links between same node
  if (fromNodeId === toNodeId) {
    return false;
  }
  return true;
}
