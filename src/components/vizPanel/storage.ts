export const STORAGE_BASE = 'Cloud Storage/naa-vre-user-data';
export const RUNS_PREFIX = 'naavre-runs';

export function runsDirPath(): string {
  return `${STORAGE_BASE}/${RUNS_PREFIX}`;
}

export function cratePath(runId: string): string {
  return `${runsDirPath()}/${runId}/ro-crate-metadata.json`;
}

export function outputPath(runId: string, outputId: string): string {
  return `${runsDirPath()}/${runId}/${outputId}`;
}
