import { ceil } from 'lodash';
import { NaaVREExternalService } from '@naavre/communicator-jupyterlab';
import {
  getPageNumberAndCount,
  isCellNameAvailable,
  upsertDraftCellInCatalogue,
  urlToPageNumber
} from './catalog';
import { ISettings } from '../settings';

jest.mock('@naavre/communicator-jupyterlab', () => ({
  NaaVREExternalService: jest.fn()
}));

const mockExternalService = jest.mocked(NaaVREExternalService);

describe('isCellNameAvailable', () => {
  const settings: ISettings = {
    catalogueServiceUrl: 'https://catalogue.example'
  };

  beforeEach(() => {
    mockExternalService.mockReset();
  });

  test('checks every catalogue page for an existing title', async () => {
    mockExternalService
      .mockResolvedValueOnce({
        status_code: 200,
        reason: 'OK',
        headers: {},
        content: JSON.stringify({
          count: 2,
          next: 'https://catalogue.example/workflow-cells/?page=2',
          previous: null,
          results: [{ title: 'other-cell', url: '/cells/1/' }]
        })
      })
      .mockResolvedValueOnce({
        status_code: 200,
        reason: 'OK',
        headers: {},
        content: JSON.stringify({
          count: 2,
          next: null,
          previous: 'https://catalogue.example/workflow-cells/',
          results: [{ title: 'existing-cell', url: '/cells/2/' }]
        })
      });

    await expect(isCellNameAvailable('existing-cell', settings)).resolves.toBe(
      false
    );
    expect(mockExternalService).toHaveBeenCalledTimes(2);
  });

  test('reports a title as unavailable when it exists in the catalogue', async () => {
    mockExternalService.mockResolvedValueOnce({
      status_code: 200,
      reason: 'OK',
      headers: {},
      content: JSON.stringify({
        count: 1,
        next: null,
        previous: null,
        results: [{ title: 'current-cell', url: '/cells/current/' }]
      })
    });

    await expect(isCellNameAvailable('current-cell', settings)).resolves.toBe(
      false
    );
  });
});

