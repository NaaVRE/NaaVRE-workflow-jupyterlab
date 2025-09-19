import React from 'react';
import type { Preview } from '@storybook/react-webpack5';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../src/Theme';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  },
  decorators: [
    Story => (
      <div
        style={{
          fontFamily:
            "system-ui,-apple-system,blinkmacsystemfont,'Segoe UI',helvetica,arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'"
        }}
      >
        <ThemeProvider theme={theme}>
          <Story />
        </ThemeProvider>
      </div>
    )
  ]
};

export default preview;
