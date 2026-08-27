import { FdoVizKind } from '../../utils/specialCells';

// Crates may come from an older extension version, so a kind we no longer
// recognise must degrade to 'custom' rather than break the whole panel.
export type VizKind = FdoVizKind | 'custom';

export interface IRoCrateOutput {
  id: string;
  encodingFormat: string;
  vizKind: VizKind;
}

/**
 * Extract the outputs an fdo-writer declared, from the RO-Crate written by
 * NaaVRE-workflow-service's fdo_writer_logic.j2.
 */
export function parseRoCrate(json: unknown): IRoCrateOutput[] {
  if (!json || typeof json !== 'object') {
    return [];
  }
  const root = json as Record<string, unknown>;
  const graph = root['@graph'];
  if (!Array.isArray(graph)) {
    return [];
  }
  return graph
    .filter((entity: unknown): entity is Record<string, unknown> => {
      if (!entity || typeof entity !== 'object') {
        return false;
      }
      const e = entity as Record<string, unknown>;
      const type = e['@type'];
      const isFile =
        type === 'File' || (Array.isArray(type) && type.includes('File'));
      return isFile && typeof e['naavre:vizKind'] === 'string';
    })
    .map(e => ({
      id: String(e['@id'] ?? ''),
      encodingFormat: String(e['encodingFormat'] ?? ''),
      vizKind: (e['naavre:vizKind'] as VizKind) ?? 'custom'
    }));
}
