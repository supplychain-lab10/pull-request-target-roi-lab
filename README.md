# Test the code. Triage the PR.

**One contribution, two useful jobs, different trust boundaries.**

The application sells tickets. Three tickets at $20 each should cost $60. A
contributor accidentally replaces multiplication with addition, producing $23.

| Job | What the audience sees | Why it exists |
| --- | --- | --- |
| **01 — Test the contributor's code** | A red check: $60 expected, $23 returned | Catch a broken contribution before merging |
| **02 — Label and comment using trusted code** | Labels and a short “The bot handled the paperwork” comment | Save the maintainer from manually classifying and responding to every PR |

**The takeaway:** testing needs the contributor's code; triage needs the
repository's permission. Those jobs do not need to run together.

## Five-minute conference demo

1. Show the base function in `src/ticket-total.mjs`: `return price * quantity`.
2. Ask: “What should three $20 tickets cost?”
3. Use the conference PR UI as arnabroy24 to open a PR into the public
   supplychain-lab10 repository. Its payload changes the function to
   `return price + quantity` and adds a short docs explanation. For manual PR
   creation, copy `examples/broken-ticket-total.mjs.txt` into the source file.
4. Stay on the PR conversation and show the bot's labels and short comment.
   It has handled the maintainer's paperwork without running the changed code.
5. If GitHub holds workflow 01, inspect the diff as the lab maintainer and approve
   the workflow run. Approval starts the check; it does not merge the PR.
6. Open workflow 01's job summary: **$60 expected, $23 returned**. The red check is
   the intended success of this demo: CI caught the contribution's bug.
7. Return to the bot comment and contrast the two useful jobs. Do not merge the
   deliberately broken PR; close it after the demonstration.

The bot's comment does not claim that CI has run or passed. GitHub may require
approval or delay either workflow, so inspect actual check status.

## The two workflows

`pull-request-context.yml` uses **pull_request**, checks out the proposed merge
revision and runs `scripts/check-ticket-total.mjs`. The checker imports the
proposed `src/ticket-total.mjs`, tests three examples, writes the job summary and
exits nonzero for an incorrect result. The workflow requests only
`contents: read`, does not persist checkout credentials and passes no secrets.

`pull-request-metadata.yml` uses **pull_request_target**, checks out trusted base
default-branch automation and executes `.github/scripts/triage.mjs`. It gets
changed filenames from the GitHub API, applies base-defined labels and posts a
comment. It requests `contents: read`, `issues: write` and `pull-requests: write`.
It does not check out, open or run the contributor's application files.

The source marker remains as supporting technical evidence inside the comment's
expandable section. Different marker strings are no longer the main teaching
device. The old context reporter remains available for technical exploration
but is not used by the conference workflow.

## Run locally

Node.js 20 or newer; no dependencies to install.

```bash
npm run demo:test
npm run preview
npm test
```

The base function should pass. Offline tests also execute the supplied broken
fixture and confirm the failure and audience-facing summary. Another test runs
trusted triage against a mock GitHub API and proves it labels/comments without
executing an application sentinel.

The optional `npm run roi` calculator remains available for maintainer time
savings; its illustrative numbers are not part of the live proof.

## Publish the revised lab

Publish this revision to the base repository's default branch before creating
the new demo PR. The conference UI checks for `src/ticket-total.mjs` and
`scripts/check-ticket-total.mjs` and stops if the published lab is still the old
marker-only version. Existing participant forks are synced before creating the
new demo branch.

Keep this a dedicated lab repository with Actions enabled, restricted default
workflow permissions and no configured repository or environment secrets. The
privileged workflow stays on trusted automation. The unsafe checkout example is
under `examples/` with a `.txt` extension, outside active workflows.

See [the facilitator guide](docs/FACILITATOR.md). GitHub documents
[fork approvals](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/approve-runs-from-forks)
and [pull_request_target security](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target).