describe('upsertDraftCellInCatalogue', () => {
  const settings: ISettings = {
    catalogueServiceUrl: 'https://catalogue.example'
  };
  const cell = {
    url: 'https://catalogue.example/workflow-cells/draft-1/',
    title: 'draft-cell',
    container_image: null,
    dependencies: [],
    inputs: [],
    outputs: [],
    confs: [],
    params: [],
    secrets: [],
    is_draft: true
  };
  const savedCell = {
    ...cell,
    version: 1,
    versions: [{ version: 1, url: cell.url }]
  };

  beforeEach(() => {
    mockExternalService.mockReset();
  });

  test('updates an existing draft using PATCH to its v1 URL', async () => {
    mockExternalService.mockResolvedValueOnce({
      status_code: 200,
      reason: 'OK',
      headers: {},
      content: JSON.stringify(savedCell)
    });

    await upsertDraftCellInCatalogue(cell, settings);

    expect(mockExternalService).toHaveBeenCalledTimes(1);
    expect(mockExternalService.mock.calls[0][0]).toBe('PATCH');
    expect(mockExternalService.mock.calls[0][1]).toBe(cell.url);
    expect(mockExternalService.mock.calls[0][3]).toMatchObject({
      version: 1,
      title: cell.title
    });
  });

  test('creates a draft only when no same-title cell exists', async () => {
    mockExternalService
      .mockResolvedValueOnce({
        status_code: 200,
        reason: 'OK',
        headers: {},
        content: JSON.stringify({
          count: 0,
          next: null,
          previous: null,
          results: []
        })
      })
      .mockResolvedValueOnce({
        status_code: 201,
        reason: 'Created',
        headers: {},
        content: JSON.stringify(savedCell)
      });

    await upsertDraftCellInCatalogue(
      { ...cell, url: 'new-draft-component' },
      settings
    );

    expect(mockExternalService).toHaveBeenCalledTimes(2);
    expect(mockExternalService.mock.calls[1][0]).toBe('POST');
    expect(mockExternalService.mock.calls[1][1]).toBe(
      'https://catalogue.example/workflow-cells/'
    );
    expect(mockExternalService.mock.calls[1][3]).not.toHaveProperty('url');
  });

  test('rejects inserting a new draft when a cell with the same title exists', async () => {
    const existingDraft = {
      ...savedCell,
      url: 'https://catalogue.example/workflow-cells/existing-draft/',
      versions: [
        {
          version: 1,
          url: 'https://catalogue.example/workflow-cells/existing-draft/'
        }
      ]
    };
    mockExternalService.mockResolvedValueOnce({
      status_code: 200,
      reason: 'OK',
      headers: {},
      content: JSON.stringify({
        count: 1,
        next: null,
        previous: null,
        results: [existingDraft]
      })
    });

    await expect(
      upsertDraftCellInCatalogue(
        { ...cell, url: 'new-draft-component' },
        settings
      )
    ).rejects.toThrow('A workflow component named "draft-cell" already exists in the catalogue');
    expect(mockExternalService).toHaveBeenCalledTimes(1);
  });

  test('does not insert a draft when a non-draft cell already has its title', async () => {
    mockExternalService.mockResolvedValueOnce({
      status_code: 200,
      reason: 'OK',
      headers: {},
      content: JSON.stringify({
        count: 1,
        next: null,
        previous: null,
        results: [{ ...cell, is_draft: false }]
      })
    });

    await expect(
      upsertDraftCellInCatalogue(
        { ...cell, url: 'new-draft-component' },
        settings
      )
    ).rejects.toThrow('A workflow component named "draft-cell" already exists in the catalogue');
    expect(mockExternalService).toHaveBeenCalledTimes(1);
  });
});

test.each([
  { url: 'https://example.com/path/to/', pageNumber: 1 },
  { url: 'https://example.com/path/to/?page=7', pageNumber: 7 },
  { url: 'https://example.com/path/to/?page=43', pageNumber: 43 },
  { url: 'https://example.com/path/to/?page=355', pageNumber: 355 }
])('get page number from URL', ({ url, pageNumber }) => {
  expect(urlToPageNumber(url)).toBe(pageNumber);
});

describe('get current page number and page count', () => {
  [
    { itemCount: 0, pageSize: 10 },
    { itemCount: 1, pageSize: 10 },
    { itemCount: 5, pageSize: 10 },
    { itemCount: 9, pageSize: 10 },
    { itemCount: 10, pageSize: 10 },
    { itemCount: 11, pageSize: 10 },
    { itemCount: 19, pageSize: 10 },
    { itemCount: 20, pageSize: 10 },
    { itemCount: 21, pageSize: 10 },
    { itemCount: 24, pageSize: 10 },
    { itemCount: 34, pageSize: 10 }
  ].forEach(({ itemCount, pageSize }) => {
    const pageCount = itemCount === 0 ? 1 : ceil(itemCount / pageSize);
    for (let currentPage = 1; currentPage <= pageCount; currentPage++) {
      test(`${itemCount} items - page ${currentPage} of ${pageCount}`, () => {
        const currentPageSize =
          currentPage === pageCount
            ? itemCount - pageSize * (pageCount - 1)
            : pageSize;
        const resp = {
          count: itemCount,
          previous:
            currentPage === 1
              ? null
              : currentPage === 2
                ? 'https://example.com/path/to/'
                : `https://example.com/path/to/?page=${currentPage - 1}`,
          next: currentPage === pageCount ? null : `?page=${currentPage + 1}`,
          results: Array(currentPageSize)
        };
        console.debug(resp);
        expect(getPageNumberAndCount(resp)).toStrictEqual([
          currentPage,
          pageCount
        ]);
      });
    }
  });
});
