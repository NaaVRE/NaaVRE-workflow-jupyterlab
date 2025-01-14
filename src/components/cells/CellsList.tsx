import React, { ReactNode } from 'react';

import { NaaVRECatalogue } from '../../naavre-common/types';
import { CellNode } from './CellNode';
import ICell = NaaVRECatalogue.WorkflowCells.ICell;

export function CellsList({
  title,
  cells,
  style,
  setSelectedCellInList,
  button
}: {
  title: string;
  cells: Array<ICell>;
  style?: React.CSSProperties;
  setSelectedCellInList: (c: ICell | null) => void;
  button?: ReactNode;
}) {
  return (
    <div style={style}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '40px',
          paddingRight: '10px',
          paddingLeft: '10px',
          background: '#3c8f49',
          color: 'white',
          fontSize: 'medium'
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {title}
        </span>
        {button && button}
      </div>
      {cells.map(cell => (
        <CellNode cell={cell} setSelectedCellInList={setSelectedCellInList} />
      ))}
    </div>
  );
}
