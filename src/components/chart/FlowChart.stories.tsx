import React, { useCallback, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { mapValues } from 'lodash';
import {
  actions,
  FlowChart,
  INodeDefaultProps
} from '@mrblenny/react-flow-chart';

import { chart as mockChart } from '../../mocks/chart';
import { nodeCustomFactory } from './NodeCustom';
import { nodeInnerCustomFactory } from './NodeInnerCustom';
import { PortCustom } from './PortCustom';
import { LinkCustom } from './LinkCustom';
import {
  getVariableColor,
  IChart,
  IChartParam,
  validateLink
} from '../../utils/chart';
import { NodeIODialog, NodeIODirection } from './NodeIODialog';
import { VariableType } from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';

function FlowChartStory() {
  const [chart, setChart] = useState<IChart | null>(mockChart);
  const [selectedNodeIO, setSelectedNodeIO] = useState<{
    nodeId: string;
    direction: NodeIODirection;
  } | null>(null);
  const setSelectedChartParam = (chartParam: IChartParam) => {};
  const Node = useMemo(
    () =>
      nodeCustomFactory((nodeId, direction) =>
        setSelectedNodeIO({ nodeId, direction })
      ),
    []
  );
  const chartStateActions = mapValues(
    actions,
    (func: any) =>
      (...args: any) => {
        const newChartTransformer = func(...args);
        const newChart = newChartTransformer(chart);
        setChart(chart => ({ ...chart, ...newChart }));
      }
  ) as typeof actions;
  const saveNodeIO = useCallback(
    (name: string, type: VariableType) => {
      if (selectedNodeIO === null) {
        return;
      }
      setChart(currentChart => {
        if (currentChart === null) {
          return currentChart;
        }
        const node = currentChart.nodes[selectedNodeIO.nodeId];
        if (node === undefined) {
          return currentChart;
        }
        const variable = { name, type };
        return {
          ...currentChart,
          nodes: {
            ...currentChart.nodes,
            [node.id]: {
              ...node,
              properties: {
                ...node.properties,
                cell: {
                  ...node.properties.cell,
                  inputs:
                    selectedNodeIO.direction === 'input'
                      ? [...node.properties.cell.inputs, variable]
                      : node.properties.cell.inputs,
                  outputs:
                    selectedNodeIO.direction === 'output'
                      ? [...node.properties.cell.outputs, variable]
                      : node.properties.cell.outputs
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
                    parentNodeIsDraft: node.properties.cell.is_draft === true
                  }
                }
              }
            }
          }
        };
      });
      setSelectedNodeIO(null);
    },
    [selectedNodeIO]
  );
  const selectedNode = selectedNodeIO
    ? chart?.nodes[selectedNodeIO.nodeId]
    : undefined;
  return (
    <>
      <FlowChart
        chart={chart ?? mockChart}
        callbacks={chartStateActions}
        config={{
          readonly: false,
          validateLink: validateLink
        }}
        Components={{
          Node: Node as React.FunctionComponent<INodeDefaultProps>,
          NodeInner: nodeInnerCustomFactory(chart, setSelectedChartParam),
          Port: PortCustom,
          Link: LinkCustom
        }}
      />
      <NodeIODialog
        open={selectedNodeIO !== null}
        direction={selectedNodeIO?.direction ?? null}
        existingNames={Object.keys(selectedNode?.ports ?? {})}
        onClose={() => setSelectedNodeIO(null)}
        onSave={saveNodeIO}
      />
    </>
  );
}

const meta = {
  component: FlowChartStory
} satisfies Meta<typeof FlowChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
