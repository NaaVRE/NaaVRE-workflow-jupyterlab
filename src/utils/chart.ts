import ColorHash from 'color-hash';
import sortKeysRecursive from 'sort-keys-recursive';
import { IChart, INode } from '@mrblenny/react-flow-chart';
import { sha1 } from 'js-sha1';

import { NaaVRECatalogue } from '../naavre-common/types';

export const defaultChart: IChart = {
  offset: {
    x: 0,
    y: 0
  },
  scale: 1,
  nodes: {},
  links: {},
  selected: {},
  hovered: {}
};

function cellIdentityHash(cell: NaaVRECatalogue.WorkflowCells.ICell): string {
  const cell_identity_dict = {
    title: cell.title,
    params: cell.params.map(v => v.name),
    secrets: cell.secrets.map(v => v.name),
    inputs: cell.inputs.map(v => v.name),
    outputs: cell.outputs.map(v => v.name)
  };
  return sha1(JSON.stringify(sortKeysRecursive(cell_identity_dict)));
}

export function cellToChartNode(
  cell: NaaVRECatalogue.WorkflowCells.ICell
): INode {
  const colorHash = new ColorHash();
  return {
    id: cellIdentityHash(cell).substring(0, 7),
    type: 'input-output',
    position: { x: 35, y: 15 },
    properties: {
      cell: cell,
      title: cell.title,
      params: cell.params.map(v => v.name),
      secrets: cell.secrets.map(v => v.name),
      inputs: cell.inputs.map(v => v.name),
      outputs: cell.outputs.map(v => v.name),
      vars: [
        ...cell.inputs.map(v => {
          return {
            name: v.name,
            direction: 'input',
            type: 'datatype',
            color: colorHash.hex(v.name)
          };
        }),
        ...cell.outputs.map(v => {
          return {
            name: v.name,
            direction: 'output',
            type: 'datatype',
            color: colorHash.hex(v.name)
          };
        })
      ]
    },
    ports: Object.fromEntries([
      ...cell.inputs.map(v => {
        return [
          v.name,
          {
            id: v.name,
            type: 'left',
            properties: {
              color: colorHash.hex(v.name)
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
              color: colorHash.hex(v.name)
            }
          }
        ];
      })
    ])
  };
}

export function cellsToChartNode(
  cells: Array<NaaVRECatalogue.WorkflowCells.ICell>
): IChart {
  return {
    offset: {
      x: 0,
      y: 0
    },
    scale: 1,
    nodes: Object.fromEntries(
      cells.map(cell => {
        const node = cellToChartNode(cell);
        return [node.id, node];
      })
    ),
    links: {},
    selected: {},
    hovered: {}
  };
}
