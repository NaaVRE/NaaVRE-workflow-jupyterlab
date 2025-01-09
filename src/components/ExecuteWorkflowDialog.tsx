import * as React from 'react';
import { IChart } from '@mrblenny/react-flow-chart';
import { Button, styled, ThemeProvider } from '@material-ui/core';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import { grey, green } from '@mui/material/colors';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';

import { theme } from '../Theme';
import { NaaVRECatalogue } from '../naavre-common/types';
import { IWorkflowWidgetSettings } from '../widget';
import { MockNaaVREExternalService } from '../naavre-common/mockHandler';

interface IState {
  params: { [name: string]: any };
  secrets: { [name: string]: any };
  submitted_workflow: any;
}

export const DefaultState: IState = {
  params: {},
  secrets: {},
  submitted_workflow: null
};

const CatalogBody = styled('div')({
  display: 'flex',
  overflow: 'scroll',
  flexDirection: 'column'
});

interface IExecuteWorkflowDialogProps {
  chart: IChart;
  settings: IWorkflowWidgetSettings;
}

export class ExecuteWorkflowDialog extends React.Component<IExecuteWorkflowDialogProps> {
  state = DefaultState;
  global_params: string[] = [];
  global_secrets: string[] = [];
  chart_node_ids: string[] = [];

  constructor(props: IExecuteWorkflowDialogProps) {
    super(props);
    const nodes = props.chart.nodes;

    Object.keys(nodes).forEach(nid => {
      this.chart_node_ids.push(nodes[nid].properties['og_node_id']);
      if (nodes[nid].properties['params']) {
        this.global_params.push(...nodes[nid].properties['params']);
      }
      if (nodes[nid].properties['secrets']) {
        this.global_secrets.push(...nodes[nid].properties['secrets']);
      }
    });

    const unique_params = [...new Set(this.global_params)].sort();
    const unique_secrets = [...new Set(this.global_secrets)].sort();
    const params: { [name: string]: any } = {};
    const secrets: { [name: string]: any } = {};
    unique_params.forEach((paramName: string) => {
      params[paramName] = null;
    });
    unique_secrets.forEach((secretName: string) => {
      secrets[secretName] = null;
    });
    this.state.params = params;
    this.state.secrets = secrets;
  }

  getValuesFromCatalog = async () => {
    MockNaaVREExternalService(
      'GET',
      `${this.props.settings.catalogueServiceUrl}/workflow-cells/`
    )
      .then(resp => {
        if (resp.status_code !== 200) {
          throw `${resp.status_code} ${resp.reason}`;
        }
        const data = JSON.parse(resp.content);
        const params = this.state.params;
        // Extract param values for cells that are in the current workflow
        data.forEach((cell: NaaVRECatalogue.WorkflowCells.ICell) => {
          if (this.chart_node_ids.includes(cell.id)) {
            cell.params.forEach(param => {
              params[param.name] = param.default_value;
            });
          }
        });
        this.setState({ params: params });
      })
      .catch(error => {
        const msg = `Error getting values from the catalogue: ${String(error)}`;
        console.log(msg);
        alert(msg);
      });
  };

  executeWorkflow = async (
    params: { [name: string]: any },
    secrets: { [name: string]: any }
  ) => {
    MockNaaVREExternalService(
      'POST',
      `${this.props.settings.workflowServiceUrl}/submit`,
      {},
      {
        virtual_lab: this.props.settings.virtualLab,
        naavrewf2: this.props.chart,
        params: params,
        secrets: secrets
      }
    )
      .then(resp => {
        if (resp.status_code !== 200) {
          throw `${resp.status_code} ${resp.reason}`;
        }
        const data = JSON.parse(resp.content);
        this.setState({ submitted_workflow: data });
      })
      .catch(error => {
        const msg = `Error exporting the workflow: ${error}`;
        console.log(msg);
        alert(msg);
      });
  };

  handleSubmit = () => {
    this.executeWorkflow(this.state.params, this.state.secrets);
  };

  handleParamValueUpdate = (
    event: React.ChangeEvent<{ name?: string; value: string }>,
    name: string
  ) => {
    const curr_values = this.state.params;
    curr_values[name] = event.target.value;
    this.setState({ params: curr_values });
  };

  handleSecretValueUpdate = (
    event: React.ChangeEvent<{ name?: string; value: string }>,
    name: string
  ) => {
    const curr_values = this.state.secrets;
    curr_values[name] = event.target.value;
    this.setState({ secrets: curr_values });
  };

  allValuesFilled = () => {
    let all_filled = true;

    if (Object.values(this.state.params).length > 0) {
      Object.values(this.state.params).forEach(value => {
        all_filled = all_filled && value !== null;
      });
    }

    if (Object.values(this.state.secrets).length > 0) {
      Object.values(this.state.secrets).forEach(value => {
        all_filled = all_filled && value !== null;
      });
    }

    return all_filled;
  };

  render(): React.ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <CatalogBody>
          {this.state.submitted_workflow ? (
            <div className="wf-submit-box">
              <CheckCircleOutlineIcon
                fontSize="large"
                sx={{ color: green[500] }}
              />
              <p className="wf-submit-text">
                Workflow submitted! You can track it{' '}
                <a
                  className="wf-submit-link"
                  target={'_blank'}
                  href={this.state.submitted_workflow['argo_url']}
                >
                  here
                </a>
              </p>
            </div>
          ) : (
            <div>
              <div
                style={{
                  textAlign: 'right',
                  padding: '10px 15px 0 0'
                }}
              >
                <Button
                  disabled={false}
                  onClick={this.getValuesFromCatalog}
                  size="small"
                  variant="text"
                  endIcon={<AutoModeIcon fontSize="inherit" />}
                  style={{ color: grey[900], textTransform: 'none' }}
                >
                  Use notebook parameter values
                </Button>
              </div>
              <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                  <TableBody>
                    {Object.keys(this.state.params).map((paramName: string) => (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={paramName}
                      >
                        <TableCell key={paramName} align={'right'}>
                          {paramName}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <TextField
                            // id="standard-basic"
                            // label="Standard"
                            // variant="standard"
                            value={this.state.params[paramName]}
                            onChange={event => {
                              this.handleParamValueUpdate(event, paramName);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {Object.keys(this.state.secrets).map(
                      (secretName: string) => (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={secretName}
                        >
                          <TableCell key={secretName} align={'right'}>
                            {secretName}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            <TextField
                              // id="standard-basic"
                              // label="Standard"
                              // variant="standard"
                              type="password"
                              autoComplete="off"
                              value={this.state.secrets[secretName]}
                              onChange={event => {
                                this.handleSecretValueUpdate(event, secretName);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                variant="contained"
                className={'lw-panel-button'}
                onClick={this.handleSubmit}
                color="primary"
                disabled={!this.allValuesFilled()}
              >
                Execute
              </Button>
            </div>
          )}
        </CatalogBody>
      </ThemeProvider>
    );
  }
}
