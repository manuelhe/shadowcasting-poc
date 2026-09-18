import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const REPO_ROOT = path.resolve(__dirname, "..");
const WORKFLOW_PATH = path.join(REPO_ROOT, ".github/workflows/deploy.yml");
const PACKAGE_JSON_PATH = path.join(REPO_ROOT, "package.json");

describe("CI Quality Gate Workflow Contract (.github/workflows/deploy.yml)", () => {
  it("workflow file exists and is non-empty", () => {
    expect(fs.existsSync(WORKFLOW_PATH), `Expected workflow file at ${WORKFLOW_PATH}`).toBe(true);
    const stats = fs.statSync(WORKFLOW_PATH);
    expect(stats.size).toBeGreaterThan(100);
  });

  it("parses valid YAML syntax without errors", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    let parsed: unknown;
    expect(() => {
      parsed = YAML.parse(rawYaml);
    }).not.toThrow();

    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe("object");
    expect(parsed).not.toBeNull();
  });

  it("defines workflow name as 'Deploy'", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);
    expect(workflow.name).toBe("Deploy");
  });

  it("configures push, pull_request, and workflow_dispatch triggers targeting the main branch", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);

    expect(workflow.on).toBeDefined();
    expect(workflow.on.push).toBeDefined();
    expect(workflow.on.push.branches).toContain("main");

    expect(workflow.on.pull_request).toBeDefined();
    expect(workflow.on.pull_request.branches).toContain("main");

    expect(Object.prototype.hasOwnProperty.call(workflow.on, "workflow_dispatch")).toBe(true);
  });

  it("configures concurrency group and cancels in-progress runs for non-main branches", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);

    expect(workflow.concurrency).toBeDefined();
    expect(workflow.concurrency.group).toBe("${{ github.workflow }}-${{ github.ref }}");
    expect(workflow.concurrency["cancel-in-progress"]).toBe(
      "${{ github.ref != 'refs/heads/main' }}"
    );
  });

  it("defines the 'quality-gate' job running on 'ubuntu-latest'", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);

    expect(workflow.jobs).toBeDefined();
    expect(workflow.jobs["quality-gate"]).toBeDefined();

    const qualityGate = workflow.jobs["quality-gate"];
    expect(qualityGate["runs-on"]).toBe("ubuntu-latest");
  });

  it("enforces complete step execution sequence: checkout -> setup pnpm -> setup node -> install -> lint -> test", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);
    const steps: Array<{
      name?: string;
      uses?: string;
      with?: Record<string, unknown>;
      run?: string;
      [key: string]: unknown;
    }> = workflow.jobs["quality-gate"].steps;

    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThanOrEqual(6);

    // Step 1: actions/checkout
    const checkoutStep = steps.find((s) => s.uses?.startsWith("actions/checkout"));
    expect(checkoutStep).toBeDefined();
    expect(checkoutStep?.uses).toBe("actions/checkout@v4");

    // Step 2: pnpm/action-setup
    const pnpmSetupStep = steps.find((s) => s.uses?.startsWith("pnpm/action-setup"));
    expect(pnpmSetupStep).toBeDefined();
    expect(pnpmSetupStep?.uses).toBe("pnpm/action-setup@v4");
    expect(String(pnpmSetupStep?.with?.version)).toBe("11");

    // Verify pnpm major version matches package.json packageManager
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));
    const pkgManager = pkg.packageManager || "";
    expect(pkgManager).toContain("pnpm@11");

    // Step 3: actions/setup-node with node 20 and pnpm cache
    const nodeSetupStep = steps.find((s) => s.uses?.startsWith("actions/setup-node"));
    expect(nodeSetupStep).toBeDefined();
    expect(nodeSetupStep?.uses).toBe("actions/setup-node@v4");
    expect(nodeSetupStep?.with?.["node-version"]).toBe(20);
    expect(nodeSetupStep?.with?.cache).toBe("pnpm");

    // Step 4: pnpm install with frozen lockfile
    const installStep = steps.find((s) => s.run?.includes("pnpm install"));
    expect(installStep).toBeDefined();
    expect(installStep?.run).toBe("pnpm install --frozen-lockfile");

    // Step 5: pnpm lint
    const lintStep = steps.find((s) => s.run?.includes("pnpm lint"));
    expect(lintStep).toBeDefined();
    expect(lintStep?.run).toBe("pnpm lint");

    // Step 6: pnpm test
    const testStep = steps.find((s) => s.run?.includes("pnpm test"));
    expect(testStep).toBeDefined();
    expect(testStep?.run).toBe("pnpm test");

    // Sequence verification: checkout before pnpm setup before node setup before install before lint before test
    const checkoutIdx = steps.indexOf(checkoutStep!);
    const pnpmIdx = steps.indexOf(pnpmSetupStep!);
    const nodeIdx = steps.indexOf(nodeSetupStep!);
    const installIdx = steps.indexOf(installStep!);
    const lintIdx = steps.indexOf(lintStep!);
    const testIdx = steps.indexOf(testStep!);

    expect(checkoutIdx).toBeLessThan(pnpmIdx);
    expect(pnpmIdx).toBeLessThan(nodeIdx);
    expect(nodeIdx).toBeLessThan(installIdx);
    expect(installIdx).toBeLessThan(lintIdx);
    expect(lintIdx).toBeLessThan(testIdx);

    // Verify zero tolerance: none of the verification steps ignore failure
    expect(lintStep?.["continue-on-error"]).toBeUndefined();
    expect(testStep?.["continue-on-error"]).toBeUndefined();
    expect(installStep?.["continue-on-error"]).toBeUndefined();
  });
});
