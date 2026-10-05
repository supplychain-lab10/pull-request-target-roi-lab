import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

test('trusted triage writes labels and a comment without executing the contributed application', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'roi-trusted-triage-'));
  const writes = [];
  const server = http.createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    let value;
    if (req.method === 'GET' && req.url.includes('/files?')) value = [{ filename: 'src/ticket-total.mjs' }, { filename: 'docs/conference-comparison.md' }];
    else if (req.method === 'GET' && req.url.includes('/labels/')) value = { name: 'label exists' };
    else if (req.method === 'POST') { writes.push({ route: req.url, body: JSON.parse(raw) }); value = {}; }
    else { res.writeHead(404).end('{}'); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(value));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    for (const folder of ['.github/scripts', 'lib', 'demo', 'src']) await mkdir(path.join(directory, folder), { recursive: true });
    for (const file of ['.github/scripts/triage.mjs', '.github/triage-policy.json', 'lib/triage-policy.mjs', 'demo/source-marker.txt']) {
      await writeFile(path.join(directory, file), await readFile(new URL(`../${file}`, import.meta.url)));
    }
    // If trusted triage ever imports the contribution, the sentinel exposes it.
    await writeFile(path.join(directory, 'src/ticket-total.mjs'), "import fs from 'node:fs'; fs.writeFileSync('contribution-executed', 'wrong boundary'); export const ticketTotal = () => 23;\n");
    const eventPath = path.join(directory, 'event.json');
    await writeFile(eventPath, JSON.stringify({ repository: { full_name: 'supplychain-lab10/pull-request-target-roi-lab' }, pull_request: { number: 7, user: { login: 'arnabroy24' }, head: { repo: { fork: true } } } }));
    const result = await new Promise(resolve => {
      const child = spawn(process.execPath, ['.github/scripts/triage.mjs'], { cwd: directory, env: { GH_TOKEN: 'test-only', GITHUB_EVENT_PATH: eventPath, GITHUB_API_URL: `http://127.0.0.1:${server.address().port}` } });
      let stderr = '';
      child.stderr.on('data', chunk => stderr += chunk);
      child.on('error', error => resolve({ code: -1, stderr: error.message }));
      child.on('close', code => resolve({ code, stderr }));
    });
    assert.equal(result.code, 0, result.stderr);
    await assert.rejects(access(path.join(directory, 'contribution-executed')));
    assert.deepEqual(writes.find(write => write.route.endsWith('/labels')).body.labels, ['area: documentation', 'area: source']);
    const comment = writes.find(write => write.route.endsWith('/comments')).body.body;
    assert.match(comment, /The bot handled the paperwork/);
    assert.match(comment, /did not open or execute the changed source files/);
    assert.match(comment, /does not claim that CI has completed or passed/);
  } finally { await new Promise(resolve => server.close(resolve)); await rm(directory, { recursive: true, force: true }); }
});
