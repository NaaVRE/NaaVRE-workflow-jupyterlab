import React, { useEffect, useRef, useState } from 'react';
import { Contents } from '@jupyterlab/services';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ThemeProvider } from '@mui/material/styles';

import { NaaVREExternalService } from '../../naavre-common/handler';
import { ISettings } from '../../settings';
import { theme } from '../../Theme';
import { OutputRenderer } from './renderers/OutputRenderer';
import { IRoCrateOutput, parseRoCrate } from './roCrateReader';
import { cratePath as buildCratePath, outputPath } from './storage';

type PanelState = 'waiting' | 'loading' | 'rendered' | 'failed' | 'empty';

export interface IVizPanelProps {
  runId: string;
  /**
   * Argo workflow URL to poll until the run finishes. Empty when the panel is
   * opened on a past run, whose crate is already on disk — the panel then
   * skips polling and reads it straight away.
   */
  runUrl: string;
  settings: ISettings;
  contentsManager: Contents.IManager;
  pollIntervalMs?: number;
}

export function VizPanel({
  runId,
  runUrl,
  settings,
  contentsManager,
  pollIntervalMs = 10000
}: IVizPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>('waiting');
  const [progress, setProgress] = useState<string>('Starting…');
  const [outputs, setOutputs] = useState<IRoCrateOutput[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const cancelledRef = useRef(false);

  const cratePath = buildCratePath(runId);

  useEffect(() => {
    cancelledRef.current = false;

    async function loadCrate() {
      if (cancelledRef.current) {
        return;
      }
      setPanelState('loading');
      try {
        const file = await contentsManager.get(cratePath, { content: true });
        const json =
          typeof file.content === 'string'
            ? JSON.parse(file.content)
            : file.content;
        const parsed = parseRoCrate(json);
        if (parsed.length === 0) {
          setPanelState('empty');
        } else {
          setOutputs(parsed);
          setPanelState('rendered');
        }
      } catch (e) {
        setErrorMsg(`Could not read RO-Crate: ${String(e)}`);
        setPanelState('failed');
      }
    }

    if (!runUrl) {
      void loadCrate();
      return () => {
        cancelledRef.current = true;
      };
    }

    async function poll() {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        await new Promise(r => setTimeout(r, pollIntervalMs));
        if (cancelledRef.current) {
          return;
        }

        let resp;
        try {
          resp = await NaaVREExternalService(
            'GET',
            `${settings.workflowServiceUrl}/status/${settings.virtualLab}?workflow_url=${runUrl}`,
            {},
            {}
          );
        } catch {
          setErrorMsg('Could not reach workflow service');
          setPanelState('failed');
          return;
        }

        if (resp.status_code !== 200 && resp.status_code !== 404) {
          setErrorMsg(`Workflow status error ${resp.status_code}`);
          setPanelState('failed');
          return;
        }

        // 404 means Argo has not registered the workflow yet; keep waiting.
        const data = resp.status_code === 200 ? JSON.parse(resp.content) : null;
        const phase: string = data?.status?.phase ?? '';

        switch (phase) {
          case 'Pending':
            setProgress('Starting…');
            break;
          case 'Running':
            setProgress(`Running (${data.status.progress})`);
            break;
          case 'Succeeded':
            await loadCrate();
            return;
          case 'Failed':
          case 'Error':
            setErrorMsg(`Workflow ${phase.toLowerCase()}`);
            setPanelState('failed');
            return;
          default:
            setProgress('Waiting…');
        }
      }
    }

    void poll();
    return () => {
      cancelledRef.current = true;
    };
  }, [
    runId,
    runUrl,
    settings.workflowServiceUrl,
    settings.virtualLab,
    pollIntervalMs
  ]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Run results
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 2, fontFamily: 'monospace' }}
        >
          {runId}
        </Typography>

        {panelState === 'waiting' && (
          <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
            <CircularProgress />
            <Typography color="text.secondary">{progress}</Typography>
          </Stack>
        )}

        {panelState === 'loading' && (
          <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
            <CircularProgress />
            <Typography color="text.secondary">Loading results…</Typography>
          </Stack>
        )}

        {panelState === 'failed' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {panelState === 'empty' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Workflow completed, but no FDO outputs were declared. Add an
            fdo-writer block to visualize results.
          </Alert>
        )}

        {panelState === 'rendered' && (
          <Stack spacing={2}>
            {outputs.map(output => (
              <OutputCard
                key={output.id}
                output={output}
                runId={runId}
                contentsManager={contentsManager}
              />
            ))}
          </Stack>
        )}
      </Box>
    </ThemeProvider>
  );
}

function OutputCard({
  output,
  runId,
  contentsManager
}: {
  output: IRoCrateOutput;
  runId: string;
  contentsManager: Contents.IManager;
}) {
  const filename = output.id.split('/').pop() ?? output.id;
  const relPath = outputPath(runId, output.id);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 1, flexWrap: 'wrap' }}
      >
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {filename}
        </Typography>
        <Chip label={output.vizKind} size="small" color="primary" />
        {output.encodingFormat && (
          <Chip label={output.encodingFormat} size="small" variant="outlined" />
        )}
      </Stack>
      <Divider sx={{ mb: 1 }} />
      <Typography
        variant="caption"
        color="text.secondary"
        fontFamily="monospace"
      >
        {relPath}
      </Typography>
      <Box sx={{ mt: 1 }}>
        <OutputRenderer
          output={output}
          runId={runId}
          contentsManager={contentsManager}
        />
      </Box>
    </Box>
  );
}
