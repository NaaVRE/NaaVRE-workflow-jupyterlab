import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

/**
 * Initialization data for the @naavre/workflow-jupyterlab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@naavre/workflow-jupyterlab:plugin',
  description: 'NaaVRE workflow editor frontend on Jupyter Lab',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
    console.log('JupyterLab extension @naavre/workflow-jupyterlab is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('@naavre/workflow-jupyterlab settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for @naavre/workflow-jupyterlab.', reason);
        });
    }
  }
};

export default plugin;
