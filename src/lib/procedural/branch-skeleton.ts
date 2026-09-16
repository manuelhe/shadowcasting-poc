/**
 * Parametric Branch & Leaf Skeleton Generator
 * Generates procedural organic tree branch silhouettes with hierarchical harmonic sway
 * for dynamic shadowcasting.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface BranchJoint {
  index: number;
  parentIndex: number;
  x: number;
  y: number;
  angle: number; // Local relative angle
  worldAngle: number; // Cumulative angle
  length: number;
  depth: number;
  thickness: number;
}

export interface LeafCluster {
  parentJointIndex: number;
  x: number;
  y: number;
  angle: number;
  radius: number;
}

export interface BranchSkeleton {
  joints: BranchJoint[];
  leaves: LeafCluster[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface BranchParams {
  depth?: number;
  trunkLength?: number;
  branchAngle?: number;
  leafDensity?: number;
  origin?: Point2D;
  seed?: number;
}

// Simple deterministic pseudo-random number generator
function createPRNG(seed = 1337) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateBranchSkeleton(params?: BranchParams): BranchSkeleton {
  const depth = params?.depth ?? 4;
  const trunkLength = params?.trunkLength ?? 0.22;
  const baseAngle = params?.branchAngle ?? 0.52; // ~30 degrees
  const leafDensity = params?.leafDensity ?? 5;
  const origin = params?.origin ?? { x: 0.05, y: 0.05 };
  const rand = createPRNG(params?.seed ?? 42);

  const joints: BranchJoint[] = [];
  const leaves: LeafCluster[] = [];

  // Root joint
  joints.push({
    index: 0,
    parentIndex: -1,
    x: origin.x,
    y: origin.y,
    angle: 0.65, // Points toward bottom-right diagonally
    worldAngle: 0.65,
    length: trunkLength,
    depth: 0,
    thickness: 18,
  });

  // End of trunk
  const trunkEndX = origin.x + Math.cos(0.65) * trunkLength;
  const trunkEndY = origin.y + Math.sin(0.65) * trunkLength;
  joints.push({
    index: 1,
    parentIndex: 0,
    x: trunkEndX,
    y: trunkEndY,
    angle: 0,
    worldAngle: 0.65,
    length: trunkLength * 0.8,
    depth: 1,
    thickness: 14,
  });

  // Recursive branch generator
  function growBranches(
    parentIdx: number,
    currDepth: number,
    parentWorldAngle: number,
    parentPos: Point2D,
    len: number,
    thick: number
  ) {
    if (currDepth >= depth) {
      // Spawn leaf cluster at terminal tip
      leaves.push({
        parentJointIndex: parentIdx,
        x: parentPos.x,
        y: parentPos.y,
        angle: parentWorldAngle,
        radius: 0.035 + rand() * 0.02,
      });

      // Extra leaves for fuller canopy
      for (let i = 0; i < leafDensity; i++) {
        const spreadAngle = parentWorldAngle + (rand() - 0.5) * 1.4;
        const dist = 0.02 + rand() * 0.04;
        leaves.push({
          parentJointIndex: parentIdx,
          x: parentPos.x + Math.cos(spreadAngle) * dist,
          y: parentPos.y + Math.sin(spreadAngle) * dist,
          angle: spreadAngle,
          radius: 0.025 + rand() * 0.02,
        });
      }
      return;
    }

    // Number of daughter branches: 2 or 3
    const branchCount = rand() > 0.4 ? 2 : 3;
    const angleSpread = baseAngle * (0.8 + rand() * 0.4);

    for (let b = 0; b < branchCount; b++) {
      const dir = branchCount === 2 ? (b === 0 ? -1 : 1) : b - 1;
      const localAngle = dir * angleSpread * (0.7 + rand() * 0.6);
      const worldAngle = parentWorldAngle + localAngle;
      const childLength = len * (0.7 + rand() * 0.25);
      const childThickness = Math.max(3, thick * 0.65);

      const childX = parentPos.x + Math.cos(worldAngle) * childLength;
      const childY = parentPos.y + Math.sin(worldAngle) * childLength;

      const jointIdx = joints.length;
      joints.push({
        index: jointIdx,
        parentIndex: parentIdx,
        x: childX,
        y: childY,
        angle: localAngle,
        worldAngle,
        length: childLength,
        depth: currDepth + 1,
        thickness: childThickness,
      });

      growBranches(
        jointIdx,
        currDepth + 1,
        worldAngle,
        { x: childX, y: childY },
        childLength,
        childThickness
      );
    }
  }

  // Grow from trunk
  growBranches(1, 1, 0.65, { x: trunkEndX, y: trunkEndY }, trunkLength * 0.75, 12);

  // Compute bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const j of joints) {
    if (j.x < minX) minX = j.x;
    if (j.y < minY) minY = j.y;
    if (j.x > maxX) maxX = j.x;
    if (j.y > maxY) maxY = j.y;
  }
  for (const l of leaves) {
    if (l.x - l.radius < minX) minX = l.x - l.radius;
    if (l.y - l.radius < minY) minY = l.y - l.radius;
    if (l.x + l.radius > maxX) maxX = l.x + l.radius;
    if (l.y + l.radius > maxY) maxY = l.y + l.radius;
  }

  return {
    joints,
    leaves,
    bounds: { minX, minY, maxX, maxY },
  };
}

/**
 * Applies hierarchical wind sway to a branch skeleton.
 * Parent joints oscillate slowly; child branches oscillate with higher frequency and amplitude.
 */
