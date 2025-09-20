import { ICell } from '../naavre-common/types/NaaVRECatalogue/WorkflowCells';

export interface ISpecialCell extends ICell {
  type: string;
}

export const specialCells: Array<ISpecialCell> = [
  {
    url: 'splitter',
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
    secrets: [],
    shared_with_scopes: [],
    shared_with_users: []
  },
  {
    url: 'merger',
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
    secrets: [],
    shared_with_scopes: [],
    shared_with_users: []
  }
];
