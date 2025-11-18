import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { chart as mockChart } from '../../mocks/chart';
import { RunWorkflowDialog } from './RunWorkflowDialog';
import React from 'react';
import '@jupyterlab/apputils/style/dialog.css';
import '@jupyterlab/theme-light-extension/style/variables.css';

const meta = {
  component: RunWorkflowDialog
} satisfies Meta<typeof RunWorkflowDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    chart: mockChart
  },
  decorators: [
    (Story, { parameters }) => {
      return (
        <div className="lm-widget jp-Dialog jp-ThemedContainer">
          <div className="lm-widget jp-Dialog-content">
            <div className="lm-widget jp-Dialog-header">Run Workflow</div>
            <div className="lm-widget jp-Dialog-body">
              <Story />
            </div>
          </div>
        </div>
      );
    }
  ]
};
