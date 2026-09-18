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

describe("Vercel CLI Deployment Job Contract (.github/workflows/deploy.yml)", () => {
  it("defines the 'deploy' job running on 'ubuntu-latest' and depending on 'quality-gate'", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);

    expect(workflow.jobs.deploy).toBeDefined();
    const deployJob = workflow.jobs.deploy;
    expect(deployJob["runs-on"]).toBe("ubuntu-latest");
    expect(deployJob.needs).toBe("quality-gate");
  });

  it("binds VERCEL_ORG_ID and VERCEL_PROJECT_ID environment variables from secrets", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);
    const deployJob = workflow.jobs.deploy;

    expect(deployJob.env).toBeDefined();
    expect(deployJob.env.VERCEL_ORG_ID).toBe("${{ secrets.VERCEL_ORG_ID }}");
    expect(deployJob.env.VERCEL_PROJECT_ID).toBe("${{ secrets.VERCEL_PROJECT_ID }}");
  });

  it("has secret fallback check step that guards subsequent deployment steps", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);
    const steps: Array<{
      id?: string;
      name?: string;
      uses?: string;
      env?: Record<string, unknown>;
      run?: string;
      if?: string;
      [key: string]: unknown;
    }> = workflow.jobs.deploy.steps;

    const checkCredsStep = steps.find((s) => s.id === "check-creds");
    expect(checkCredsStep).toBeDefined();
    expect(checkCredsStep?.env?.VERCEL_TOKEN).toBe("${{ secrets.VERCEL_TOKEN }}");
    expect(checkCredsStep?.run).toContain("can_deploy=false");
    expect(checkCredsStep?.run).toContain("can_deploy=true");
    expect(checkCredsStep?.run).toContain("GITHUB_STEP_SUMMARY");

    // All subsequent steps after check-creds must have conditional guard on can_deploy == 'true'
    const checkCredsIdx = steps.findIndex((s) => s.id === "check-creds");
    const subsequentSteps = steps.slice(checkCredsIdx + 1);
    expect(subsequentSteps.length).toBeGreaterThan(0);
    for (const step of subsequentSteps) {
      expect(step.if).toBeDefined();
      expect(step.if).toContain("steps.check-creds.outputs.can_deploy == 'true'");
    }
  });

  it("configures setup prerequisites: checkout, pnpm v11, node 20 with cache, install, and vercel cli", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);
    const steps: Array<{
      id?: string;
      name?: string;
      uses?: string;
      with?: Record<string, unknown>;
      run?: string;
      if?: string;
      [key: string]: unknown;
    }> = workflow.jobs.deploy.steps;

    const checkoutStep = steps.find((s) => s.uses?.startsWith("actions/checkout"));
    expect(checkoutStep).toBeDefined();
    expect(checkoutStep?.uses).toBe("actions/checkout@v4");

    const pnpmSetupStep = steps.find((s) => s.uses?.startsWith("pnpm/action-setup"));
    expect(pnpmSetupStep).toBeDefined();
    expect(pnpmSetupStep?.uses).toBe("pnpm/action-setup@v4");
    expect(String(pnpmSetupStep?.with?.version)).toBe("11");

    const nodeSetupStep = steps.find((s) => s.uses?.startsWith("actions/setup-node"));
    expect(nodeSetupStep).toBeDefined();
    expect(nodeSetupStep?.uses).toBe("actions/setup-node@v4");
    expect(nodeSetupStep?.with?.["node-version"]).toBe(20);
    expect(nodeSetupStep?.with?.cache).toBe("pnpm");

    const installStep = steps.find((s) => s.run?.includes("pnpm install"));
    expect(installStep).toBeDefined();
    expect(installStep?.run).toBe("pnpm install --frozen-lockfile");

    const vercelCliStep = steps.find((s) => s.run?.includes("vercel@latest"));
    expect(vercelCliStep).toBeDefined();
    expect(vercelCliStep?.run).toBe("npm install --global vercel@latest");
  });

  it("pulls Vercel environment routing production for main and preview for branches/PRs", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);
    const steps: Array<{
      run?: string;
      if?: string;
      [key: string]: unknown;
    }> = workflow.jobs.deploy.steps;

    const pullPreview = steps.find(
      (s) => s.run?.includes("vercel pull") && s.run?.includes("environment=preview")
    );
    expect(pullPreview).toBeDefined();
    expect(pullPreview?.run).toBe(
      "vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}"
    );
    expect(pullPreview?.if).toContain("github.ref != 'refs/heads/main'");

    const pullProd = steps.find(
      (s) => s.run?.includes("vercel pull") && s.run?.includes("environment=production")
    );
    expect(pullProd).toBeDefined();
    expect(pullProd?.run).toBe(
      "vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}"
    );
    expect(pullProd?.if).toContain("github.ref == 'refs/heads/main'");
  });

  it("uses prebuilt deployment with 'vercel build' and 'vercel deploy --prebuilt'", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);
    const steps: Array<{
      id?: string;
      run?: string;
      if?: string;
      [key: string]: unknown;
    }> = workflow.jobs.deploy.steps;

    // Pre-build steps
    const buildPreview = steps.find(
      (s) => s.run?.includes("vercel build") && !s.run?.includes("--prod")
    );
    expect(buildPreview).toBeDefined();
    expect(buildPreview?.run).toBe("vercel build --token=${{ secrets.VERCEL_TOKEN }}");
    expect(buildPreview?.if).toContain("github.ref != 'refs/heads/main'");

    const buildProd = steps.find((s) => s.run?.includes("vercel build --prod"));
    expect(buildProd).toBeDefined();
    expect(buildProd?.run).toBe("vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}");
    expect(buildProd?.if).toContain("github.ref == 'refs/heads/main'");

    // Deploy prebuilt preview with output url capture
    const deployPreview = steps.find((s) => s.id === "deploy-preview");
    expect(deployPreview).toBeDefined();
    expect(deployPreview?.run).toContain(
      "url=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})"
    );
    expect(deployPreview?.run).toContain('echo "url=$url" >> "$GITHUB_OUTPUT"');
    expect(deployPreview?.if).toContain("github.ref != 'refs/heads/main'");

    // Deploy prebuilt production
    const deployProd = steps.find((s) => s.run?.includes("vercel deploy --prebuilt --prod"));
    expect(deployProd).toBeDefined();
    expect(deployProd?.run).toBe(
      "vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}"
    );
    expect(deployProd?.if).toContain("github.ref == 'refs/heads/main'");
  });

  it("targets --prod flag strictly on main branch deployment", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);
    const steps: Array<{
      run?: string;
      if?: string;
      [key: string]: unknown;
    }> = workflow.jobs.deploy.steps;

    const prodSteps = steps.filter(
      (s) => s.run?.includes("--prod") || s.run?.includes("environment=production")
    );
    expect(prodSteps.length).toBeGreaterThanOrEqual(3);
    for (const step of prodSteps) {
      expect(step.if).toContain("github.ref == 'refs/heads/main'");
      expect(step.if).not.toContain("github.ref != 'refs/heads/main'");
    }
  });

  it("writes deployment URL and summary to $GITHUB_STEP_SUMMARY", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);
    const steps: Array<{
      run?: string;
      if?: string;
      [key: string]: unknown;
    }> = workflow.jobs.deploy.steps;

    const summaryStep = steps.find(
      (s) =>
        s.run?.includes("GITHUB_STEP_SUMMARY") &&
        s.run?.includes("steps.deploy-preview.outputs.url")
    );
    expect(summaryStep).toBeDefined();
    expect(summaryStep?.if).toContain("steps.check-creds.outputs.can_deploy == 'true'");
  });
});

