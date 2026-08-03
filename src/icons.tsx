import { LabIcon } from '@jupyterlab/ui-components';

import launcherIconSvgStr from '../style/icons/launcher-icon.svg';
import panelIconSvgStr from '../style/icons/panel-icon.svg';
import pastRunsIconSvgStr from '../style/icons/past-runs-icon.svg';

export const launcherIcon = new LabIcon({
  name: 'launcher-icon',
  svgstr: launcherIconSvgStr
});

export const panelIcon = new LabIcon({
  name: 'panel-icon',
  svgstr: panelIconSvgStr
});

export const pastRunsIcon = new LabIcon({
  name: 'past-runs-icon',
  svgstr: pastRunsIconSvgStr
});
