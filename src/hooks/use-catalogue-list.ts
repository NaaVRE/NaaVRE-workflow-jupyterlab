import { IWorkflowWidgetSettings } from '../widget';
import { ICatalogueListResponse } from '../utils/catalog';
import { useCallback, useEffect, useState } from 'react';

export function useCatalogueList<T>({
  settings,
  getFromCatalogue,
  initialPath
}: {
  settings: IWorkflowWidgetSettings;
  getFromCatalogue: (url: string) => Promise<ICatalogueListResponse<T>>;
  initialPath: string;
}) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [url, setUrl] = useState<string | null>(
    settings.catalogueServiceUrl
      ? `${settings.catalogueServiceUrl}/${initialPath}`
      : null
  );

  useEffect(() => {
    settings.catalogueServiceUrl &&
      setUrl(`${settings.catalogueServiceUrl}/${initialPath}`);
  }, [settings.catalogueServiceUrl]);

  const [response, setResponse] = useState<ICatalogueListResponse<T>>({
    count: 0,
    next: null,
    previous: null,
    results: []
  });

  const getCatalogItems = useCallback(() => {
    setErrorMessage && setErrorMessage(null);
    setLoading && setLoading(true);
    if (url) {
      getFromCatalogue(url)
        .then(resp => {
          setResponse(resp);
        })
        .catch(error => {
          const msg = `Error loading cells: ${String(error)}`;
          console.error(msg);
          setErrorMessage && setErrorMessage(msg);
        })
        .finally(() => {
          setLoading && setLoading(false);
        });
    }
  }, [url]);

  useEffect(() => getCatalogItems(), [getCatalogItems]);

  return {
    url,
    setUrl,
    loading,
    setLoading,
    errorMessage,
    setErrorMessage,
    getCatalogItems,
    response
  };
}
