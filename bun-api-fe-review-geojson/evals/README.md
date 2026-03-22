# Evals

Agentic evaluation suite for the GeoJSON review app. Tests both the programmatic APIs (`__appInspect`, `__mapInspect`) and Claude's ability to use them via surf-cli.

## Prerequisites

- **Bun** — runtime (`bun run dev` to start the app)
- **surf-cli** — browser automation CLI ([github.com/nichochar/surf](https://github.com/nichochar/surf))
- **Chrome** — running with at least one tab available for surf
- **claude CLI** — Anthropic CLI (agentic evals only), with `claude -p` support

## Running

```bash
# 1. Start the app
bun run dev

# 2. Run evals (separate terminal)
bun evals/run-evals.ts                  # all evals
bun evals/run-evals.ts --deterministic  # evals 1-6, no LLM (~30s)
bun evals/run-evals.ts --agentic        # evals 7-9, uses claude haiku (~1-2min)
```

Results are written to `evals/results.json`.

## Eval overview

### Deterministic (1-6)

Direct `surf js` calls against `window.__appInspect` and `window.__mapInspect`. No LLM involved.

| #   | Name                   | Tests                                                  |
| --- | ---------------------- | ------------------------------------------------------ |
| 1   | app-inspect-available  | `__appInspect` registers, `getPage()`, map API present |
| 2   | map-feature-navigation | `next()`, `prev()`, index tracking                     |
| 3   | map-flag-unflag        | `flag()` / `unflag()` toggle and restore               |
| 4   | cross-page-navigation  | `navigate()` across all 3 pages, data APIs on each     |
| 5   | map-inspect-viewport   | camera, style layers, viewport feature query           |
| 6   | accessibility-tree     | `surf read` shows all aria-labels                      |

### Agentic (7-9)

Give Claude a task prompt, let it interact with the app via surf-cli, assert on structured `RESULT:` output.

| #   | Name                   | Task                                                           |
| --- | ---------------------- | -------------------------------------------------------------- |
| 7   | agent-review-workflow  | Navigate to 3rd feature, report details, check results summary |
| 8   | agent-flag-feature     | Toggle flag on 4th feature, verify state change                |
| 9   | agent-table-inspection | Get table data, count flags, find largest population           |

## Configuration

| Env var   | Default                 | Description  |
| --------- | ----------------------- | ------------ |
| `APP_URL` | `http://localhost:5173` | App base URL |

Agentic evals use `claude -p --model haiku --max-budget-usd 0.50` with a 180s timeout per eval.
