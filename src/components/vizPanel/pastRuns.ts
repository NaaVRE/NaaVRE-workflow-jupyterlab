import { Contents } from '@jupyterlab/services';

import { runsDirPath } from './storage';

export interface IPastRun {
  runId: string;
  lastModified: string;
}

export async function listPastRuns(
  contentsManager: Contents.IManager
): Promise<IPastRun[]> {
  let listing: Contents.IModel;
  try {
    listing = await contentsManager.get(runsDirPath(), { content: true });
  } catch {
    return [];
  }

  const content = listing.content;
  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .filter((m: Contents.IModel) => m.type === 'directory')
    .map((m: Contents.IModel) => ({
      runId: m.name,
      lastModified: m.last_modified
    }))
    .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
}
