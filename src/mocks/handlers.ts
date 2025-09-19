import { delay, http, HttpResponse, matchRequestUrl } from 'msw';
import { INaaVREExternalServiceResponse } from '../naavre-common/handler';
import { getCellsList } from './catalogue-service/workflow-cells';

function getExternalServiceHandler(
  method: string,
  url: string,
  getExternalServiceResponse: (
    request: Request
  ) => INaaVREExternalServiceResponse
) {
  return async ({ request }: { request: Request }) => {
    const actualBody = await request.clone().json();
    const referenceUrl = new URL(url);
    const queryUrl = new URL(actualBody.query.url);
    if (actualBody.query.method !== method) {
      return;
    }
    if (
      !matchRequestUrl(queryUrl, referenceUrl.pathname, referenceUrl.origin)
    ) {
      return;
    }

    await delay(300);
    return HttpResponse.json(getExternalServiceResponse(request));
  };
}

export const externalServiceHandlers = [
  http.post(
    '/naavre-communicator/external-service',
    getExternalServiceHandler(
      'GET',
      'http://localhost:56848/workflow-cells/',
      getCellsList
    )
  )
];
