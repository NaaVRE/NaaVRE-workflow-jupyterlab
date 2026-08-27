import React from 'react';
import Box from '@mui/material/Box';

export function HtmlRenderer({ text, name }: { text: string; name: string }) {
  return (
    <Box
      component="iframe"
      srcDoc={text}
      title={name}
      sandbox="allow-scripts allow-popups"
      sx={{
        width: '100%',
        height: 480,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        background: '#fff'
      }}
    />
  );
}
