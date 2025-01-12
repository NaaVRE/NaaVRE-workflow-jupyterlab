import React, { useEffect, useState } from 'react';
import { Paper } from '@mui/material';

import { CellsList } from './CellsList';
import { NaaVRECatalogue } from '../../naavre-common/types';
import ICell = NaaVRECatalogue.WorkflowCells.ICell;
import { specialCells } from '../../utils/specialCells';
import { getCellsFromCatalogue } from '../../utils/catalog';

export function CellsSideBar({
  catalogueServiceUrl,
  setSelectedCellInList
}: {
  catalogueServiceUrl: string | undefined;
  setSelectedCellInList: (c: ICell | null) => void;
}) {
  const [catalogItems, setCatalogItems] = useState<Array<ICell>>([]);

  useEffect(() => {
    if (catalogueServiceUrl) {
      getCellsFromCatalogue(catalogueServiceUrl).then(cells => {
        setCatalogItems(cells);
      });
    }
  }, [catalogueServiceUrl]);

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
        cells={catalogItems}
        style={{ flexGrow: 1 }}
        setSelectedCellInList={setSelectedCellInList}
      />
      <CellsList
        title="Special cells"
        cells={specialCells}
        setSelectedCellInList={setSelectedCellInList}
      />
    </Paper>
  );
}
