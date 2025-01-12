import React from 'react';

import { NaaVRECatalogue } from '../../naavre-common/types';
import { CellNode } from './CellNode';
import ICell = NaaVRECatalogue.WorkflowCells.ICell;

export function CellsList({
  title,
  cells,
  style,
  setSelectedCellInList
}: {
  title: string;
  cells: Array<ICell>;
  style?: React.CSSProperties;
  setSelectedCellInList: (c: ICell | null) => void;
}) {
  return (
    <div style={style}>
      <p className="section-header">{title}</p>
      {cells.map(cell => (
        <CellNode cell={cell} setSelectedCellInList={setSelectedCellInList} />
      ))}
    </div>
  );
}
