import * as React from 'react';
import { createRef } from 'react';
import { mapValues } from 'lodash';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import * as actions from '@mrblenny/react-flow-chart/src/container/actions';
import {
  FlowChart,
  IConfig,
  INodeDefaultProps
} from '@mrblenny/react-flow-chart';

import {
  ICell,
  VariableType
} from '../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import {
  getVariableColor,
  IChart,
  IChartParam,
  validateLink
} from '../utils/chart';
import { theme } from '../Theme';
import { SettingsContext } from '../settings';
import { nodeCustomFactory } from './chart/NodeCustom';
import { nodeInnerCustomFactory } from './chart/NodeInnerCustom';
import { PortCustom } from './chart/PortCustom';
import { LinkCustom } from './chart/LinkCustom';
import { ChartElementEditor } from './chart/ChartElementEditor';
import {
  WorkflowAction,
  WorkflowActionDialog
} from './workflowActionDialog/WorkflowActionDialog';
import { CellsSideBar } from './cells/CellsSideBar';
import { CellPopup } from './cells/CellPopup';
import { NodeParamValueDialog } from './chart/NodeParamValue';
import { NodeIODialog, NodeIODirection } from './chart/NodeIODialog';

interface ISelectedNodeIO {
  nodeId: string;
  direction: NodeIODirection;
}

export interface IProps {}

interface IWorkflowActionDialogState {
  open: boolean;
  action: WorkflowAction;
}

export interface IState {
  chart: IChart | null;
  selectedCellInList: ICell | null;
  selectedCellNode: HTMLDivElement | null;
  selectedChartParam: IChartParam | null;
  selectedNodeIO: ISelectedNodeIO | null;
  workflowActionDialog: IWorkflowActionDialogState;
}

export const DefaultState: IState = {
  chart: null,
  selectedCellInList: null,
  selectedCellNode: null,
  selectedChartParam: null,
  selectedNodeIO: null,
  workflowActionDialog: {
    open: false,
    action: 'run'
  }
};

export class Composer extends React.Component<IProps, IState> {
  state = DefaultState;
  containerRef: React.RefObject<HTMLDivElement>;
  NodeCustom: ReturnType<typeof nodeCustomFactory>;
  static contextType = SettingsContext;
  declare context: React.ContextType<typeof SettingsContext>;

  constructor(props: IProps) {
    super(props);
    this.containerRef = createRef();
    this.NodeCustom = nodeCustomFactory(this.setSelectedNodeIO);
  }

  chartStateActions = mapValues(
    actions,
    (func: any, actionKey) =>
      (...args: any) => {
        const newChartTransformer = func(...args);
        const newChart: IChart = newChartTransformer(this.state.chart);
        switch (actionKey) {
          case 'onDeleteKey': {
            // Remove params that reference removed nodes
            newChart.properties.params = newChart.properties.params.filter(
              param => param.node_id in newChart.nodes
            );
          }
        }
        this.setState({
          chart: { ...this.state.chart, ...newChart }
        });
      }
  ) as typeof actions;

  chartConfig: IConfig = {
    // This is needed because onDeleteKey assumes config.readonly is defined...
    // https://github.com/MrBlenny/react-flow-chart/blob/0.0.14/src/container/actions.ts#L182
    readonly: false,
    validateLink: validateLink
  };

  setSelectedCell = (cell: ICell | null, cellNode: HTMLDivElement | null) => {
    this.setState({
      selectedCellInList: cell,
      selectedCellNode: cellNode
    });
  };

  setChart = (nextChart: IChart | ((prev: IChart | null) => IChart | null)) => {
    if (typeof nextChart === 'function') {
      this.setState(prevState => ({ chart: nextChart(prevState.chart) }));
    } else {
      this.setState({ chart: nextChart });
    }
  };

  setSelectedChartParam = (selectedChartParam: IChartParam | null) => {
    this.setState({
      selectedChartParam: selectedChartParam
    });
  };

  setSelectedNodeIO = (nodeId: string, direction: NodeIODirection) => {
    this.setState({ selectedNodeIO: { nodeId, direction } });
  };

  saveNodeIO = (name: string, type: VariableType) => {
    const selectedNodeIO = this.state.selectedNodeIO;
    if (selectedNodeIO === null) {
      return;
    }

    this.setChart(chart => {
      if (chart === null) {
        return chart;
      }

      const node = chart.nodes[selectedNodeIO.nodeId];
      if (node === undefined) {
        console.error(`Cannot add variable to missing node: ${selectedNodeIO.nodeId}`);
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
    });
    this.setState({ selectedNodeIO: null });
  };

  setWorkflowActionDialog = (
    workflowActionDialog: IWorkflowActionDialogState
  ) => {
    this.setState({ workflowActionDialog: workflowActionDialog });
  };

  componentDidUpdate() {
    // TODO: Implement chart sanity checks
  }

  render(): React.ReactElement {
    if (this.state.chart === null) {
      return (
        <ThemeProvider theme={theme}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
          >
            <CircularProgress />
          </Box>
        </ThemeProvider>
      );
    } else {
      return (
        <ThemeProvider theme={theme}>
          <div
            ref={this.containerRef}
            style={{
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              maxWidth: '100vw',
              maxHeight: '100vh'
            }}
          >
            <WorkflowActionDialog
              open={this.state.workflowActionDialog.open}
              onClose={() =>
                this.setWorkflowActionDialog({
                  ...this.state.workflowActionDialog,
                  open: false
                })
              }
              action={this.state.workflowActionDialog.action}
              chart={this.state.chart}
              container={this.containerRef.current}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1',
                overflow: 'hidden'
              }}
            >
              <FlowChart
                chart={this.state.chart}
                callbacks={this.chartStateActions}
                config={this.chartConfig}
                Components={{
                  Node: this.NodeCustom as React.FunctionComponent<INodeDefaultProps>,
                  NodeInner: nodeInnerCustomFactory(
                    this.state.chart,
                    this.setSelectedChartParam
                  ),
                  Port: PortCustom,
                  Link: LinkCustom
                }}
              />
              {this.state.chart.selected.id && (
                <ChartElementEditor
                  chart={this.state.chart}
                  setChart={this.setChart}
                  callbacks={this.chartStateActions}
                  config={this.chartConfig}
                />
              )}
              <NodeParamValueDialog
                chart={this.state.chart}
                setChart={this.setChart}
                chartParam={this.state.selectedChartParam}
                setSelectedChartParam={this.setSelectedChartParam}
              />
              <NodeIODialog
                open={this.state.selectedNodeIO !== null}
                direction={this.state.selectedNodeIO?.direction ?? null}
                existingNames={
                  this.state.selectedNodeIO
                    ? Object.keys(
                        this.state.chart.nodes[
                          this.state.selectedNodeIO.nodeId
                        ]?.ports ?? {}
                      )
                    : []
                }
                onClose={() => this.setState({ selectedNodeIO: null })}
                onSave={this.saveNodeIO}
              />
              {this.state.selectedCellInList && (
                <CellPopup
                  cell={this.state.selectedCellInList}
                  cellNode={this.state.selectedCellNode}
                  onClose={() => this.setSelectedCell(null, null)}
                />
              )}
              <CellsSideBar
                selectedCellInList={this.state.selectedCellInList}
                setSelectedCell={this.setSelectedCell}
              />
            </div>
          </div>
        </ThemeProvider>
      );
    }
  }
}
