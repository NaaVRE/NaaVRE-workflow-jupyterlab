import * as path from 'path';
import * as fs from 'fs';
import { expect, galata, test } from '@jupyterlab/galata';

const workflowsDir = path.resolve(__dirname, '../test-assets/workflows');
const workflowFiles = fs
  .readdirSync(workflowsDir)
  .filter(f => f.endsWith('.naavrewf'));

test.use({ tmpPath: 'test-workflows' });

test.describe('Open workflows files', () => {
  test.beforeAll(async ({ request, tmpPath }) => {
    const contents = galata.newContentsHelper(request);
    for (const workflowFile of workflowFiles) {
      await contents.uploadFile(
        path.join(workflowsDir, workflowFile),
        `${tmpPath}/${workflowFile}`
      );
    }
  });

  test.afterAll(async ({ request, tmpPath }) => {
    const contents = galata.newContentsHelper(request);
    await contents.deleteDirectory(tmpPath);
  });

  workflowFiles.forEach(workflowFile => {
    test(`Opening ${workflowFile}`, async ({ page, tmpPath }) => {
      await page.goto();
      await page.getByRole('tab', { name: 'File Browser (Ctrl+Shift+F)' }).click();

      await page.evaluate(async (filePath: string) => {
        await (window as any).jupyterapp.commands.execute('docmanager:open', {
          path: filePath
        });
      }, `${tmpPath}/${workflowFile}`);

      await page
        .getByRole('tab', { name: workflowFile })
        .waitFor({ state: 'visible' });
      await page
        .locator('.MuiSkeleton-root')
        .first()
        .waitFor({ state: 'hidden' });

      await expect(page.getByRole('tab', { name: workflowFile })).toBeVisible();
      await expect(page.locator('.vre-composer')).toBeVisible();
      await expect(page.getByText('Workflow Components Catalog')).toBeVisible();

      await page.getByRole('button', { name: 'Run' }).click();
      await expect(page.getByRole('heading', { name: 'Run Workflow' })).toBeVisible();
    });
  });
});
