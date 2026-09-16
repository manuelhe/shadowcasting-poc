import { describe, it, expect } from "vitest";
import {
  generateBranchSkeleton,
  swayBranchSkeleton,
  BranchParams,
} from "./branch-skeleton";

describe("Parametric Branch & Leaf Skeleton Generator", () => {
  it("generates a branch skeleton with joints and leaf clusters", () => {
    const params: BranchParams = {
      depth: 3,
      trunkLength: 0.25,
      branchAngle: 0.45,
      leafDensity: 5,
    };

    const skeleton = generateBranchSkeleton(params);

    expect(skeleton.joints.length).toBeGreaterThan(5);
    expect(skeleton.leaves.length).toBeGreaterThan(0);
    expect(skeleton.bounds.maxX).toBeGreaterThan(skeleton.bounds.minX);
    expect(skeleton.bounds.maxY).toBeGreaterThan(skeleton.bounds.minY);
  });

  it("places root joint at the requested origin", () => {
    const skeleton = generateBranchSkeleton({
      depth: 2,
      origin: { x: 0.1, y: 0.1 },
    });

    expect(skeleton.joints[0].x).toBeCloseTo(0.1, 4);
    expect(skeleton.joints[0].y).toBeCloseTo(0.1, 4);
  });

  it("applies harmonic sway without disconnecting joint topology", () => {
    const skeleton = generateBranchSkeleton({ depth: 3 });
    const originalJointCount = skeleton.joints.length;
    const originalLeafCount = skeleton.leaves.length;

    const swayed = swayBranchSkeleton(skeleton, 2.5, 0.8);

    expect(swayed.joints.length).toBe(originalJointCount);
    expect(swayed.leaves.length).toBe(originalLeafCount);

    // Tip joint should have displaced more than the root joint
    const rootDelta = Math.hypot(
      swayed.joints[0].x - skeleton.joints[0].x,
      swayed.joints[0].y - skeleton.joints[0].y
    );
    const tipIndex = skeleton.joints.length - 1;
    const tipDelta = Math.hypot(
      swayed.joints[tipIndex].x - skeleton.joints[tipIndex].x,
      swayed.joints[tipIndex].y - skeleton.joints[tipIndex].y
    );

    expect(rootDelta).toBeCloseTo(0, 4); // Root remains anchored
    expect(tipDelta).toBeGreaterThan(0); // Tip oscillates with wind
  });

  it("leaf clusters have positive radii and valid normalized coordinates", () => {
    const skeleton = generateBranchSkeleton({ depth: 4, leafDensity: 6 });

    for (const leaf of skeleton.leaves) {
      expect(leaf.radius).toBeGreaterThan(0);
      expect(Number.isFinite(leaf.x)).toBe(true);
      expect(Number.isFinite(leaf.y)).toBe(true);
    }
  });
});
