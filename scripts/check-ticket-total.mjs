import fs from 'node:fs';
import { ticketTotal } from '../src/ticket-total.mjs';

// This script executes proposed application code, so it belongs only in the
// restricted pull_request workflow. It does not call GitHub or receive secrets.
const examples = [
  { price: 20, quantity: 3, expected: 60 },
  { price: 15, quantity: 2, expected: 30 },
  { price: 20, quantity: 0, expected: 0 },
];
const observations = examples.map(example => {
  let actual;
  try { actual = ticketTotal(example.price, example.quantity); }
  catch { actual = 'function threw an error'; }
  return { ...example, actual, passed: actual === example.expected };
});
const passed = observations.every(example => example.passed);
const display = value => String(value).slice(0, 100).replace(/[\r\n|<>`]/g, '?');
const first = observations[0];
console.log(`3 tickets at $20 each: expected $${first.expected}; contribution returned $${display(first.actual)}.`);
console.log(passed ? 'PASS: the proposed ticket calculation works.' : 'FAIL: the proposed ticket calculation is wrong. Do not merge this contribution.');

const summary = [
  '# 1. CI tested the contributor’s code',
  '',
  '**Three $20 tickets should cost $60.**',
  '',
  `The proposed code returned **$${display(first.actual)}**. ${passed ? '✅ Tests passed.' : '❌ Tests failed — CI caught the bug.'}`,
  '',
  '| Tickets | Price each | Expected | Proposed result |',
  '| --- | --- | --- | --- |',
  ...observations.map(example => `| ${example.quantity} | $${example.price} | $${example.expected} | $${display(example.actual)} |`),
  '',
  'This check ran `src/ticket-total.mjs` from the proposed PR revision.',
  'Its workflow requests only `contents: read`, passes no secrets and does not write labels or comments.',
  '',
  '**Now return to the PR conversation:** the separate trusted workflow labels and comments without executing this contribution.',
  '',
].join('\n');
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
if (!passed) process.exitCode = 1;
