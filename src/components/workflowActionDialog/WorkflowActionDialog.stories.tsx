import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { chart as mockChart } from '../../mocks/chart';
import { WorkflowActionDialog } from './WorkflowActionDialog';
import React from 'react';
import '@jupyterlab/apputils/style/dialog.css';
import '@jupyterlab/theme-light-extension/style/variables.css';

const meta = {
  component: WorkflowActionDialog
} satisfies Meta<typeof WorkflowActionDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    chart: mockChart,
    open: true,
    action: 'run',
    onClose: () => {},
    container: null
  },
  decorators: [
    (Story, { parameters }) => {
      return <Story />;
    }
  ]
};
