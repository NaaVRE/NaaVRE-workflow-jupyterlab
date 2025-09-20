import { ICell } from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import { INaaVREExternalServiceResponse } from '../../naavre-common/handler';

const cells: ICell[] = [
  {
    url: 'http://localhost:56848/workflow-cells/b6923c9e-eeb6-49fe-81f2-3df7003f8332/',
    owner: 'test-user-2',
    virtual_lab: 'test-virtual-lab-1',
    base_container_image: {
      build: 'example.com/test-build-image:v0.0.1',
      runtime: 'example.com/test-runtime-image:v0.0.1'
    },
    dependencies: [],
    inputs: [
      {
        name: 'test_value_1',
        type: 'list'
      }
    ],
    outputs: [],
    confs: [],
    params: [],
    secrets: [],
    title: 'test-cell-2-with-a-long-name-test-user-2',
    description: '',
    created: '2025-01-19T21:39:53.924000Z',
    modified: '2025-01-19T21:39:53.924000Z',
    version: 1,
    container_image: 'example.com/naavre-cells/test-cell-2:f7b1772',
    kernel: '',
    source_url: '',
    next_version: null,
    shared_with_scopes: [],
    shared_with_users: []
  },
  {
    url: 'http://localhost:56848/workflow-cells/b58c627a-1843-421c-a897-89461ddc581a/',
    owner: 'test-user-2',
    virtual_lab: 'test-virtual-lab-1',
    base_container_image: {
      build: 'example.com/test-build-image:v0.0.1',
      runtime: 'example.com/test-runtime-image:v0.0.1'
    },
    dependencies: [
      {
        name: 'test-dependency-1',
        module: null,
        asname: null
      },
      {
        name: 'test-dependency-2',
        module: null,
        asname: null
      }
    ],
    inputs: [],
    outputs: [
      {
        name: 'test_value_1',
        type: 'list'
      }
    ],
    confs: [
      {
        name: 'conf_test_1',
        assignation: 'conf_test_1 = 1'
      }
    ],
    params: [
      {
        name: 'param_test_1',
        type: 'str',
        default_value: 'test value'
      }
    ],
    secrets: [
      {
        name: 'secret_test_1',
        type: 'str'
      }
    ],
    title: 'test-cell-1-test-user-2',
    description: '',
    created: '2025-01-19T21:38:23.503000Z',
    modified: '2025-01-19T21:37:23.503000Z',
    version: 2,
    container_image: 'example.com/naavre-cells/test-cell-1:7abc41dd',
    kernel: 'ipython',
    source_url: '',
    next_version: null,
    shared_with_scopes: [],
    shared_with_users: []
  }
];

export function getCellsList(request: Request): INaaVREExternalServiceResponse {
  return {
    status_code: 200,
    reason: 'OK',
    headers: {
      'content-type': 'application/json'
    },
    content: JSON.stringify({
      count: cells.length,
      next: null,
      previous: null,
      results: cells
    })
  };
}
