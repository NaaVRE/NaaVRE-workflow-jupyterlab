import { CommandRegistry } from '@lumino/commands';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { WorkflowWidget } from './widget';
import { launcherIcon } from './icons';

export namespace CommandIDs {
  export const createNew = 'create-vre-composer';
}

export namespace Commands {
  async function createNew(
    commands: CommandRegistry,
    cwd: string,
    FACTORY: string
  ) {
    const model = await commands.execute('docmanager:new-untitled', {
      path: cwd,
      type: 'file',
      ext: 'naavrewf'
    });
    if (model !== undefined) {
      const widget = (await commands.execute('docmanager:open', {
        path: model.path,
        factory: FACTORY
      })) as unknown as WorkflowWidget;
      widget.isUntitled = true;
      return widget;
    }
  }

  export function addCommands(
    commands: CommandRegistry,
    browserFactory: IFileBrowserFactory,
    FACTORY: string
  ) {
    commands.addCommand(CommandIDs.createNew, {
      label: 'Experiment Manager',
      caption: 'Launch Workflow Composition',
      icon: args => (args['isPalette'] ? null : launcherIcon),
      execute: args => {
        return createNew(
          commands,
          (args.cwd || browserFactory.defaultBrowser.model.path) as string, // FIXME
          FACTORY
        );
      }
    });
  }
}