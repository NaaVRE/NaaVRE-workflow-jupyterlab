import React from 'react';
import type { Preview } from '@storybook/react-webpack5';
import { initialize, mswLoader } from 'msw-storybook-addon';

import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../src/Theme';
import { externalServiceHandlers } from '../src/mocks/handlers';

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize();

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    msw: {
      handlers: externalServiceHandlers
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
