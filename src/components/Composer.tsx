import * as React from 'react';
import { Dialog, ReactWidget } from '@jupyterlab/apputils';
import styled from 'styled-components';
import { mapValues } from 'lodash';
import * as actions from '@mrblenny/react-flow-chart/src/container/actions';
import {
  FlowChart,
  IChart,
  IConfig,
  INodeDefaultProps
} from '@mrblenny/react-flow-chart';
import { ThemeProvider } from '@material-ui/core';

import { emptyChart } from '../naavre-common/emptyChart';
import { NaaVRECatalogue } from '../naavre-common/types';
import { NodeCustom } from '../naavre-common/NodeCustom';
import { NodeInnerCustom } from '../naavre-common/NodeInnerCustom';
import { PortCustom } from '../naavre-common/PortCustom';
import { MockNaaVREExternalService } from '../naavre-common/mockHandler';
import { CatalogDialog } from './CatalogDialog';
import { CellEditor } from './CellEditor';
import { ChartElementEditor } from './ChartElementEditor';
import { ExecuteWorkflowDialog } from './ExecuteWorkflowDialog';
import { Page } from './Page';
import { Parallelization } from './Parallelization';
import { theme } from '../Theme';
import { Visualization } from './Visualization';
import { Workspace } from './Workspace';
import { IWorkflowWidgetSettings } from '../widget';

export const CenterContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export interface IProps {
  settings: IWorkflowWidgetSettings;
}

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
    this.workspaceRef.current?.addElement(cell);
  };

  handleIsCellInWorkspace = (cell: NaaVRECatalogue.WorkflowCells.ICell) => {
    return this.workspaceRef.current?.hasElement(cell) || false;
  };

  getCatalogDialogOptions = (): Partial<Dialog.IOptions<any>> => {
    return {
      title: <p className="section-header">Explore Cell Catalogs</p>,
      body: ReactWidget.create(
        <CatalogDialog
          addCellAction={this.handleAddCellToWorkspace}
          isCellInWorkspace={this.handleIsCellInWorkspace}
          settings={this.props.settings}
        />
      ) as Dialog.IBodyWidget<any>,
      buttons: [Dialog.okButton({ label: 'Close' })]
    };
  };

  getExecuteWorkflowDialogOptions = (): Partial<Dialog.IOptions<any>> => {
    return {
      title: <p className="section-header">Execute Workflow</p>,
      body: ReactWidget.create(
        <ExecuteWorkflowDialog
          chart={this.state.chart}
          settings={this.props.settings}
        />
      ) as Dialog.IBodyWidget<any>,
      buttons: [Dialog.okButton({ label: 'Close' })]
    };
  };

  chartStateActions = mapValues(actions, (func: any) => (...args: any) => {
    const newChartTransformer = func(...args);
    const newChart = newChartTransformer(this.state.chart);
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
    MockNaaVREExternalService(
      'POST',
      `${this.props.settings.workflowServiceUrl}/convert`,
      {},
      {
        virtual_lab: this.props.settings.virtualLab,
        naavrewf2: this.state.chart
      }
    )
      .then(resp => {
        console.log(resp);
        // TODO: save resp.content to yaml document
      })
      .catch(error => {
        const msg = `Error exporting the workflow: ${String(error)}`;
        console.log(msg);
        alert(msg);
      });
  };

  getNodeEditor = () => {
    if (this.state.chart.selected.id === undefined) {
      throw 'Chart element has no id';
    }
    const node = this.state.chart.nodes[this.state.chart.selected.id];
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
                Node: NodeCustom as React.FunctionComponent<INodeDefaultProps>,
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
