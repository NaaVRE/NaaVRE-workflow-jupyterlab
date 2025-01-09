import * as React from 'react';
// TODO: replace all @material-ui imports with @mui
import { Button, styled, TextField, ThemeProvider } from '@material-ui/core';
import { Autocomplete } from '@mui/material';

import { CellPreview } from '../naavre-common/CellPreview';
import { NaaVRECatalogue } from '../naavre-common/types';
import { requestAPI } from '../naavre-common/handler';

import { CellInfo } from './CellInfo';
import { VirtualizedList } from './VirtualizedList';
import { theme } from '../Theme';
import { IWorkflowWidgetSettings } from '../widget';

const catalogs = [{ label: 'Local' }];

interface IState {
  catalog_elements: [];
  current_cell?: NaaVRECatalogue.WorkflowCells.ICell;
  current_cell_in_workspace: boolean;
}

export const DefaultState: IState = {
  catalog_elements: [],
  current_cell: undefined,
  current_cell_in_workspace: false
};

const CatalogBody = styled('div')({
  display: 'flex',
  overflow: 'hidden',
  flexDirection: 'row'
});

const PreviewWindow = styled('div')({
  width: '400px',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'scroll'
});

interface ICatalogDialogProps {
  addCellAction: (cell: NaaVRECatalogue.WorkflowCells.ICell) => void;
  isCellInWorkspace: (cell: NaaVRECatalogue.WorkflowCells.ICell) => boolean;
  settings: IWorkflowWidgetSettings;
}

export class CatalogDialog extends React.Component<ICatalogDialogProps> {
  state = DefaultState;
  cellPreviewRef: React.RefObject<CellPreview>;
  cellInfoRef: React.RefObject<CellInfo>;

  constructor(props: ICatalogDialogProps) {
    super(props);
    this.cellPreviewRef = React.createRef();
    this.cellInfoRef = React.createRef();
  }

  componentDidMount(): void {
    this.getCatalog();
  }

  onCellSelection = (cell_index: number) => {
    const cell = this.state.catalog_elements[cell_index];
    const chart = cell['chart_obj'];
    const node = chart['nodes'][Object.keys(chart['nodes'])[0]];
    this.cellPreviewRef.current?.updateChart(chart);
    this.cellInfoRef.current?.updateCell(node, cell['types']);

    this.setState({
      current_cell: cell,
      current_cell_in_workspace: this.props.isCellInWorkspace(cell)
    });
  };

  onCellAddition = () => {
    if (this.state.current_cell !== undefined) {
      this.props.addCellAction(this.state.current_cell);
      this.setState({ current_cell_in_workspace: true });
    }
  };

  getCatalog = async () => {
    const resp = await requestAPI<any>('catalog/cells/all', {
      method: 'GET'
    });

    this.setState({ catalog_elements: resp });
  };

  render(): React.ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <CatalogBody>
          <div>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={catalogs}
              sx={{ width: 300, margin: '10px' }}
              renderInput={params => <TextField {...params} label="Catalog" />}
            />
            <VirtualizedList
              items={this.state.catalog_elements}
              clickAction={this.onCellSelection}
            />
          </div>
          <PreviewWindow>
            <div>
              <CellPreview ref={this.cellPreviewRef} />
              <CellInfo ref={this.cellInfoRef} />
              {this.state.current_cell !== null ? (
                <Button
                  color="primary"
                  disabled={this.state.current_cell_in_workspace}
                  style={{ margin: '15px' }}
                  variant="contained"
                  onClick={this.onCellAddition}
                >
                  Add to Workspace
                </Button>
              ) : (
                <div></div>
              )}
            </div>
          </PreviewWindow>
        </CatalogBody>
      </ThemeProvider>
    );
  }
}
