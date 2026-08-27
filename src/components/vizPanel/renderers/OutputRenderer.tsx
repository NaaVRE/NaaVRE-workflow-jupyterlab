import React, { useEffect, useState } from 'react';
import { Contents } from '@jupyterlab/services';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { IRoCrateOutput } from '../roCrateReader';
import { outputPath } from '../storage';
import { HtmlRenderer } from './HtmlRenderer';
import { ImageRenderer } from './ImageRenderer';
import { MapRenderer } from './MapRenderer';
import { TableRenderer } from './TableRenderer';
import { XyPlotRenderer } from './XyPlotRenderer';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; content: string };

export function OutputRenderer({
  output,
  runId,
  contentsManager
}: {
  output: IRoCrateOutput;
  runId: string;
  contentsManager: Contents.IManager;
}) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const path = outputPath(runId, output.id);
  // Images (and PDFs) are binary; everything else is parsed as text downstream.
  const format = output.vizKind === 'image' ? 'base64' : 'text';

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    contentsManager
      .get(path, { content: true, format, type: 'file' })
      .then(file => {
        if (cancelled) {
          return;
        }
        const content =
          typeof file.content === 'string'
            ? file.content
            : JSON.stringify(file.content);
        setState({ status: 'ready', content });
      })
      .catch(e => {
        if (!cancelled) {
          setState({ status: 'error', message: String(e) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [path, format]);

  if (state.status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }
  if (state.status === 'error') {
    return (
      <Alert severity="error">Could not load output: {state.message}</Alert>
    );
  }

  const name = output.id.split('/').pop() ?? output.id;
  switch (output.vizKind) {
    case 'xy-plot':
      return <XyPlotRenderer text={state.content} />;
    case 'map':
      return <MapRenderer text={state.content} />;
    case 'table':
      return (
        <TableRenderer
          text={state.content}
          encodingFormat={output.encodingFormat}
        />
      );
    case 'image':
      return (
        <ImageRenderer
          base64={state.content}
          name={name}
          encodingFormat={output.encodingFormat}
        />
      );
    case 'html':
      return <HtmlRenderer text={state.content} name={name} />;
    default:
      return (
        <Alert severity="info">
          No predefined renderer for &ldquo;{output.vizKind}&rdquo;.
        </Alert>
      );
  }
}
