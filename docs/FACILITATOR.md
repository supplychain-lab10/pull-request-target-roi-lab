# Five-minute facilitator guide

## The audience's question

“Why have two PR workflows?”

Answer with a useful contribution check and a useful maintainer task. Start
with those jobs, then name the events. Do not open with a token-permission table
or ask the audience to interpret source-marker strings.

## Prepare

- Publish the revised base lab before using the updated conference UI.
- Verify the correct ticket function returns $60 for three $20 tickets.
- Have the supplychain-lab10 maintainer session and arnabroy24 PR UI ready.
- Prepare a completed rehearsal PR as a fallback. Expected output in this guide
  is not evidence that a hosted workflow ran.
- Keep repository secrets absent and workflow permissions as defined.

## Show and say

| Time | Show | Say |
| --- | --- | --- |
| 0:00–0:30 | Base `src/ticket-total.mjs` | “We sell tickets. Three tickets at twenty dollars should cost sixty.” |
| 0:30–1:00 | UI's two-file PR preview | “An outside contributor changed multiplication to addition. Should we run their code? For tests, yes.” |
| 1:00–2:00 | PR conversation and bot labels/comment | “Our bot has classified the change and replied. A maintainer no longer does that work manually.” |
| 2:00–2:30 | Approval prompt, if present | “GitHub asks before running the contributor's code. We inspect the diff and approve the test run. Nothing has merged.” |
| 2:30–3:30 | Workflow 01's job summary | “Sixty expected. Twenty-three returned. The red check caught the bug.” |
| 3:30–4:30 | Bot comment's comparison | “The test runs their code. The bot runs ours. Testing needs their code; writing this comment needs our permission.” |
| 4:30–5:00 | Two workflow headers, if helpful | “pull_request for testing. pull_request_target for trusted metadata automation. Trouble starts when their code gets our authority.” |

## Expected results

**Workflow 01:** executes the proposed calculator, reports $23 instead of $60
and fails. Its other examples also show incorrect results. A red check is
expected; do not change the test to pass the bug.

**Workflow 02:** applies `area: source` and `area: documentation` for the UI's
payload and posts “The bot handled the paperwork.” It does not execute the
contribution. Its comment proves a metadata write, not that CI completed.
Platform approval holds and policies can affect timing.

## What to skip

Skip the ROI calculator, full token table, source-marker comparison and long
Actions logs in the main demo. They are backup material. One code diff, one
failed-test summary and one bot comment should carry the story.

If a run queues or needs approval too long, use an actual completed rehearsal
and identify it as recorded evidence. Do not describe a pending run as executed.

## Close and bridge to the attack cases

“Both jobs are useful. Neither needs to run a stranger's code with maintainer
authority. Now let's see what happened when ordinary automation crossed that
boundary.”

Leave the broken PR unmerged. Close it after the demo and retain only the
intended conference evidence.
