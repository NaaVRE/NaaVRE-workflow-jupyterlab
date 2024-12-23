import * as React from 'react';
import { Dialog, ReactWidget } from '@jupyterlab/apputils';
import styled from 'styled-components';
import { mapValues } from 'lodash';
import * as actions from '@mrblenny/react-flow-chart/src/container/actions';
import { FlowChart, IChart, IConfig } from '@mrblenny/react-flow-chart';
import { ThemeProvider } from '@material-ui/core';

import { emptyChart } from '../naavre-common/emptyChart';
import { NaaVRECatalogue } from '../naavre-common/types';
import { NodeCustom } from '../naavre-common/NodeCustom';
import { NodeInnerCustom } from '../naavre-common/NodeInnerCustom';
import { PortCustom } from '../naavre-common/PortCustom';
import { requestAPI } from '../naavre-common/handler';
import { CatalogDialog } from './CatalogDialog';
import { CellEditor } from './CellEditor';
import { ChartElementEditor } from './ChartElementEditor';
import { ExecuteWorkflowDialog } from './ExecuteWorkflowDialog';
import { Page } from './Page';
import { Parallelization } from './Parallelization';
import { theme } from '../Theme';
import { Visualization } from './Visualization';
import { Workspace } from './Workspace';

export const CenterContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export interface IProps {}

export interface IState {
  chart: IChart;
}

export const DefaultState: IState = {
  chart: emptyChart
};

export class Composer extends React.Component<IProps, IState> {
  state = DefaultState;

  workspaceRef: React.RefObject<Workspace>;

  constructor(props: IProps) {
    super(props);
    this.workspaceRef = React.createRef();
  }

  handleAddCellToWorkspace = (cell: NaaVRECatalogue.WorkflowCells.ICell) => {
    this.workspaceRef.current.addElement(cell);
  };

  handleIsCellInWorkspace = (cell: NaaVRECatalogue.WorkflowCells.ICell) => {
    return this.workspaceRef.current.hasElement(cell);
  };

  getWorkspaceElementFromChartId = (chartId: string): NaaVRECatalogue.WorkflowCells.ICell => {
    let nodeId = this.state.chart.nodes[chartId].properties['og_node_id'];
    return this.workspaceRef.current.getElement(nodeId);
  };

  getCatalogDialogOptions = (): Partial<Dialog.IOptions<any>> => {
    return {
      title: '',
      body: ReactWidget.create(
        <CatalogDialog
          addCellAction={this.handleAddCellToWorkspace}
          isCellInWorkspace={this.handleIsCellInWorkspace}
        />
      ) as Dialog.IBodyWidget<any>,
      buttons: [Dialog.okButton({ label: 'Close' })]
    };
  };

  getExecuteWorkflowDialogOptions = (): Partial<Dialog.IOptions<any>> => {
    return {
      title: '',
      body: ReactWidget.create(
        <ExecuteWorkflowDialog chart={this.state.chart} />
      ) as Dialog.IBodyWidget<any>,
      buttons: [Dialog.okButton({ label: 'Close' })]
    };
  };

  chartStateActions = mapValues(actions, (func: any) => (...args: any) => {
    let newChartTransformer = func(...args);
    let newChart = newChartTransformer(this.state.chart);
    this.setState({
      chart: { ...this.state.chart, ...newChart }
    });
  }) as typeof actions;

  chartConfig: IConfig = {
    // This is needed because onDeleteKey assumes config.readonly is defined...
    // https://github.com/MrBlenny/react-flow-chart/blob/0.0.14/src/container/actions.ts#L182
    readonly: false
  };

  exportWorkflow = async () => {
    try {
      let resp = await requestAPI<any>('expmanager/export', {
        body: JSON.stringify({
          ...this.state.chart
        }),
        method: 'POST'
      });
      console.log(resp);
    } catch (error) {
      console.log(error);
      alert(
        'Error exporting the workflow: ' +
          String(error).replace('{"message": "Unknown HTTP Error"}', '')
      );
    }
  };

  getNodeEditor = () => {
    let node = this.state.chart.nodes[this.state.chart.selected.id];
    switch (node.type) {
      case 'splitter':
        return (
          <ChartElementEditor
            title={'Splitter'}
            callbacks={this.chartStateActions}
            config={this.chartConfig}
          ></ChartElementEditor>
        );
      case 'merger':
        return (
          <ChartElementEditor
            title={'Merger'}
            callbacks={this.chartStateActions}
            config={this.chartConfig}
          ></ChartElementEditor>
        );
      case 'visualizer':
        return (
          <ChartElementEditor
            title={'Visualizer'}
            callbacks={this.chartStateActions}
            config={this.chartConfig}
          ></ChartElementEditor>
        );
    }
    return (
      <CellEditor
        callbacks={this.chartStateActions}
        config={this.chartConfig}
        node={node}
      />
    );
  };

  getChartElementEditor = () => {
    switch (this.state.chart.selected.type) {
      case 'node':
        return this.getNodeEditor();
      case 'link':
        return (
          <ChartElementEditor
            title={'Link'}
            callbacks={this.chartStateActions}
            config={this.chartConfig}
          ></ChartElementEditor>
        );
      default:
        return <></>;
    }
  };

  componentDidUpdate() {
    // TODO: Implement chart sanity checks
  }

  render(): React.ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <Page>
          <CenterContent>
            <FlowChart
              chart={this.state.chart}
              callbacks={this.chartStateActions}
              config={this.chartConfig}
              Components={{
                Node: NodeCustom,
                NodeInner: NodeInnerCustom,
                Port: PortCustom
              }}
            />
            {this.state.chart.selected.id && this.getChartElementEditor()}
            <div
              style={{
                boxShadow: '1px 1px lightgrey',
                background: 'white',
                height: '100%',
                width: 250,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'scroll',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              <Workspace ref={this.workspaceRef} />
              <Parallelization />
              <Visualization />
            </div>
          </CenterContent>
        </Page>
      </ThemeProvider>
    );
  }
}
