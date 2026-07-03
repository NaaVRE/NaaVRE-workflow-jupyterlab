import * as path from 'path';
import * as fs from 'fs';
import { expect, test } from '@jupyterlab/galata';

const workflowsDir = path.resolve(__dirname, '../test-assets/workflows');
const workflowFiles = fs
  .readdirSync(workflowsDir)
  .filter(f => f.endsWith('.naavrewf'));

test.describe('Open workflows files', () => {
  workflowFiles.forEach(workflowFile => {
    test(`Opening ${workflowFile}`, async ({ page, tmpPath }) => {
      await page.contents.uploadFile(
        path.join(workflowsDir, workflowFile),
        `${tmpPath}/${workflowFile}`
      );

      await page.filebrowser.open(workflowFile);

      await page
        .getByRole('tab', { name: 'File Browser (Ctrl+Shift+F)' })
        .click();

      // workflow opens
      await expect(
        page.getByRole('tab', { name: workflowFile, exact: true })
      ).toBeVisible();
      await expect(page.locator('.vre-composer')).toBeVisible();
      await expect(page.getByText('Workflow Components Catalog')).toBeVisible();

      // catalogue finished loading
      await page
        .locator('.MuiSkeleton-root')
        .first()
        .waitFor({ state: 'hidden' });

      await page.getByRole('button', { name: 'Run', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Run Workflow' })
      ).toBeVisible();
    });
  });
});
