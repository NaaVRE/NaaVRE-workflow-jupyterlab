import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Contents } from '@jupyterlab/services';

import { IPastRunsPanelProps, PastRunsPanel } from './PastRunsPanel';

export const PAST_RUNS_WIDGET_ID = 'naavre-past-runs';

export class PastRunsWidget extends ReactWidget {
  private readonly props: IPastRunsPanelProps;

  constructor(
    contentsManager: Contents.IManager,
    onOpenRun: (runId: string) => void
  ) {
    super();
    this.props = { contentsManager, onOpenRun };
    this.id = PAST_RUNS_WIDGET_ID;
    this.title.label = 'Past run results';
    this.title.closable = true;
    this.addClass('naavre-past-runs');
  }

  render(): React.ReactElement {
    return React.createElement(PastRunsPanel, this.props);
  }
}
