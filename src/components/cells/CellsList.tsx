import React, { ReactNode } from 'react';

import { ICell } from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import { CellNode } from './CellNode';

export function CellsList({
  title,
  cells,
  style,
  selectedCellInList,
  setSelectedCell,
  button
}: {
  title: string;
  cells: Array<ICell>;
  style?: React.CSSProperties;
  selectedCellInList: ICell | null;
  setSelectedCell: (c: ICell | null, n: HTMLDivElement | null) => void;
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
        <CellNode
          cell={cell}
          selectedCellInList={selectedCellInList}
          setSelectedCell={setSelectedCell}
        />
      ))}
    </div>
  );
}
