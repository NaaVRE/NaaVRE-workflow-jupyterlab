import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  createToolbarFactory,
  IToolbarWidgetRegistry,
  IWidgetTracker,
  ToolbarRegistry,
  WidgetTracker
} from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { Token } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator } from '@jupyterlab/translation';
import { IObservableList } from '@jupyterlab/observables';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { WorkflowModelFactory, WorkflowWidgetFactory } from './factory';
import { WorkflowWidget } from './widget';
import { ISettings } from './settings';
import { ToolbarItems } from './toolbarItems';
import { Commands, CommandIDs } from './commands';
import { pastRunsIcon } from './icons';
import { VizPanelWidget } from './components/vizPanel/VizPanelWidget';
import {
  PastRunsWidget,
  PAST_RUNS_WIDGET_ID
} from './components/vizPanel/PastRunsWidget';

/**
 * The name of the factory that creates editor widgets.
 */
const FACTORY = 'NaaVRE workflow editor';

// Export a token so other extensions can require it
export const IWorkflowTracker = new Token<IWidgetTracker<WorkflowWidget>>(
  'naavrewfDocTracker'
);

/**
 * Initialization data for the documents extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: '@naavre/workflow-jupyterlab:plugin',
  autoStart: true,
  requires: [
    ILayoutRestorer,
    ILauncher,
    ITranslator,
    IToolbarWidgetRegistry,
    ISettingRegistry,
    IFileBrowserFactory
  ],
  optional: [],
  provides: IWorkflowTracker,
  activate: (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    launcher: ILauncher,
    translator: ITranslator,
    toolbarRegistry: IToolbarWidgetRegistry | null,
    settingRegistry: ISettingRegistry | null,
    browserFactory: IFileBrowserFactory
  ) => {
    console.log(
      'JupyterLab extension @naavre/workflow-jupyterlab is activated!'
    );
    Commands.addCommands(app.commands, browserFactory, FACTORY);

    const namespace = 'documents-naavrewf';
    const tracker = new WidgetTracker<WorkflowWidget>({ namespace });

    app.commands.addCommand(CommandIDs.openVizPanel, {
      label: 'Open Viz Panel',
      execute: (args: Record<string, unknown>) => {
        const runId = String(args['runId'] ?? '');
        const runUrl = String(args['runUrl'] ?? '');
        const settings: ISettings =
          tracker.currentWidget?.content.settings ?? {};

        const existingPanel = Array.from(app.shell.widgets('main')).find(
          (w: Widget) => w.id === `naavre-viz-panel-${runId}`
        );
        if (existingPanel) {
          app.shell.activateById(existingPanel.id);
          return;
        }

        const panel = new VizPanelWidget(
          runId,
          runUrl,
          settings,
          app.serviceManager.contents
        );
        app.shell.add(panel, 'main');
        app.shell.activateById(panel.id);
      }
    });

    app.commands.addCommand(CommandIDs.browsePastRuns, {
      label: 'Browse past run results',
      icon: args => (args['isPalette'] ? undefined : pastRunsIcon),
      execute: () => {
        const existing = Array.from(app.shell.widgets('main')).find(
          (w: Widget) => w.id === PAST_RUNS_WIDGET_ID
        );
        if (existing) {
          app.shell.activateById(existing.id);
          return;
        }

        const browser = new PastRunsWidget(
          app.serviceManager.contents,
          (runId: string) => {
            app.commands.execute(CommandIDs.openVizPanel, {
              runId,
              runUrl: ''
            });
          }
        );
        app.shell.add(browser, 'main');
        app.shell.activateById(browser.id);
      }
    });

    if (launcher) {
      launcher.add({
        command: CommandIDs.createNew,
        category: 'VRE Components',
        rank: 0
      });
      launcher.add({
        command: CommandIDs.browsePastRuns,
        category: 'VRE Components',
        rank: 1
      });
    }

    // Toolbar
    let toolbarFactory:
      | ((widget: Widget) => IObservableList<ToolbarRegistry.IToolbarItem>)
      | undefined;
    // Register notebook toolbar specific widgets
    if (toolbarRegistry) {
      toolbarRegistry.registerFactory<WorkflowWidget>(
        FACTORY,
        'saveWorkflow',
        widget => ToolbarItems.createSaveButton(widget, app.commands)
      );
      toolbarRegistry.registerFactory<WorkflowWidget>(
        FACTORY,
        'exportWorkflow',
        widget => ToolbarItems.createExportButton(widget, browserFactory)
      );
      toolbarRegistry.registerFactory<WorkflowWidget>(
        FACTORY,
        'runWorkflow',
        widget =>
          ToolbarItems.createRunButton(
            widget,
            (runId: string, runUrl: string) => {
              app.commands.execute(CommandIDs.openVizPanel, { runId, runUrl });
            }
          )
      );
      if (settingRegistry) {
        toolbarFactory = createToolbarFactory(
          toolbarRegistry,
          settingRegistry,
          FACTORY,
          extension.id,
          translator
        );
      }
    }

    // Handle state restoration.
    if (restorer) {
      // When restoring the app, if the document was open, reopen it
      restorer.restore(tracker, {
        command: 'docmanager:open',
        args: widget => ({ path: widget.context.path, factory: FACTORY }),
        name: widget => widget.context.path
      });
    }

    // Load settings
    function loadSettings(settings: ISettingRegistry.ISettings): void {
      tracker.currentWidget?.updateSettings(
        settings.composite as Partial<ISettings>
      );
    }
    if (settingRegistry) {
      Promise.all([app.restored, settingRegistry.load(extension.id)])
        .then(([, settings]) => {
          loadSettings(settings);
          settings.changed.connect(loadSettings);
          tracker.currentChanged.connect(() => loadSettings(settings));
        })
        .catch(reason => {
          console.error(
            'Failed to load settings for @naavre/containerizer-jupyterlab.',
            reason
          );
        });
    }

    // register the filetype
    app.docRegistry.addFileType({
      name: 'naavrewf',
      displayName: 'NaaVRE Workflow',
      mimeTypes: ['text/json', 'application/json'],
      extensions: ['.naavrewf'],
      fileFormat: 'text',
      contentType: 'naavrewfdoc' as any
    });

    // Creating and registering the model factory for our custom DocumentModel
    const modelFactory = new WorkflowModelFactory();
    app.docRegistry.addModelFactory(modelFactory);

    // Creating the widget factory to register it so the document manager knows about
    // our new DocumentWidget
    const widgetFactory = new WorkflowWidgetFactory({
      name: FACTORY,
      modelName: 'naavrewf-model',
      fileTypes: ['naavrewf'],
      defaultFor: ['naavrewf'],
      toolbarFactory: toolbarFactory
    });

    // Add the widget to the tracker when it's created
    widgetFactory.widgetCreated.connect((sender, widget) => {
      // Notify the instance tracker if restore data needs to update.
      widget.context.pathChanged.connect(() => {
        tracker.save(widget);
      });
      tracker.add(widget);
    });

    // Registering the widget factory
    app.docRegistry.addWidgetFactory(widgetFactory);
  }
};

export default extension;