describe("PR Preview Sticky Feedback Commenter & Manual Dispatch Contract (.github/workflows/deploy.yml)", () => {
  it("configures workflow_dispatch inputs with target environment choice ('preview', 'production')", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);

    expect(workflow.on.workflow_dispatch).toBeDefined();
    expect(workflow.on.workflow_dispatch.inputs).toBeDefined();

    const envInput = workflow.on.workflow_dispatch.inputs.environment;
    expect(envInput).toBeDefined();
    expect(envInput.description).toBe("Target deployment environment");
    expect(envInput.required).toBe(true);
    expect(envInput.default).toBe("preview");
    expect(envInput.type).toBe("choice");
    expect(envInput.options).toContain("preview");
    expect(envInput.options).toContain("production");
    expect(envInput.options).toHaveLength(2);
  });

  it("declares workflow permissions including 'pull-requests: write'", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);

    // Verify top-level or deploy job level permissions
    const permissions = workflow.permissions || workflow.jobs?.deploy?.permissions;
    expect(permissions).toBeDefined();
    expect(permissions["pull-requests"]).toBe("write");
    expect(permissions.contents).toBe("read");
    expect(permissions.issues).toBe("write");
  });

  it("routes deployment environment considering workflow_dispatch inputs or target branch", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);
    const steps: Array<{
      run?: string;
      if?: string;
      [key: string]: unknown;
    }> = workflow.jobs.deploy.steps;

    const pullPreview = steps.find(
      (s) => s.run?.includes("vercel pull") && s.run?.includes("environment=preview")
    );
    expect(pullPreview?.if).toContain("github.event_name == 'workflow_dispatch'");
    expect(pullPreview?.if).toContain("inputs.environment == 'preview'");

    const pullProd = steps.find(
      (s) => s.run?.includes("vercel pull") && s.run?.includes("environment=production")
    );
    expect(pullProd?.if).toContain("github.event_name == 'workflow_dispatch'");
    expect(pullProd?.if).toContain("inputs.environment == 'production'");
  });

  it("configures sticky PR preview commenter step using actions/github-script@v7 with unique marker", () => {
    const rawYaml = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = YAML.parse(rawYaml);
    const steps: Array<{
      id?: string;
      name?: string;
      uses?: string;
      with?: { script?: string; [key: string]: unknown };
      if?: string;
      [key: string]: unknown;
    }> = workflow.jobs.deploy.steps;

    const commentStep = steps.find((s) => s.uses?.startsWith("actions/github-script"));
    expect(commentStep).toBeDefined();
    expect(commentStep?.uses).toBe("actions/github-script@v7");

    // Guard conditions: runs on pull_request when can_deploy is true and preview url is present
    expect(commentStep?.if).toContain("github.event_name == 'pull_request'");
    expect(commentStep?.if).toContain("steps.check-creds.outputs.can_deploy == 'true'");
    expect(commentStep?.if).toContain("steps.deploy-preview.outputs.url != ''");

    const script = commentStep?.with?.script;
    expect(typeof script).toBe("string");

    // Unique marker
    expect(script).toContain("<!-- vercel-preview-deployment-comment -->");

    // Markdown formatting with preview URL, commit SHA, and timestamp
    expect(script).toContain("steps.deploy-preview.outputs.url");
    expect(script).toMatch(/sha/i);
    expect(script).toMatch(/timestamp|Date/i);

    // Sticky comment pattern: search existing comments, then updateComment or createComment
    expect(script).toContain("listComments");
    expect(script).toMatch(/find\s*\(.*includes\s*\(\s*(marker|['"]<!-- vercel-preview-deployment-comment -->['"])\s*\)/);
    expect(script).toContain("updateComment");
    expect(script).toContain("createComment");
  });
});
