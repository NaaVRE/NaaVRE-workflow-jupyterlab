import { MockNaaVREExternalService } from '../naavre-common/mockHandler';
import { NaaVRECatalogue } from '../naavre-common/types';
import ICell = NaaVRECatalogue.WorkflowCells.ICell;

export async function getCellsFromCatalogue(
  catalogueServiceUrl: string
): Promise<Array<ICell>> {
  const resp = await MockNaaVREExternalService(
    'GET',
    `${catalogueServiceUrl}/workflow-cells/`
  );
  if (resp.status_code !== 200) {
    throw `${resp.status_code} ${resp.reason}`;
  }
  return JSON.parse(resp.content);
}
