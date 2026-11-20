import * as React from 'react';
import { createRef } from 'react';
import { mapValues } from 'lodash';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
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
import { IChart, IChartParam, validateLink } from '../utils/chart';
import { theme } from '../Theme';
import { SettingsContext } from '../settings';
import { nodeCustomFactory } from './chart/DraftNode';
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
import { NodeTitleDialog } from './chart/NodeTitleDialog';
import {
  isCellNameAvailable,
  postDraftCellToCatalogue
} from '../utils/catalog';

import { ISelectedNodeIO, saveNodeIO } from './chart/NodeIO';

interface ISelectedNodeTitle {
  nodeId: string;
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
  selectedNodeTitle: ISelectedNodeTitle | null;
  workflowActionDialog: IWorkflowActionDialogState;
  draftCellSaveError: string | null;
  catalogueRefreshKey: number;
}

export const DefaultState: IState = {
  chart: null,
  selectedCellInList: null,
  selectedCellNode: null,
  selectedChartParam: null,
  selectedNodeIO: null,
  selectedNodeTitle: null,
  workflowActionDialog: {
    open: false,
    action: 'run'
  },
  draftCellSaveError: null,
  catalogueRefreshKey: 0
};

export class Composer extends React.Component<IProps, IState> {
  state = DefaultState;
  containerRef: React.RefObject<HTMLDivElement>;
  NodeCustom: ReturnType<typeof nodeCustomFactory>;
  draftCellSaveQueue: Promise<void> = Promise.resolve();
  static contextType = SettingsContext;
  declare context: React.ContextType<typeof SettingsContext>;

