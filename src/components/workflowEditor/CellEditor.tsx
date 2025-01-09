import * as React from 'react';
import { useEffect, useRef } from 'react';
import { CellInfo } from '../common/CellInfo';
import {
  IConfig,
  IFlowChartCallbacks,
  INode
} from '@mrblenny/react-flow-chart';
import { ChartElementEditor } from './ChartElementEditor';

interface ICellEditorProps {
  callbacks: IFlowChartCallbacks;
  config: IConfig;
  node: INode;
}

export const CellEditor = (props: ICellEditorProps): React.ReactElement => {
  const cellInfoRef: React.RefObject<CellInfo> = useRef(null);
  useEffect(() => {
    cellInfoRef.current?.updateCell(props.node.properties.cell);
  });

  return (
    <ChartElementEditor
      title={props.node.properties.title}
      callbacks={props.callbacks}
      config={props.config}
    >
      <CellInfo ref={cellInfoRef} />
    </ChartElementEditor>
  );
};
