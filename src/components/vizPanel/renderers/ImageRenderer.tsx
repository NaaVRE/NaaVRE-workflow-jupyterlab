import React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { imageMime, isRenderableImageMime } from './mime';

export function ImageRenderer({
  base64,
  name,
  encodingFormat
}: {
  base64: string;
  name: string;
  encodingFormat?: string;
}) {
  const mime = imageMime(name, encodingFormat);
  if (!isRenderableImageMime(mime)) {
    return (
      <Alert severity="warning">
        Cannot display &ldquo;{name}&rdquo; ({mime}) as an image. Supported:
        PNG, JPEG, SVG, GIF, WebP, PDF.
      </Alert>
    );
  }
  const dataUri = `data:${mime};base64,${base64}`;

  if (mime === 'application/pdf') {
    return (
      <Box
        component="iframe"
        src={dataUri}
        title={name}
        sx={{
          width: '100%',
          height: 480,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
      />
    );
  }
  return (
    <Box
      component="img"
      src={dataUri}
      alt={name}
      sx={{
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        background: '#fff'
      }}
    />
  );
}
