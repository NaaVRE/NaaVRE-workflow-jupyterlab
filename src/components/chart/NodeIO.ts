import { VariableType } from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import { getVariableColor, IChart } from '../../utils/chart';
import { NodeIODirection } from './NodeIODialog';

export interface ISelectedNodeIO {
  nodeId: string;
  direction: NodeIODirection;
}

export function saveNodeIO(
  chart: IChart | null,
  selectedNodeIO: ISelectedNodeIO,
  name: string,
  type: VariableType
): IChart | null {
  if (chart === null) {
    return chart;
  }

  const node = chart.nodes[selectedNodeIO.nodeId];
  if (node === undefined) {
    console.error(
      `Cannot add variable to missing node: ${selectedNodeIO.nodeId}`
    );
    return chart;
  }
  if (name in node.ports) {
    console.error(`Cannot add duplicate variable name: ${name}`);
    return chart;
  }

  const cell = node.properties.cell;
  const variable = { name, type };
  const updatedNode = {
    ...node,
    properties: {
      ...node.properties,
      cell: {
        ...cell,
        inputs:
          selectedNodeIO.direction === 'input'
            ? [...cell.inputs, variable]
            : cell.inputs,
        outputs:
          selectedNodeIO.direction === 'output'
            ? [...cell.outputs, variable]
            : cell.outputs
      }
    },
    ports: {
      ...node.ports,
      [name]: {
        id: name,
        type: selectedNodeIO.direction === 'input' ? 'left' : 'right',
        properties: {
          color: getVariableColor(name),
          parentNodeType: node.type,
          parentNodeIsDraft: cell.is_draft === true
        }
      }
    }
  };
  return {
    ...chart,
    nodes: {
      ...chart.nodes,
      [node.id]: updatedNode
    }
  };
}