export function swayBranchSkeleton(
  skeleton: BranchSkeleton,
  time: number,
  windStrength = 0.8
): BranchSkeleton {
  const swayedJoints: BranchJoint[] = [];
  const jointMap = new Map<number, Point2D>();

  // Max depth in skeleton
  const maxDepth = Math.max(...skeleton.joints.map((j) => j.depth), 1);

  for (const orig of skeleton.joints) {
    if (orig.parentIndex === -1) {
      // Root is stationary
      swayedJoints.push({ ...orig });
      jointMap.set(orig.index, { x: orig.x, y: orig.y });
      continue;
    }

    const parent = swayedJoints[orig.parentIndex];
    // Harmonic sway factor: deeper branches have higher frequency and larger angular excursion
    const harmonicFreq = 1.0 + orig.depth * 0.5;
    const harmonicPhase = orig.depth * 0.8;
    const swayAngleOffset =
      Math.sin(time * harmonicFreq + harmonicPhase) *
      windStrength *
      0.09 *
      (orig.depth / maxDepth);

    const worldAngle = parent.worldAngle + orig.angle + swayAngleOffset;
    const x = parent.x + Math.cos(worldAngle) * orig.length;
    const y = parent.y + Math.sin(worldAngle) * orig.length;

    swayedJoints.push({
      ...orig,
      x,
      y,
      worldAngle,
    });
    jointMap.set(orig.index, { x, y });
  }

  // Sway leaves attached to their parent joints
  const swayedLeaves: LeafCluster[] = skeleton.leaves.map((l, i) => {
    const parentPos = jointMap.get(l.parentJointIndex) || { x: l.x, y: l.y };
    const leafFlutter = Math.sin(time * 3.2 + i * 0.7) * windStrength * 0.008;
    return {
      ...l,
      x: parentPos.x + (l.x - skeleton.joints[l.parentJointIndex]?.x || 0) + leafFlutter,
      y: parentPos.y + (l.y - skeleton.joints[l.parentJointIndex]?.y || 0) + leafFlutter,
      angle: l.angle + Math.sin(time * 2.8 + i) * windStrength * 0.15,
    };
  });

  return {
    joints: swayedJoints,
    leaves: swayedLeaves,
    bounds: skeleton.bounds,
  };
}

/**
 * Draws the branch skeleton onto a Canvas 2D context
 */
export function renderBranchToCanvas(
  ctx: CanvasRenderingContext2D,
  skeleton: BranchSkeleton,
  width: number,
  height: number,
  fillColor = "#000000"
) {
  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = fillColor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 1. Draw branch segments
  for (const j of skeleton.joints) {
    if (j.parentIndex === -1) continue;
    const parent = skeleton.joints[j.parentIndex];

    ctx.beginPath();
    ctx.lineWidth = j.thickness;
    ctx.moveTo(parent.x * width, parent.y * height);
    ctx.lineTo(j.x * width, j.y * height);
    ctx.stroke();
  }

  // 2. Draw organic leaf clusters
  for (const l of skeleton.leaves) {
    ctx.beginPath();
    const lx = l.x * width;
    const ly = l.y * height;
    const rx = l.radius * width;
    const ry = l.radius * 0.55 * height;

    ctx.ellipse(lx, ly, Math.max(1, rx), Math.max(1, ry), l.angle, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
