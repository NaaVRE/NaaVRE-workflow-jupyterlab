import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Contents } from '@jupyterlab/services';

import { ISettings } from '../../settings';
import { IVizPanelProps, VizPanel } from './VizPanel';

export class VizPanelWidget extends ReactWidget {
  private readonly props: IVizPanelProps;

  constructor(
    runId: string,
    runUrl: string,
    settings: ISettings,
    contentsManager: Contents.IManager
  ) {
    super();
    this.props = { runId, runUrl, settings, contentsManager };
    this.id = `naavre-viz-panel-${runId}`;
    this.title.label = `Viz: ${runId.slice(0, 8)}…`;
    this.title.closable = true;
    this.addClass('naavre-viz-panel');
  }

  render(): React.ReactElement {
    return React.createElement(VizPanel, this.props);
  }
}
