import React, { useCallback, useEffect, useState } from 'react';
import { Contents } from '@jupyterlab/services';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ThemeProvider } from '@mui/material/styles';

import { theme } from '../../Theme';
import { IPastRun, listPastRuns } from './pastRuns';

type ListState = 'loading' | 'listed' | 'empty' | 'failed';

export interface IPastRunsPanelProps {
  contentsManager: Contents.IManager;
  onOpenRun: (runId: string) => void;
}

export function PastRunsPanel({
  contentsManager,
  onOpenRun
}: IPastRunsPanelProps) {
  const [listState, setListState] = useState<ListState>('loading');
  const [runs, setRuns] = useState<IPastRun[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const refresh = useCallback(async () => {
    setListState('loading');
    try {
      const found = await listPastRuns(contentsManager);
      setRuns(found);
      setListState(found.length === 0 ? 'empty' : 'listed');
    } catch (e) {
      setErrorMsg(`Could not list past runs: ${String(e)}`);
      setListState('failed');
    }
  }, [contentsManager]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Past run results
          </Typography>
          <Tooltip title="Refresh">
            <span>
              <IconButton
                size="small"
                onClick={() => void refresh()}
                disabled={listState === 'loading'}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {listState === 'loading' && (
          <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
            <CircularProgress />
            <Typography color="text.secondary">Listing runs…</Typography>
          </Stack>
        )}

        {listState === 'failed' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {listState === 'empty' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No past runs found. Run a workflow with an fdo-writer block to
            produce visualizable results.
          </Alert>
        )}

        {listState === 'listed' && (
          <Stack spacing={1}>
            {runs.map(run => (
              <PastRunRow
                key={run.runId}
                run={run}
                onOpen={() => onOpenRun(run.runId)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </ThemeProvider>
  );
}

function PastRunRow({ run, onOpen }: { run: IPastRun; onOpen: () => void }) {
  const parsed = new Date(run.lastModified);
  const when = Number.isNaN(parsed.getTime())
    ? run.lastModified
    : parsed.toLocaleString();

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            fontFamily="monospace"
            noWrap
            title={run.runId}
          >
            {run.runId}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {when}
          </Typography>
        </Box>
        <Button size="small" variant="outlined" onClick={onOpen}>
          Open
        </Button>
      </Stack>
    </Box>
  );
}
