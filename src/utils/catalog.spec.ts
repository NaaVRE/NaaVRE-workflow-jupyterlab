import { ceil } from 'lodash';
import { NaaVREExternalService } from '@naavre/communicator-jupyterlab';
import {
  getPageNumberAndCount,
  isCellNameAvailable,
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

  test('ignores the cell being renamed', async () => {
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

    await expect(
      isCellNameAvailable('current-cell', settings, '/cells/current/')
    ).resolves.toBe(true);
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
