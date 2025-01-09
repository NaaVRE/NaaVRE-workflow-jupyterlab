import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@material-ui/core';
import * as React from 'react';
import ColorHash from 'color-hash';
import { NaaVRECatalogue } from '../../naavre-common/types';

interface IState {
  cell?: NaaVRECatalogue.WorkflowCells.ICell;
}

export class CellInfo extends React.Component {
  state: IState = {};

  updateCell = (cell: NaaVRECatalogue.WorkflowCells.ICell) => {
    this.setState({ cell: cell });
  };

  colorHash = new ColorHash();

  render() {
    return (
      <div>
        {this.state.cell && (
          <div>
            <p className={'lw-panel-preview'}>Inputs</p>
            <TableContainer component={Paper} className={'lw-panel-table'}>
              <Table aria-label="simple table">
                <TableBody>
                  {this.state.cell.inputs.map(variable => {
                    return (
                      <TableRow key={variable.name}>
                        <TableCell component="th" scope="row">
                          <p
                            style={{
                              color: this.colorHash.hex(variable.name),
                              fontSize: '1em'
                            }}
                          >
                            {variable.name}
                          </p>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {variable.type}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <p className={'lw-panel-preview'}>Outputs</p>
            <TableContainer component={Paper} className={'lw-panel-table'}>
              <Table aria-label="simple table">
                <TableBody>
                  {this.state.cell.outputs.map(variable => {
                    return (
                      <TableRow key={variable.name}>
                        <TableCell component="th" scope="row">
                          <p
                            style={{
                              color: this.colorHash.hex(variable.name),
                              fontSize: '1em'
                            }}
                          >
                            {variable.name}
                          </p>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {variable.type}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <p className={'lw-panel-preview'}>Parameters</p>
            <TableContainer component={Paper} className={'lw-panel-table'}>
              <Table aria-label="simple table">
                <TableBody>
                  {this.state.cell.params.map(param => (
                    <TableRow key={param.name}>
                      <TableCell component="th" scope="row">
                        {param.name}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {param.type}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    );
  }
}
