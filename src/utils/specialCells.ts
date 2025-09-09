import { ICell } from '../naavre-common/types/NaaVRECatalogue/WorkflowCells';

export interface ISpecialCell extends ICell {
  type: string;
}

export const specialCells: Array<ISpecialCell> = [
  {
    id: 'splitter',
    title: 'Splitter',
    type: 'splitter',
    version: 1,
    next_version: null,
    container_image: '',
    dependencies: [],
    inputs: [{ name: 'splitter_source', type: 'list' }],
    outputs: [{ name: 'splitter_target', type: 'list' }],
    confs: [],
    params: [],
    secrets: []
  },
  {
    id: 'merger',
    title: 'Merger',
    type: 'merger',
    version: 1,
    next_version: null,
    container_image: '',
    dependencies: [],
    inputs: [{ name: 'merger_source', type: 'list' }],
    outputs: [{ name: 'merger_target', type: 'list' }],
    confs: [],
    params: [],
    secrets: []
  }
];
