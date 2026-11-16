import { NaaVREExternalService } from '@naavre/communicator-jupyterlab';
import { ceil } from 'lodash';
import { ICell } from '../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import { ISettings } from '../settings';

export interface ICatalogueListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<T>;
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

export function getPageNumberAndCount(resp: ICatalogueListResponse<any>) {
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

export async function fetchListPageFromCatalogue<T>(
  url: string
): Promise<ICatalogueListResponse<T>> {
  const resp = await NaaVREExternalService('GET', url, {
    accept: 'application/json'
  });
  if (resp.status_code !== 200) {
    throw `${resp.status_code} ${resp.reason}`;
  }
  return JSON.parse(resp.content);
}

export async function fetchListFromCatalogue<T>(
  url: string,
  getAllPages?: boolean
): Promise<ICatalogueListResponse<T>> {
  let pageContent = await fetchListPageFromCatalogue<T>(url);
  if (!getAllPages) {
    return pageContent;
  } else {
    const content: ICatalogueListResponse<T> = {
      count: pageContent.count,
      next: null,
      previous: null,
      results: pageContent.results
    };
    while (pageContent.next !== null) {
      pageContent = await fetchListPageFromCatalogue<T>(pageContent.next);
      content.results = content.results.concat(pageContent.results);
    }
    return content;
  }
}

export async function isCellNameAvailable(
  title: string,
  settings: ISettings,
  excludeCellUrl?: string
): Promise<boolean> {
  if (!settings.catalogueServiceUrl) {
    throw Error('Catalogue service URL is not configured');
  }

  const cells = await fetchListFromCatalogue<ICell>(
    `${settings.catalogueServiceUrl}/workflow-cells/`,
    true
  );
  return !cells.results.some(
    cell => cell.title === title && cell.url !== excludeCellUrl
  );
}

export async function postDraftCellToCatalogue(
  cell: ICell,
  settings: ISettings
): Promise<ICell> {
  if (!settings.catalogueServiceUrl) {
    throw Error('Catalogue service URL is not configured');
  }

  let existingDraft: ICell | undefined;
  let existingCellWithTitle: ICell | undefined;
  if (cell.url === 'draft') {
    const cells = await fetchListFromCatalogue<ICell>(
      `${settings.catalogueServiceUrl}/workflow-cells/`,
      true
    );
    existingDraft = cells.results.find(
      catalogueCell =>
        catalogueCell.title === cell.title && catalogueCell.is_draft === true
    );
    existingCellWithTitle = cells.results.find(
      catalogueCell => catalogueCell.title === cell.title
    );
  }

  if (existingCellWithTitle && !existingDraft) {
    throw Error(`A catalogue cell named "${cell.title}" already exists`);
  }

  const versionOneUrl =
    cell.versions?.find(version => version.version === 1)?.url ??
    existingDraft?.versions?.find(version => version.version === 1)?.url;
  const targetUrl =
    cell.url !== 'draft'
      ? (versionOneUrl ?? cell.url)
      : (versionOneUrl ?? existingDraft?.url);
  const isUpdate = targetUrl !== undefined;

  const payload: Partial<ICell> = { ...cell };
  delete payload.version;
  delete payload.versions;
  delete payload.url;
  if (isUpdate) {
    payload.version = 1;
  }
  const resp = await NaaVREExternalService(
    isUpdate ? 'PATCH' : 'POST',
    targetUrl ?? `${settings.catalogueServiceUrl}/workflow-cells/`,
    {},
    {
      ...payload,
      description: cell.title,
      virtual_lab: settings.virtualLab || undefined
    }
  );
  if (resp.status_code !== (isUpdate ? 200 : 201)) {
    throw `${resp.status_code} ${resp.reason}`;
  }
  const savedCell: ICell = JSON.parse(resp.content);
  return {
    ...savedCell,
    version: 1,
    versions: savedCell.versions?.filter(version => version.version === 1)
  };
}
