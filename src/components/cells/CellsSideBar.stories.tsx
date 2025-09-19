import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { getCellsFromCatalogueMock } from '../../utils/catalog';
import { CellsSideBar } from './CellsSideBar';

const meta = {
  component: CellsSideBar
} satisfies Meta<typeof CellsSideBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    settings: {
      virtualLab: 'test-virtual-lab-1',
      workflowServiceUrl: 'http://localhost:62438',
      catalogueServiceUrl: 'http://localhost:56848'
    },
    selectedCellInList: null,
    setSelectedCell: (c, n) => {},
    getCells: getCellsFromCatalogueMock
  }
};
