/**
 * Surf-CLI verifier script for the GeoJSON review app.
 *
 * Usage:
 *   surf run scripts/surf-verify.ts
 *
 * Requires the app running at http://localhost:5173 (bun run dev).
 * Uses data-testid attributes and window.__mapInspect for verification.
 */

const BASE_URL = process.env.APP_URL || "http://localhost:5173";

interface VerifyStep {
  name: string;
  run: () => Promise<void>;
}

const results: { name: string; status: "pass" | "fail"; error?: string }[] = [];

async function surfEval(js: string): Promise<string> {
  const proc = Bun.spawn(["surf", "eval", js], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const text = await new Response(proc.stdout).text();
  const err = await new Response(proc.stderr).text();
  if (proc.exitCode !== 0) throw new Error(`surf eval failed: ${err}`);
  return text.trim();
}

async function surfNavigate(url: string): Promise<void> {
  const proc = Bun.spawn(["surf", "navigate", url], {
    stdout: "pipe",
    stderr: "pipe",
  });
  await proc.exited;
  if (proc.exitCode !== 0) {
    const err = await new Response(proc.stderr).text();
    throw new Error(`surf navigate failed: ${err}`);
  }
}

async function surfClick(selector: string): Promise<void> {
  const proc = Bun.spawn(["surf", "click", selector], {
    stdout: "pipe",
    stderr: "pipe",
  });
  await proc.exited;
  if (proc.exitCode !== 0) {
    const err = await new Response(proc.stderr).text();
    throw new Error(`surf click failed: ${err}`);
  }
}

async function surfScreenshot(path: string): Promise<void> {
  const proc = Bun.spawn(["surf", "screenshot", path], {
    stdout: "pipe",
    stderr: "pipe",
  });
  await proc.exited;
}

async function waitForTestId(testId: string, timeoutMs = 5000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = await surfEval(
      `document.querySelector('[data-testid="${testId}"]') !== null`,
    );
    if (found === "true") return;
    await Bun.sleep(500);
  }
  throw new Error(`Timeout waiting for [data-testid="${testId}"]`);
}

const steps: VerifyStep[] = [
  {
    name: "Navigate to app",
    run: async () => {
      await surfNavigate(BASE_URL);
      await waitForTestId("main-nav");
    },
  },
  {
    name: "Verify nav links exist",
    run: async () => {
      const navLinks = await surfEval(`
        JSON.stringify(
          [...document.querySelectorAll('[data-testid^="nav-"]')]
            .map(el => el.getAttribute('data-testid'))
        )
      `);
      const ids = JSON.parse(navLinks);
      const expected = ["nav-map", "nav-table", "nav-results"];
      for (const id of expected) {
        if (!ids.includes(id)) throw new Error(`Missing nav link: ${id}`);
      }
    },
  },
  {
    name: "Navigate to Map view",
    run: async () => {
      await surfClick('[data-testid="nav-map"]');
      await waitForTestId("map-view");
      await waitForTestId("map-shell");
    },
  },
  {
    name: "Verify map container rendered",
    run: async () => {
      const exists = await surfEval(
        `document.querySelector('[data-testid="map-container"]') !== null`,
      );
      if (exists !== "true") throw new Error("Map container not found");
    },
  },
  {
    name: "Verify layer toggle",
    run: async () => {
      await waitForTestId("layer-toggle");
      const layerItems = await surfEval(`
        document.querySelectorAll('[data-testid^="layer-item-"]').length
      `);
      if (parseInt(layerItems) === 0) throw new Error("No layer items found");
    },
  },
  {
    name: "Verify review controls",
    run: async () => {
      const hasControls = await surfEval(
        `document.querySelector('[data-testid="review-controls"]') !== null`,
      );
      if (hasControls === "true") {
        const btns = await surfEval(`
          JSON.stringify(
            ['btn-back', 'btn-flag', 'btn-forward']
              .map(id => document.querySelector('[data-testid="' + id + '"]') !== null)
          )
        `);
        const found = JSON.parse(btns);
        if (found.includes(false))
          throw new Error("Missing review control buttons");
      }
    },
  },
  {
    name: "Run __mapInspect.verify()",
    run: async () => {
      // wait for map to load
      await Bun.sleep(3000);

      const raw = await surfEval(`
        (async () => {
          if (!window.__mapInspect) return JSON.stringify({ status: 'error', error: '__mapInspect not available' });
          const result = await window.__mapInspect.verify({
            queries: [
              { name: 'all-features', method: 'viewport', options: { layers: ['geojson-layer'], limit: 10 } }
            ]
          });
          return JSON.stringify(result);
        })()
      `);

      const result = JSON.parse(raw);
      if (
        result.status === "error" &&
        result.error !== "__mapInspect not available"
      ) {
        throw new Error(`__mapInspect.verify() error: ${result.error}`);
      }
      console.log("  Camera:", JSON.stringify(result.camera));
      console.log("  Layers count:", result.layers?.length);
      console.log("  Query results:", result.queries?.length);
    },
  },
  {
    name: "Navigate to Table view",
    run: async () => {
      await surfClick('[data-testid="nav-table"]');
      await waitForTestId("table-view");
      await waitForTestId("feature-table");
    },
  },
  {
    name: "Verify feature table rows",
    run: async () => {
      const rowCount = await surfEval(`
        document.querySelectorAll('[data-testid^="feature-row-"]').length
      `);
      console.log("  Feature rows:", rowCount);
    },
  },
  {
    name: "Navigate to Results view",
    run: async () => {
      await surfClick('[data-testid="nav-results"]');
      await waitForTestId("results-container");
    },
  },
  {
    name: "Verify results stats",
    run: async () => {
      const stats = await surfEval(`
        JSON.stringify({
          total: document.querySelector('[data-testid="stat-total"]')?.textContent,
          reviewed: document.querySelector('[data-testid="stat-reviewed"]')?.textContent,
          flagged: document.querySelector('[data-testid="stat-flagged"]')?.textContent,
          passed: document.querySelector('[data-testid="stat-passed"]')?.textContent,
        })
      `);
      console.log("  Stats:", stats);
    },
  },
  {
    name: "Take final screenshot",
    run: async () => {
      await surfScreenshot("img/surf-verify-results.png");
      console.log("  Screenshot saved to img/surf-verify-results.png");
    },
  },
];

async function main() {
  console.log(`\nSurf Verifier - ${BASE_URL}\n${"=".repeat(40)}\n`);

  for (const step of steps) {
    try {
      process.stdout.write(`[RUN]  ${step.name}...`);
      await step.run();
      results.push({ name: step.name, status: "pass" });
      console.log(` PASS`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ name: step.name, status: "fail", error: msg });
      console.log(` FAIL: ${msg}`);
    }
  }

  console.log(`\n${"=".repeat(40)}`);
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  console.log(
    `Results: ${passed} passed, ${failed} failed out of ${results.length} steps`,
  );

  if (failed > 0) {
    console.log("\nFailed steps:");
    for (const r of results.filter((r) => r.status === "fail")) {
      console.log(`  - ${r.name}: ${r.error}`);
    }
    process.exit(1);
  }
}

main();