  constructor(props: IProps) {
    super(props);
    this.containerRef = createRef();
    this.NodeCustom = nodeCustomFactory(
      this.setSelectedNodeIO,
      this.setSelectedNodeTitle
    );
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
        const droppedNodeId =
          actionKey === 'onCanvasDrop' ? args[0].id : undefined;
        const droppedNode =
          droppedNodeId === undefined
            ? undefined
            : newChart.nodes[droppedNodeId];
        const abstractDraftNodeId =
          droppedNode?.type === 'abstract-draft' ? droppedNode.id : undefined;
        if (abstractDraftNodeId !== undefined && droppedNode !== undefined) {
          const draftCell = {
            ...droppedNode.properties.cell
          } as ICell & { type?: string };
          delete draftCell.type;
          const normalizedNode = {
            ...droppedNode,
            type: 'workflow-cell',
            properties: {
              ...droppedNode.properties,
              cell: draftCell
            },
            ports: Object.fromEntries(
              Object.entries(droppedNode.ports).map(([portName, port]) => [
                portName,
                {
                  ...port,
                  properties: {
                    ...port.properties,
                    parentNodeType: 'workflow-cell'
                  }
                }
              ])
            )
          };
          newChart.nodes[abstractDraftNodeId] = normalizedNode;
        }
        this.setState({
          chart: { ...this.state.chart, ...newChart },
          selectedNodeTitle:
            abstractDraftNodeId !== undefined
              ? { nodeId: abstractDraftNodeId }
              : this.state.selectedNodeTitle
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

  setSelectedNodeTitle = (nodeId: string) => {
    this.setState({ selectedNodeTitle: { nodeId } });
  };

  saveNodeIO = (name: string, type: VariableType) => {
    const selectedNodeIO = this.state.selectedNodeIO;
    if (selectedNodeIO === null) {
      return;
    }

    const updatedChart = saveNodeIO(
      this.state.chart,
      selectedNodeIO,
      name,
      type
    );
    if (updatedChart !== null) {
      this.setChart(updatedChart);
      const updatedCell =
        updatedChart.nodes[selectedNodeIO.nodeId]?.properties.cell;
      if (updatedCell?.is_draft === true) {
        void this.saveDraftCellToCatalogue(
          selectedNodeIO.nodeId,
          updatedCell
        ).catch(() => undefined);
      }
    }
    this.setState({ selectedNodeIO: null });
  };

  saveDraftCellToCatalogue = (nodeId: string, cell: ICell) => {
    const save = this.draftCellSaveQueue
      .catch(() => undefined)
      .then(async () => {
        const savedCell = await postDraftCellToCatalogue(cell, this.context);
        await new Promise<void>(resolve => {
          this.setState(state => {
            const chart = state.chart;
            const node = chart?.nodes[nodeId];
            if (chart === null || chart === undefined || node === undefined) {
              return null;
            }
            return {
              chart: {
                ...chart,
                nodes: {
                  ...chart.nodes,
                  [nodeId]: {
                    ...node,
                    properties: {
                      ...node.properties,
                      cell: {
                        ...node.properties.cell,
                        title: savedCell.title,
                        url: savedCell.url,
                        version: 1,
                        versions: savedCell.versions
                      }
                    }
                  }
                }
              },
              draftCellSaveError: null,
              catalogueRefreshKey: state.catalogueRefreshKey + 1
            };
          }, resolve);
        });
      })
      .catch(error => {
        console.error('Failed to save draft cell to catalogue', error);
        this.setState({
          draftCellSaveError:
            error instanceof Error ? error.message : String(error)
        });
        throw error;
      });

    this.draftCellSaveQueue = save;
    return save;
  };

  saveNodeTitle = async (title: string) => {
    const selectedNodeTitle = this.state.selectedNodeTitle;
    if (selectedNodeTitle === null) {
      return;
    }

    const chart = this.state.chart;
    const node = chart?.nodes[selectedNodeTitle.nodeId];
    if (
      chart === null ||
      node === undefined ||
      node.properties.cell.is_draft !== true
    ) {
      console.error(
        `Cannot modify title for missing or non-draft node: ${selectedNodeTitle.nodeId}`
      );
      this.setState({ selectedNodeTitle: null });
      return;
    }

    if (node.properties.cell.title === title) {
      this.setState({ selectedNodeTitle: null });
      return;
    }

    const updatedCell = { ...node.properties.cell, title };
    await this.saveDraftCellToCatalogue(node.id, updatedCell);
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
            {this.state.draftCellSaveError && (
              <Alert
                severity="error"
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  zIndex: 1
                }}
              >
                Failed to save draft cell: {this.state.draftCellSaveError}
              </Alert>
            )}
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
                  Node: this
                    .NodeCustom as React.FunctionComponent<INodeDefaultProps>,
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
                        this.state.chart.nodes[this.state.selectedNodeIO.nodeId]
                          ?.ports ?? {}
                      )
                    : []
                }
                onClose={() => this.setState({ selectedNodeIO: null })}
                onSave={this.saveNodeIO}
              />
              <NodeTitleDialog
                open={this.state.selectedNodeTitle !== null}
                title={
                  this.state.selectedNodeTitle
                    ? (this.state.chart.nodes[
                        this.state.selectedNodeTitle.nodeId
                      ]?.properties.cell.title ?? '')
                    : ''
                }
                onClose={() => this.setState({ selectedNodeTitle: null })}
                onSave={this.saveNodeTitle}
                isTitleAvailable={title => {
                  const node = this.state.selectedNodeTitle
                    ? this.state.chart?.nodes[
                        this.state.selectedNodeTitle.nodeId
                      ]
                    : undefined;
                  if (node?.properties.cell.url === 'draft') {
                    return Promise.resolve(true);
                  }
                  return isCellNameAvailable(
                    title,
                    this.context,
                    node?.properties.cell.url
                  );
                }}
              />
              {this.state.selectedCellInList && (
                <CellPopup
                  cell={this.state.selectedCellInList}
                  cellNode={this.state.selectedCellNode}
                  onClose={() => this.setSelectedCell(null, null)}
                />
              )}
              <CellsSideBar
                refreshKey={this.state.catalogueRefreshKey}
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
