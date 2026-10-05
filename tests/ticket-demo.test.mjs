import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('the demo runs the checked-out calculation and reports a real failing contribution', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'roi-ticket-demo-'));
  try {
    await mkdir(path.join(directory, 'src'));
    await mkdir(path.join(directory, 'scripts'));
    const checker = await readFile(new URL('../scripts/check-ticket-total.mjs', import.meta.url), 'utf8');
    await writeFile(path.join(directory, 'scripts/check-ticket-total.mjs'), checker);
    const summaryPath = path.join(directory, 'summary.md');
    for (const [source, expectedStatus, expectedResult] of [
      ['../src/ticket-total.mjs', 0, 60],
      ['../examples/broken-ticket-total.mjs.txt', 1, 23],
    ]) {
      await writeFile(path.join(directory, 'src/ticket-total.mjs'), await readFile(new URL(source, import.meta.url), 'utf8'));
      await writeFile(summaryPath, '');
      const result = spawnSync(process.execPath, ['scripts/check-ticket-total.mjs'], { cwd: directory, env: { GITHUB_STEP_SUMMARY: summaryPath }, encoding: 'utf8' });
      assert.equal(result.status, expectedStatus, result.stderr);
      assert.match(result.stdout, new RegExp(`expected \\$60; contribution returned \\$${expectedResult}`));
      const summary = await readFile(summaryPath, 'utf8');
      assert.match(summary, /CI tested the contributor/);
      assert(summary.includes(expectedStatus === 1 ? 'Tests failed' : 'Tests passed'));
      assert.match(summary, /separate trusted workflow labels and comments/);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
