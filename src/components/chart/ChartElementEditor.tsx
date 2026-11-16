import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import {
  IConfig,
  IFlowChartCallbacks,
  ILink
} from '@mrblenny/react-flow-chart';

import { CellInfo } from '../common/CellInfo';
import { CellInfoHeader } from '../common/CellInfoHeader';
import { IChart, INode } from '../../utils/chart';
import { addCellToCatalogueAndLinkPreviousVersion } from '../../utils/catalog';
import { SettingsContext } from '../../settings';

function LinkEditor({ link, onClose }: { link: ILink; onClose: () => void }) {
  return <CellInfoHeader onClose={onClose}>Link</CellInfoHeader>;
}

function NodeEditor({ node, onClose }: { node: INode; onClose: () => void }) {
  return (
    <>
      <CellInfoHeader onClose={onClose}>
        {node.properties.cell.title}
      </CellInfoHeader>
      <CellInfo cell={node.properties.cell} />
    </>
  );
}

export function ChartElementEditor({
  chart,
  setChart,
  callbacks,
  config,
  onCellSaved
}: {
  chart: IChart;
  setChart: (chart: IChart) => void;
  callbacks: IFlowChartCallbacks;
  config: IConfig;
  onCellSaved: () => void;
}) {
  const settings = React.useContext(SettingsContext);
  const [draftCellSaveError, setDraftCellSaveError] = React.useState<
    string | null
  >(null);
  const [isSavingDraftCell, setIsSavingDraftCell] = React.useState(false);

  // when no chart element is selected, chart.selected === {}
  if (!chart.selected.id) {
    return <></>;
  }

  const selectedNode =
    chart.selected.type === 'node'
      ? chart.nodes[chart.selected.id as string]
      : undefined;
  const selectedDraftCell =
    selectedNode?.properties.cell.is_draft === true
      ? selectedNode.properties.cell
      : undefined;

  function onClose() {
    setChart({
      ...chart,
      selected: {}
    });
  }

  async function saveDraftCellToCatalogue() {
    if (!selectedDraftCell) {
      return;
    }

    setIsSavingDraftCell(true);
    setDraftCellSaveError(null);
    try {
      await addCellToCatalogueAndLinkPreviousVersion(
        selectedDraftCell,
        settings
      );
      onCellSaved();
    } catch (error) {
      console.error('Failed to save draft cell to catalogue', error);
      setDraftCellSaveError(
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setIsSavingDraftCell(false);
    }
  }

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'absolute',
        top: 20,
        right: 20,
        width: 380,
        maxHeight: 'calc(100% - 40px)',
        overflowX: 'clip',
        overflowY: 'scroll'
      }}
    >
      {chart.selected.type === 'link' && (
        <LinkEditor
          link={chart.links[chart.selected.id as string]}
          onClose={onClose}
        />
      )}
      {chart.selected.type === 'node' && (
        <NodeEditor
          node={chart.nodes[chart.selected.id as string]}
          onClose={onClose}
        />
      )}
      <div style={{ margin: '15px' }}>
        {draftCellSaveError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            Failed to save draft cell: {draftCellSaveError}
          </Alert>
        )}
        <Button
          variant="contained"
          onClick={() => {
            return callbacks.onDeleteKey({ config: config });
          }}
        >
          Delete
        </Button>
        {selectedDraftCell && (
          <Button
            variant="outlined"
            disabled={isSavingDraftCell}
            onClick={() => void saveDraftCellToCatalogue()}
          >
            {isSavingDraftCell ? 'Saving…' : 'Save to catalogue'}
          </Button>
        )}
      </div>
    </Paper>
  );
}
