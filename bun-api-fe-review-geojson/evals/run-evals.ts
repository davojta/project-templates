#!/usr/bin/env bun
/**
 * Agentic eval suite for bun-api-fe-review-geojson.
 *
 * Tests two modes:
 *   1. Deterministic — direct surf js calls against running app
 *   2. Agentic — give Claude a task prompt, let it use surf-cli, assert on outcomes
 *
 * Prerequisites:
 *   - App running: bun run dev
 *   - surf-cli available in PATH
 *   - For agentic evals: claude CLI available
 *
 * Usage:
 *   bun evals/run-evals.ts                  # all evals
 *   bun evals/run-evals.ts --deterministic  # deterministic only
 *   bun evals/run-evals.ts --agentic        # agentic only
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AssertionResult {
  check: string;
  passed: boolean;
  detail: string;
}

interface EvalResult {
  id: number;
  name: string;
  passed: boolean;
  assertions: AssertionResult[];
  claudeOutput?: string;
  durationMs?: number;
  error?: string;
}

interface EvalSuiteResult {
  timestamp: string;
  totalPassed: number;
  totalFailed: number;
  evals: EvalResult[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_URL = process.env.APP_URL || 'http://localhost:5173';

function surf(cmd: string, timeoutMs = 15_000): { ok: boolean; stdout: string; stderr: string } {
  try {
    const stdout = execSync(`surf ${cmd}`, {
      timeout: timeoutMs,
      encoding: 'utf-8',
      env: { ...process.env, NO_COLOR: '1' },
    });
    return { ok: true, stdout: stdout.trim(), stderr: '' };
  } catch (e: any) {
    return {
      ok: false,
      stdout: (e.stdout || '').trim(),
      stderr: (e.stderr || '').trim(),
    };
  }
}

function surfJs(code: string): string {
  const r = surf(`js "${code.replace(/"/g, '\\"')}"`);
  return r.stdout;
}

function surfNavigate(url: string): void {
  surf(`navigate "${url}"`);
}

function parseJson(raw: string): any {
  try {
    const cleaned = raw.startsWith('"') && raw.endsWith('"')
      ? JSON.parse(raw)
      : raw;
    return typeof cleaned === 'string' ? JSON.parse(cleaned) : cleaned;
  } catch {
    return null;
  }
}

function sleep(ms: number): void {
  execSync(`sleep ${ms / 1000}`);
}

function waitForJs(expr: string, expected: string, timeoutMs = 15_000): boolean {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = surfJs(expr);
    if (result.includes(expected)) return true;
    sleep(1000);
  }
  return false;
}

function runClaude(prompt: string, maxBudget = '0.50', timeoutMs = 180_000): { output: string; durationMs: number } {
  const systemSuffix = [
    'You MUST use surf-cli to interact with the browser.',
    'The app is running at ' + BASE_URL,
    'Use `surf js "return ..."` to call window.__appInspect and window.__mapInspect.',
    'Use `surf navigate "<url>"` to open pages.',
    'Use `surf read` to inspect the accessibility tree.',
    'Refer to CLAUDE.md for the full API reference.',
  ].join('\n');

  const fullPrompt = `${prompt}\n\n---\n${systemSuffix}`;

  const start = Date.now();
  try {
    const output = execSync(
      `claude -p --model haiku --dangerously-skip-permissions --output-format text --max-budget-usd ${maxBudget} --allowedTools 'Bash Read Glob Grep'`,
      {
        input: fullPrompt,
        timeout: timeoutMs,
        encoding: 'utf-8',
        cwd: join(import.meta.dir, '..'),
        env: { ...process.env, NO_COLOR: '1' },
      },
    );
    return { output: output.trim(), durationMs: Date.now() - start };
  } catch (e: any) {
    return { output: (e.stdout || e.message || '').trim(), durationMs: Date.now() - start };
  }
}

// ---------------------------------------------------------------------------
// Deterministic Evals
// ---------------------------------------------------------------------------

async function eval1_appInspectAvailable(): Promise<EvalResult> {
  const assertions: AssertionResult[] = [];

  surfNavigate(`${BASE_URL}/map`);
  sleep(3000);

  const typeOf = surfJs('return typeof window.__appInspect');
  assertions.push({
    check: '__appInspect is defined',
    passed: typeOf.includes('object'),
    detail: `typeof: ${typeOf}`,
  });

  const page = surfJs('return window.__appInspect.getPage()');
  assertions.push({
    check: 'getPage() returns map',
    passed: page.includes('map'),
    detail: `page: ${page}`,
  });

  const mapType = surfJs('return typeof window.__appInspect.map?.getFeatureDetails');
  assertions.push({
    check: 'map API registered',
    passed: mapType.includes('function'),
    detail: `typeof map.getFeatureDetails: ${mapType}`,
  });

  return {
    id: 1,
    name: 'app-inspect-available',
    passed: assertions.every((a) => a.passed),
    assertions,
  };
}

async function eval2_mapFeatureNavigation(): Promise<EvalResult> {
  const assertions: AssertionResult[] = [];

  surfNavigate(`${BASE_URL}/map`);
  sleep(3000);

  const details1Raw = surfJs('return JSON.stringify(window.__appInspect.map.getFeatureDetails())');
  const details1 = parseJson(details1Raw);
  assertions.push({
    check: 'getFeatureDetails returns feature at index 0',
    passed: details1?.index === 0 && details1?.total > 0,
    detail: `index=${details1?.index}, total=${details1?.total}`,
  });

  const nextResult = surfJs('return window.__appInspect.map.next()');
  assertions.push({
    check: 'next() returns true',
    passed: nextResult.includes('true'),
    detail: nextResult,
  });

  const details2Raw = surfJs('return JSON.stringify(window.__appInspect.map.getFeatureDetails())');
  const details2 = parseJson(details2Raw);
  assertions.push({
    check: 'after next(), index is 1',
    passed: details2?.index === 1,
    detail: `index=${details2?.index}`,
  });

  const prevResult = surfJs('return window.__appInspect.map.prev()');
  assertions.push({
    check: 'prev() returns true',
    passed: prevResult.includes('true'),
    detail: prevResult,
  });

  const details3Raw = surfJs('return JSON.stringify(window.__appInspect.map.getFeatureDetails())');
  const details3 = parseJson(details3Raw);
  assertions.push({
    check: 'after prev(), index is 0',
    passed: details3?.index === 0,
    detail: `index=${details3?.index}`,
  });

  return {
    id: 2,
    name: 'map-feature-navigation',
    passed: assertions.every((a) => a.passed),
    assertions,
  };
}

async function eval3_mapFlagUnflag(): Promise<EvalResult> {
  const assertions: AssertionResult[] = [];

  surfNavigate(`${BASE_URL}/map`);
  sleep(3000);

  // navigate to a feature and check its flag state, then toggle
  surfJs('return window.__appInspect.map.next()');
  sleep(500);
  const before = parseJson(surfJs('return JSON.stringify(window.__appInspect.map.getFeatureDetails())'));
  const wasFlagged = before?.isFlagged;

  if (wasFlagged) {
    const unflagResult = surfJs('return window.__appInspect.map.unflag()');
    assertions.push({ check: 'unflag() returns true when flagged', passed: unflagResult.includes('true'), detail: unflagResult });
    sleep(1000);
    const after = parseJson(surfJs('return JSON.stringify(window.__appInspect.map.getFeatureDetails())'));
    assertions.push({ check: 'isFlagged is false after unflag', passed: after?.isFlagged === false, detail: `isFlagged=${after?.isFlagged}` });
    // restore
    surfJs('return window.__appInspect.map.flag()');
    sleep(500);
  } else {
    const flagResult = surfJs('return window.__appInspect.map.flag()');
    assertions.push({ check: 'flag() returns true when unflagged', passed: flagResult.includes('true'), detail: flagResult });
    sleep(1000);
    const after = parseJson(surfJs('return JSON.stringify(window.__appInspect.map.getFeatureDetails())'));
    assertions.push({ check: 'isFlagged is true after flag', passed: !!after?.isFlagged, detail: `isFlagged=${after?.isFlagged}` });
    // restore
    surfJs('return window.__appInspect.map.unflag()');
    sleep(500);
  }

  return {
    id: 3,
    name: 'map-flag-unflag',
    passed: assertions.every((a) => a.passed),
    assertions,
  };
}

async function eval4_crossPageNavigation(): Promise<EvalResult> {
  const assertions: AssertionResult[] = [];

  surfNavigate(`${BASE_URL}/map`);
  sleep(3000);

  // navigate to table
  surfJs('window.__appInspect.navigate("table")');
  sleep(2000);

  const tablePage = surfJs('return window.__appInspect.getPage()');
  assertions.push({ check: 'navigated to table', passed: tablePage.includes('table'), detail: tablePage });

  const tableDataRaw = surfJs('return window.__appInspect.table.getData().length');
  const tableCount = parseInt(tableDataRaw.replace(/"/g, ''));
  assertions.push({
    check: 'table.getData() returns features',
    passed: tableCount > 0,
    detail: `count=${tableCount}`,
  });

  // navigate to results
  surfJs('window.__appInspect.navigate("results")');
  sleep(2000);

  const resultsPage = surfJs('return window.__appInspect.getPage()');
  assertions.push({ check: 'navigated to results', passed: resultsPage.includes('results'), detail: resultsPage });

  const summaryRaw = surfJs('return JSON.stringify(window.__appInspect.results.getSummary())');
  const summary = parseJson(summaryRaw);
  assertions.push({
    check: 'results.getSummary() returns valid summary',
    passed: summary?.total > 0 && typeof summary?.flagged === 'number',
    detail: `total=${summary?.total}, flagged=${summary?.flagged}`,
  });

  // navigate back to map
  surfJs('window.__appInspect.navigate("map")');
  sleep(2000);

  const mapPage = surfJs('return window.__appInspect.getPage()');
  assertions.push({ check: 'navigated back to map', passed: mapPage.includes('map'), detail: mapPage });

  return {
    id: 4,
    name: 'cross-page-navigation',
    passed: assertions.every((a) => a.passed),
    assertions,
  };
}

async function eval5_mapInspectViewport(): Promise<EvalResult> {
  const assertions: AssertionResult[] = [];

  surfNavigate(`${BASE_URL}/map`);
  sleep(3000);
  waitForJs('return typeof window.__mapInspect', 'object', 15_000);

  const cameraRaw = surfJs('return JSON.stringify(window.__mapInspect?.getCamera())');
  const camera = parseJson(cameraRaw);
  assertions.push({
    check: '__mapInspect.getCamera() returns valid camera',
    passed: camera?.center?.length === 2 && typeof camera?.zoom === 'number',
    detail: `center=${camera?.center}, zoom=${camera?.zoom}`,
  });

  const layersRaw = surfJs('return JSON.stringify(window.__mapInspect?.getLayers().filter(l => l.id.startsWith("geojson")))');
  const layers = parseJson(layersRaw);
  assertions.push({
    check: 'geojson layers exist',
    passed: Array.isArray(layers) && layers.length > 0,
    detail: `layers=${JSON.stringify(layers?.map((l: any) => l.id))}`,
  });

  const verifyRaw = surfJs(
    'return (async()=>{const r=await window.__mapInspect.verify({queries:[{name:"test",method:"viewport",options:{layers:["geojson-layer"],limit:5}}]});return JSON.stringify(r)})()',
  );
  const verify = parseJson(verifyRaw);
  assertions.push({
    check: 'verify() returns ok status',
    passed: verify?.status === 'ok',
    detail: `status=${verify?.status}`,
  });
  assertions.push({
    check: 'verify() returns feature query results',
    passed: verify?.queries?.[0]?.featureCount >= 0,
    detail: `featureCount=${verify?.queries?.[0]?.featureCount}`,
  });

  return {
    id: 5,
    name: 'map-inspect-viewport',
    passed: assertions.every((a) => a.passed),
    assertions,
  };
}

async function eval6_accessibilityTree(): Promise<EvalResult> {
  const assertions: AssertionResult[] = [];

  surfNavigate(`${BASE_URL}/map`);
  sleep(3000);

  const readResult = surf('read --depth 3 --compact');
  const tree = readResult.stdout;

  assertions.push({
    check: 'surf read returns content',
    passed: tree.length > 50,
    detail: `length=${tree.length}`,
  });

  const expectedLabels = ['nav-map', 'nav-table', 'nav-results', 'btn-back', 'btn-forward'];
  for (const label of expectedLabels) {
    assertions.push({
      check: `aria-label "${label}" visible in tree`,
      passed: tree.includes(label),
      detail: tree.includes(label) ? 'found' : 'missing',
    });
  }

  assertions.push({
    check: 'layer toggle checkbox visible',
    passed: tree.includes('layer-toggle-'),
    detail: tree.includes('layer-toggle-') ? 'found' : 'missing',
  });

  return {
    id: 6,
    name: 'accessibility-tree',
    passed: assertions.every((a) => a.passed),
    assertions,
  };
}

// ---------------------------------------------------------------------------
// Agentic Evals
// ---------------------------------------------------------------------------

async function eval7_agentReviewWorkflow(): Promise<EvalResult> {
  const assertions: AssertionResult[] = [];

  const prompt = `
You are testing a GeoJSON feature review app running at ${BASE_URL}.

Your task:
1. Open the map page
2. Read the current feature details using __appInspect
3. Navigate forward to the 3rd feature (index 2)
4. Report the feature name and whether it is flagged
5. Navigate to the results page
6. Report the total number of features and how many are flagged

Output your findings as a JSON object with this structure:
{
  "thirdFeature": { "name": "...", "isFlagged": true/false },
  "results": { "total": N, "flagged": N }
}

Print ONLY the JSON at the end, on a single line starting with RESULT:
`;

  const { output, durationMs } = runClaude(prompt, '0.50');

  const resultLine = output.split('\n').find((l) => l.startsWith('RESULT:'));
  const resultJson = resultLine ? parseJson(resultLine.replace('RESULT:', '').trim()) : null;

  assertions.push({
    check: 'Claude produced RESULT: line',
    passed: !!resultLine,
    detail: resultLine ? resultLine.slice(0, 200) : 'no RESULT: line found',
  });

  assertions.push({
    check: 'result has thirdFeature.name',
    passed: typeof resultJson?.thirdFeature?.name === 'string' && resultJson.thirdFeature.name.length > 0,
    detail: `name=${resultJson?.thirdFeature?.name}`,
  });

  assertions.push({
    check: 'result has results.total > 0',
    passed: resultJson?.results?.total > 0,
    detail: `total=${resultJson?.results?.total}`,
  });

  assertions.push({
    check: 'result has results.flagged as number',
    passed: typeof resultJson?.results?.flagged === 'number',
    detail: `flagged=${resultJson?.results?.flagged}`,
  });

  return {
    id: 7,
    name: 'agent-review-workflow',
    passed: assertions.every((a) => a.passed),
    assertions,
    claudeOutput: output.slice(-1000),
    durationMs,
  };
}

async function eval8_agentFlagFeature(): Promise<EvalResult> {
  const assertions: AssertionResult[] = [];

  // First, get current state of feature at index 3
  surfNavigate(`${BASE_URL}/map`);
  sleep(3000);
  surfJs('return window.__appInspect.map.next()');
  surfJs('return window.__appInspect.map.next()');
  surfJs('return window.__appInspect.map.next()');
  sleep(500);
  const beforeRaw = surfJs('return JSON.stringify(window.__appInspect.map.getFeatureDetails())');
  const before = parseJson(beforeRaw);
  const targetId = before?.id;
  const wasFlagged = !!before?.isFlagged;

  const action = wasFlagged ? 'unflag' : 'flag';

  const prompt = `
You are testing a GeoJSON feature review app running at ${BASE_URL}.

Your task:
1. Open the map page
2. Navigate to the 4th feature (index 3) using __appInspect.map.next()
3. ${action} it using __appInspect.map.${action}()
4. Verify the flag state changed by calling getFeatureDetails()
5. Print the result as: RESULT: {"id": "...", "isFlagged": true/false}
`;

  const { output, durationMs } = runClaude(prompt, '0.50');

  const resultLine = output.split('\n').find((l) => l.startsWith('RESULT:'));
  const resultJson = resultLine ? parseJson(resultLine.replace('RESULT:', '').trim()) : null;

  assertions.push({
    check: 'Claude produced RESULT: line',
    passed: !!resultLine,
    detail: resultLine ? resultLine.slice(0, 200) : 'no RESULT: line found',
  });

  assertions.push({
    check: `feature id matches target (${targetId})`,
    passed: resultJson?.id === targetId,
    detail: `expected=${targetId}, got=${resultJson?.id}`,
  });

  const expectedFlag = !wasFlagged;
  assertions.push({
    check: `isFlagged should be ${expectedFlag} after ${action}`,
    passed: resultJson?.isFlagged === expectedFlag,
    detail: `expected=${expectedFlag}, got=${resultJson?.isFlagged}`,
  });

  // restore original state
  surfNavigate(`${BASE_URL}/map`);
  sleep(3000);
  surfJs('return window.__appInspect.map.next()');
  surfJs('return window.__appInspect.map.next()');
  surfJs('return window.__appInspect.map.next()');
  sleep(500);
  if (wasFlagged) {
    surfJs('return window.__appInspect.map.flag()');
  } else {
    surfJs('return window.__appInspect.map.unflag()');
  }
  sleep(500);

  return {
    id: 8,
    name: 'agent-flag-feature',
    passed: assertions.every((a) => a.passed),
    assertions,
    claudeOutput: output.slice(-1000),
    durationMs,
  };
}

async function eval9_agentTableInspection(): Promise<EvalResult> {
  const assertions: AssertionResult[] = [];

  const prompt = `
You are testing a GeoJSON feature review app running at ${BASE_URL}.

Your task:
1. Navigate to the table page using __appInspect
2. Get all table data using __appInspect.table.getData()
3. Count how many features are flagged vs total
4. Find the feature with the largest population (check properties.population)

Print the result as: RESULT: {"total": N, "flagged": N, "largestCity": {"name": "...", "population": N}}
`;

  const { output, durationMs } = runClaude(prompt, '0.50');

  const resultLine = output.split('\n').find((l) => l.startsWith('RESULT:'));
  const resultJson = resultLine ? parseJson(resultLine.replace('RESULT:', '').trim()) : null;

  assertions.push({
    check: 'Claude produced RESULT: line',
    passed: !!resultLine,
    detail: resultLine ? resultLine.slice(0, 200) : 'no RESULT: line found',
  });

  assertions.push({
    check: 'total > 0',
    passed: resultJson?.total > 0,
    detail: `total=${resultJson?.total}`,
  });

  assertions.push({
    check: 'largestCity has name and population',
    passed: typeof resultJson?.largestCity?.name === 'string' && resultJson?.largestCity?.population > 0,
    detail: `name=${resultJson?.largestCity?.name}, pop=${resultJson?.largestCity?.population}`,
  });

  return {
    id: 9,
    name: 'agent-table-inspection',
    passed: assertions.every((a) => a.passed),
    assertions,
    claudeOutput: output.slice(-1000),
    durationMs,
  };
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

const DETERMINISTIC_EVALS = [
  eval1_appInspectAvailable,
  eval2_mapFeatureNavigation,
  eval3_mapFlagUnflag,
  eval4_crossPageNavigation,
  eval5_mapInspectViewport,
  eval6_accessibilityTree,
];

const AGENTIC_EVALS = [
  eval7_agentReviewWorkflow,
  eval8_agentFlagFeature,
  eval9_agentTableInspection,
];

async function main() {
  const args = process.argv.slice(2);
  const runDeterministic = args.length === 0 || args.includes('--deterministic');
  const runAgentic = args.length === 0 || args.includes('--agentic');

  const evalsToRun: Array<() => Promise<EvalResult>> = [];
  if (runDeterministic) evalsToRun.push(...DETERMINISTIC_EVALS);
  if (runAgentic) evalsToRun.push(...AGENTIC_EVALS);

  console.log(`\nRunning ${evalsToRun.length} evals...\n${'='.repeat(50)}\n`);

  const results: EvalResult[] = [];

  for (const evalFn of evalsToRun) {
    let result: EvalResult;
    try {
      result = await evalFn();
    } catch (e: any) {
      result = {
        id: -1,
        name: evalFn.name,
        passed: false,
        assertions: [],
        error: e.message,
      };
    }

    const icon = result.passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`[${icon}] #${result.id} ${result.name}`);

    for (const a of result.assertions) {
      const aIcon = a.passed ? '  \x1b[32m+\x1b[0m' : '  \x1b[31m-\x1b[0m';
      console.log(`${aIcon} ${a.check} (${a.detail})`);
    }

    if (result.durationMs) {
      console.log(`  Duration: ${(result.durationMs / 1000).toFixed(1)}s`);
    }
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    console.log();

    results.push(result);
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${results.length} evals`);

  const suiteResult: EvalSuiteResult = {
    timestamp: new Date().toISOString(),
    totalPassed: passed,
    totalFailed: failed,
    evals: results,
  };

  const outPath = join(import.meta.dir, 'results.json');
  writeFileSync(outPath, JSON.stringify(suiteResult, null, 2));
  console.log(`\nResults written to ${outPath}`);

  if (failed > 0) process.exit(1);
}

main();
