import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { CellsSideBar } from './CellsSideBar';

const meta = {
  component: CellsSideBar
} satisfies Meta<typeof CellsSideBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedCellInList: null,
    setSelectedCell: (c, n) => {}
  },
  decorators: [
    Story => {
      return <Story />;
    }
  ]
};
