import React from 'react';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';

import { ICell } from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import { specialCells } from '../../utils/specialCells';
import { CellsList } from './CellsList';
import { PageNav } from './PageNav';
import { ListFilter } from './ListFilter';
import { IWorkflowWidgetSettings } from '../../widget';
import { useCatalogueList } from '../../hooks/use-catalogue-list';

export function CellsSideBar({
  settings,
  selectedCellInList,
  setSelectedCell
}: {
  settings: IWorkflowWidgetSettings;
  selectedCellInList: ICell | null;
  setSelectedCell: (c: ICell | null, n: HTMLDivElement | null) => void;
}) {
  const {
    url: cellsListUrl,
    setUrl: setCellsListUrl,
    loading,
    errorMessage,
    fetchResponse: fetchCellsListResponse,
    response: cellsListResponse
  } = useCatalogueList<ICell>({
    settings,
    initialPath: `workflow-cells/?ordering=-modified&virtual_lab=${settings.virtualLab}`
  });

  return (
    <Paper
      elevation={12}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 250,
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'scroll',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0
      }}
    >
      <CellsList
        title="Cells Catalog"
        cells={cellsListResponse.results}
        loading={loading}
        message={
          errorMessage
            ? errorMessage
            : cellsListResponse.count === 0
              ? 'There are no cells in your catalogue. Get started by creating a notebook and containerizing a cell.'
              : null
        }
        selectedCellInList={selectedCellInList}
        setSelectedCell={setSelectedCell}
        button={
          <Tooltip title="Refresh" arrow>
            <IconButton
              aria-label="Reload"
              style={{ color: 'white', borderRadius: '100%' }}
              onClick={() => fetchCellsListResponse()}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
        filter={<ListFilter url={cellsListUrl} setUrl={setCellsListUrl} />}
        pageNav={
          <PageNav listResponse={cellsListResponse} setUrl={setCellsListUrl} />
        }
      />
      <CellsList
        title="Special cells"
        cells={specialCells}
        loading={false}
        message={null}
        selectedCellInList={selectedCellInList}
        setSelectedCell={setSelectedCell}
      />
    </Paper>
  );
}
