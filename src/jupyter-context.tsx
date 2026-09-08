import { createContext } from 'react';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { ILabShell } from '@jupyterlab/application';

export interface IJupyterContext {
  browserFactory?: IFileBrowserFactory;
  docManager?: IDocumentManager;
  labShell?: ILabShell;
}

export const JupyterContext = createContext<IJupyterContext>({});
