import { NaaVREExternalService } from '../naavre-common/handler';
import { ICell } from '../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import { ceil } from 'lodash';

export interface ICellsCatalogueResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<ICell>;
}

export function urlToPageNumber(url: string) {
  const u = new URL(url);
  if (u.searchParams.has('page')) {
    const p = Number(u.searchParams.get('page'));
    if (isNaN(p)) {
      throw Error(`Unexpected url: ${url}`);
    }
    return p;
  } else {
    return 1;
  }
}

export function getPageNumberAndCount(resp: ICellsCatalogueResponse) {
  // The catalogue does not send back the page size and page count, so we get
  // to have fun with arithmetics
  let currentPage: number;
  let pageCount: number;
  if (resp.previous === null && resp.next === null) {
    // only one page
    currentPage = 1;
    pageCount = 1;
  } else if (resp.previous === null && resp.next !== null) {
    // first of several pages
    currentPage = 1;
    pageCount = ceil(resp.count / resp.results.length);
  } else if (resp.previous !== null && resp.next !== null) {
    // neither first nor last of several pages
    const previousPage = urlToPageNumber(resp.previous);
    currentPage = previousPage + 1;
    const pageSize = resp.results.length;
    pageCount = ceil(resp.count / pageSize);
  } else if (resp.previous !== null && resp.next === null) {
    // last of several pages
    const previousPage = urlToPageNumber(resp.previous);
    currentPage = previousPage + 1;
    pageCount = currentPage;
  } else {
    throw Error(`Unexpected pagination: ${resp}`);
  }
  return [currentPage, pageCount];
}

export async function getCellsFromCatalogue(
  url: string
): Promise<ICellsCatalogueResponse> {
  const resp = await NaaVREExternalService('GET', url, {
    accept: 'application/json'
  });
  if (resp.status_code !== 200) {
    throw `${resp.status_code} ${resp.reason}`;
  }
  return JSON.parse(resp.content);
}

export async function getCellsFromCatalogueMock(
  url: string
): Promise<ICellsCatalogueResponse> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    count: 2,
    next: null,
    previous: null,
    results: [
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
        next_version: null
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
        next_version: null
      }
    ]
  };
}
