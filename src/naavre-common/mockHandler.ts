export interface INaaVREExternalServiceResponse {
  status_code: number;
  reason: string;
  headers: object;
  content: string;
}

const catalogueCellsGetResponse = JSON.stringify([
  {
    owner: 'test-user-2',
    virtual_lab: 'test-virtual-lab-1',
    base_container_image: {
      build: 'test-build-2',
      runtime: 'test-runtime-2'
    },
    dependencies: [
      {
        name: 'test-dependency-2',
        module: '',
        asname: ''
      }
    ],
    inputs: [
      {
        name: 'test-input-2',
        type: 'float'
      }
    ],
    outputs: [
      {
        name: 'test-output-2',
        type: 'int'
      }
    ],
    confs: [
      {
        name: 'test_conf_2',
        assignation: "test_conf_2 = 'abc'"
      }
    ],
    params: [
      {
        name: 'test_param_2',
        type: 'str',
        default_value: '"test"'
      }
    ],
    secrets: [
      {
        name: 'test-secret-2',
        type: 'str'
      }
    ],
    title: 'test-cell-2',
    description: '',
    container_image: 'test-image-2',
    kernel: '',
    source_url: ''
  }
]);

const catalogueWorkflowsPostResponse = JSON.stringify({
  url: 'https://example.org/workflows/abfd9752-0bea-4f3b-a26d-0f5bda1e22f0/',
  owner: 'test-user-2',
  virtual_lab: 'test-virtual-lab-1',
  title: 'test-workflow-1',
  description: '',
  source_url: '',
  run_url: '',
  status: '',
  progress: ''
});

const catalogueWorkflowsGetResponse = JSON.stringify({
  url: 'https://example.com/workflows/abfd9752-0bea-4f3b-a26d-0f5bda1e22f0/',
  owner: 'test-user-2',
  virtual_lab: 'test-virtual-lab-1',
  title: 'test-workflow-1',
  description: '',
  source_url: '',
  run_url: '',
  status: '',
  progress: ''
});

const workflowSubmitPostResponse = JSON.stringify({
  run_url: 'https://example.org/',
  naavrewf2: null
});

const workflowConvertPostResponse = 'workflow: invalid\n';

export async function MockNaaVREExternalService(
  method: string,
  url: string,
  headers = {},
  data = {}
): Promise<INaaVREExternalServiceResponse> {
  const resp: INaaVREExternalServiceResponse = {
    status_code: 200,
    reason: '',
    headers: {},
    content: ''
  };

  if (url.match(/\/NaaVRE-catalogue-service\/workflow-cells\/$/)) {
    if (method === 'GET') {
      resp.content = catalogueCellsGetResponse;
    }
  } else if (url.match(/\/NaaVRE-catalogue-service\/workflows\/$/)) {
    if (method === 'POST') {
      resp.content = catalogueWorkflowsPostResponse;
    }
    if (method === 'GET') {
      resp.content = catalogueWorkflowsGetResponse;
    }
  } else if (url.match(/\/NaaVRE-workflow-service\/submit$/)) {
    if (method === 'POST') {
      resp.content = workflowSubmitPostResponse;
    }
  } else if (url.match(/\/NaaVRE-workflow-service\/convert$/)) {
    if (method === 'POST') {
      resp.content = workflowConvertPostResponse;
    }
  } else {
    resp.status_code = 404;
    resp.reason = 'Cannot mock this request';
  }

  console.log('Mocking NaaVREExternalService', {
    query: {
      method: method,
      url: url,
      headers: headers,
      data: data
    },
    response: resp
  });
  await new Promise(r => setTimeout(r, 500));
  return resp;
}
