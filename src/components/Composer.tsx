import * as React from 'react';
import { Dialog, ReactWidget } from '@jupyterlab/apputils';
import { mapValues } from 'lodash';
import * as actions from '@mrblenny/react-flow-chart/src/container/actions';
import {
  FlowChart,
  IChart,
  IConfig,
  INodeDefaultProps
} from '@mrblenny/react-flow-chart';
import { ThemeProvider } from '@material-ui/core';

import { defaultChart } from '../utils/chart';
import { NaaVRECatalogue } from '../naavre-common/types';
import { NodeCustom } from './chart/NodeCustom';
import { NodeInnerCustom } from './chart/NodeInnerCustom';
import { PortCustom } from './chart/PortCustom';
import { MockNaaVREExternalService } from '../naavre-common/mockHandler';
import { ChartElementEditor } from './chart/ChartElementEditor';
import { RunWorkflowDialog } from './workflowRunDialog/RunWorkflowDialog';
import { theme } from '../Theme';
import { IWorkflowWidgetSettings } from '../widget';
import { CellsSideBar } from './cells/CellsSideBar';
import ICell = NaaVRECatalogue.WorkflowCells.ICell;
import { CellPopup } from './cells/CellPopup';

export interface IProps {
  settings: IWorkflowWidgetSettings;
}

export interface IState {
  chart: IChart;
  selectedCellInList: ICell | null;
}

export const DefaultState: IState = {
  chart: defaultChart,
  selectedCellInList: null
};

export class Composer extends React.Component<IProps, IState> {
  state = DefaultState;

  constructor(props: IProps) {
    super(props);
  }

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

  setSelectedCellInList = (cell: ICell | null) => {
    this.setState({ selectedCellInList: cell });
  };

  getRunWorkflowDialogOptions = (): Partial<Dialog.IOptions<any>> => {
    return {
      title: 'Run Workflow',
      body: ReactWidget.create(
        <RunWorkflowDialog
          chart={this.state.chart}
          settings={this.props.settings}
        />
      ) as Dialog.IBodyWidget<any>,
      buttons: [Dialog.okButton({ label: 'Close' })]
    };
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

  componentDidUpdate() {
    // TODO: Implement chart sanity checks
  }

  render(): React.ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flex: 1,
            maxWidth: '100vw',
            maxHeight: '100vh'
          }}
        >
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
                Node: NodeCustom as React.FunctionComponent<INodeDefaultProps>,
                NodeInner: NodeInnerCustom,
                Port: PortCustom
              }}
            />
            {this.state.chart.selected.id && (
              <ChartElementEditor
                chart={this.state.chart}
                callbacks={this.chartStateActions}
                config={this.chartConfig}
              />
            )}
            {this.state.selectedCellInList && (
              <CellPopup cell={this.state.selectedCellInList} />
            )}
            <CellsSideBar
              catalogueServiceUrl={this.props.settings.catalogueServiceUrl}
              setSelectedCellInList={this.setSelectedCellInList}
            />
          </div>
        </div>
      </ThemeProvider>
    );
  }
}
