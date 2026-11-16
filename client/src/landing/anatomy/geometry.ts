import {
  circleRing,
  coil,
  corners,
  depthOf,
  extrude,
  insetPlan,
  knurl,
  lineOnTop,
  onTop,
  pathOf,
  planOutline,
  radialTicks,
  ring,
  segment,
  sideArc,
  sideRing,
  slabOf,
  topMatrix,
  topTicks,
  type Flat,
  type Plan,
  type Plane,
  type SolidPaths,
} from "../../components/iso/iso-kit";
import {
  BASE,
  BASE_H,
  BAY_X,
  CARRIAGE_REST_BACK_Y,
  CARRIAGE_SLIDE_STROKE,
  COIL_R,
  COIL_TURNS,
  DIAL,
  DIAL_FROM,
  DIAL_H,
  DIAL_MAX_PCT,
  DIAL_R,
  DIAL_SPAN,
  DIAL_TOP,
  DIAL_Z,
  DIVIDER_X,
  FOOT_H,
  FRAME_BACK_Y,
  FRAME_FRONT_Y,
  FRAME_H,
  FRAME_LEFT_X,
  FRAME_RIGHT_X,
  FRAME_WALL,
  P,
  PLUNGER_COIL_R,
  PLUNGER_COIL_TURNS,
  PLUNGER_SPRING_END,
  PLUNGER_SPRING_START,
  PLUNGER_STROKE,
  PLUNGER_Y,
  PLUNGER_Z,
  POST,
  POST_L,
  POST_R,
  RAIL_D,
  RAIL_H,
  RAIL_TOP,
  RAIL_Y,
  RAIL_Z,
  ROD_Z,
  RULE_FROM,
  RULE_STEP,
  RULE_TO,
  SPRING_BACK_Y,
  at,
} from "./view";

const solid = (plan: Plan, z: number, h: number, steps = 6, bevel = 0): SolidPaths =>
  slabOf(plan, z, h, P, steps, bevel);

const cyl = (cx: number, cy: number, r: number, z: number, h: number, steps = 32, bevel = 0): SolidPaths =>
  extrude(circleRing(cx, cy, r, steps), z, h, P, { convex: true, bevel });

const byDepth = (pts: Plane[]): Plane[] =>
  [...pts].sort((a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P));

const join = (paths: string[]) => paths.join("");

/* --------------------------------------------------------------------------
   1. Base Plate, 4 Rubber Feet (8 solids), Corner Screws, Label Plate & Ruler
   -------------------------------------------------------------------------- */
const FEET = byDepth(corners(BASE, 20));
const BASE_SCREWS = corners(BASE, 9);
const LABEL_PLATE: Plan = { x: BASE.x + 14, y: BASE.y + BASE.d - 20, w: 60, d: 11, r: 2 };
const FRONT_RULER: Plan = { x: -112, y: 40, w: 184, d: 7, r: 1.5 };
const FRONT_TICKS = topTicks(
  FRONT_RULER.x + 6,
  FRONT_RULER.x + FRONT_RULER.w - 6,
  RULE_STEP,
  5,
  FRONT_RULER.y + 0.8,
  0.8,
  [2.0, 3.8],
  P,
);

export const BASE_ART = {
  halo: solid(BASE, -BASE_H - FOOT_H, BASE_H).fill,
  feet: FEET.map(([x, y]) => [
    cyl(x, y, 7, -BASE_H - FOOT_H, 1.6, 28),
    cyl(x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, 28),
  ]),
  slab: solid(BASE, -BASE_H, BASE_H, 8, 1.6),
  groove: planOutline(insetPlan(BASE, 4.5), 0, P),
  screwRings: join(BASE_SCREWS.map(([x, y]) => ring(x, y, 2.2, 0, P, 16))),
  screws: BASE_SCREWS.map(([x, y]) => at([x, y, 0])),
  labelPlate: solid(LABEL_PLATE, 0, 0.9, 4),
  labelLine: planOutline(insetPlan(LABEL_PLATE, 1.6), 0.9, P),
  labelScrews: [
    at([LABEL_PLATE.x + 3.5, LABEL_PLATE.y + LABEL_PLATE.d / 2, 0.9]),
    at([LABEL_PLATE.x + LABEL_PLATE.w - 3.5, LABEL_PLATE.y + LABEL_PLATE.d / 2, 0.9]),
  ],
  labelRules: join(
    [0, 1, 2].map((row) =>
      lineOnTop(
        [LABEL_PLATE.x + 8, LABEL_PLATE.y + 3.3 + row * 2.2],
        [LABEL_PLATE.x + (row === 1 ? 36 : 48), LABEL_PLATE.y + 3.3 + row * 2.2],
        0.9,
        P,
      ),
    ),
  ),
  frontRuler: solid(FRONT_RULER, 0, 0.8, 3),
  frontTicksMinor: FRONT_TICKS.minor,
  frontTicksMajor: FRONT_TICKS.major,
};

/* --------------------------------------------------------------------------
   2. Rear Scale Rail (3..20 Players) + Sliding Scale Rider
   -------------------------------------------------------------------------- */
const POST_PLANS: Plan[] = [POST_L, POST_R].map((x) => ({
  x,
  y: RAIL_Y - POST / 2,
  w: POST,
  d: POST,
  r: 2,
}));
const RAIL_BEAM: Plan = {
  x: POST_L - 4,
  y: RAIL_Y - RAIL_D / 2,
  w: POST_R + POST - POST_L + 8,
  d: RAIL_D,
  r: 2,
};
const RAIL_FACE = RAIL_Y + RAIL_D / 2;

function buildRearScaleTicks() {
  const minor: string[] = [];
  const major: string[] = [];
  for (let p = 3; p <= 20; p++) {
    const x = RULE_FROM + (p - 3) * RULE_STEP;
    const isMajor = p === 3 || p % 5 === 0;
    (isMajor ? major : minor).push(
      segment([x, RAIL_FACE, RAIL_TOP - 1.1], [x, RAIL_FACE, RAIL_TOP - (isMajor ? 5.0 : 3.0)], P),
    );
  }
  return { minor: join(minor), major: join(major) };
}

const REAR_SCALE = buildRearScaleTicks();

export const RAIL_ART = {
  postFeet: POST_PLANS.map((plan) => solid(insetPlan(plan, -2.5), 0, 2, 4)),
  postFootScrews: POST_PLANS.flatMap((plan) => [
    at([plan.x - 1, plan.y + POST / 2, 2]),
    at([plan.x + POST + 1, plan.y + POST / 2, 2]),
  ]),
  posts: POST_PLANS.map((plan) => solid(plan, 2, RAIL_Z - 2, 4)),
  postSeams: join(
    POST_PLANS.map((plan) =>
      segment([plan.x + POST, plan.y + POST, 5], [plan.x + POST, plan.y + POST, RAIL_Z - 3], P),
    ),
  ),
  beam: solid(RAIL_BEAM, RAIL_Z, RAIL_H, 4, 0.7),
  beamScrews: POST_PLANS.map((plan) => at([plan.x + POST / 2, RAIL_Y, RAIL_TOP])),
  scaleBase: segment([RULE_FROM, RAIL_FACE, RAIL_TOP - 1.1], [RULE_TO, RAIL_FACE, RAIL_TOP - 1.1], P),
  scaleMinor: REAR_SCALE.minor,
  scaleMajor: REAR_SCALE.major,
  stops: [RULE_FROM - 3, RULE_TO + 3].map((x) =>
    solid({ x: x - 1.5, y: RAIL_Y - RAIL_D / 2 - 0.5, w: 3, d: RAIL_D + 1, r: 0.8 }, RAIL_TOP, 2.2, 3),
  ),
};

const RIDER_BLOCK: Plan = { x: -7, y: RAIL_Y - 5.5, w: 14, d: 11, r: 2 };
const RIDER_Z = RAIL_TOP;
const RIDER_H = 6.5;

export const RIDER_ART = {
  block: solid(RIDER_BLOCK, RIDER_Z, RIDER_H, 4, 0.6),
  knob: cyl(0, RAIL_Y, 2.8, RIDER_Z + RIDER_H, 3.2, 20),
  knobKnurl: knurl(0, RAIL_Y, 2.8, RIDER_Z + RIDER_H, RIDER_Z + RIDER_H + 3.2, 16, P),
  pointer: solid({ x: -1.6, y: RAIL_Y + RAIL_D / 2, w: 3.2, d: 1.5, r: 0.4 }, RAIL_TOP - 3.6, 5.2, 2),
  indexLine: segment([0, RAIL_FACE + 1.5, RAIL_TOP + 1.2], [0, RAIL_FACE + 1.5, RAIL_TOP - 3.4], P),
};

/* --------------------------------------------------------------------------
   3. Dispenser Frame, Floor Bed, Lane Dividers, Spring Anchors & Guide Rods
   -------------------------------------------------------------------------- */
const FRAME_BACK: Plan = {
  x: FRAME_LEFT_X,
  y: FRAME_BACK_Y,
  w: FRAME_RIGHT_X + FRAME_WALL - FRAME_LEFT_X,
  d: FRAME_WALL,
  r: 1.5,
};
const FRAME_LEFT: Plan = {
  x: FRAME_LEFT_X,
  y: FRAME_BACK_Y + FRAME_WALL,
  w: FRAME_WALL,
  d: FRAME_FRONT_Y - (FRAME_BACK_Y + FRAME_WALL),
  r: 1.2,
};
const FRAME_RIGHT: Plan = {
  x: FRAME_RIGHT_X,
  y: FRAME_BACK_Y + FRAME_WALL,
  w: FRAME_WALL,
  d: FRAME_FRONT_Y - (FRAME_BACK_Y + FRAME_WALL),
  r: 1.2,
};
const FLOOR_PLAN: Plan = {
  x: FRAME_LEFT_X + FRAME_WALL,
  y: FRAME_BACK_Y + FRAME_WALL,
  w: FRAME_RIGHT_X - (FRAME_LEFT_X + FRAME_WALL),
  d: FRAME_FRONT_Y - (FRAME_BACK_Y + FRAME_WALL),
  r: 0,
};

function buildFloorLines() {
  const lines: string[] = [];
  for (const dx of DIVIDER_X) {
    lines.push(onTop([[dx + 3, FLOOR_PLAN.y], [dx + 3, FLOOR_PLAN.y + FLOOR_PLAN.d]], 0.8, P));
  }
  for (let y = FLOOR_PLAN.y + 8; y < FLOOR_PLAN.y + FLOOR_PLAN.d; y += 8) {
    lines.push(onTop([[FLOOR_PLAN.x, y], [FLOOR_PLAN.x + FLOOR_PLAN.w, y]], 0.8, P));
  }
  return join(lines);
}

export const FRAME_ART = {
  back: solid(FRAME_BACK, 0, FRAME_H, 4, 0.7),
  backScrews: [-106, -42, 2, 66].map((x) => at([x, FRAME_BACK_Y + FRAME_WALL / 2, FRAME_H])),
  left: solid(FRAME_LEFT, 0, FRAME_H, 3, 0.7),
  leftScrews: [-22, 16].map((y) => at([FRAME_LEFT_X + FRAME_WALL / 2, y, FRAME_H])),
  right: solid(FRAME_RIGHT, 0, FRAME_H, 3, 0.7),
  rightScrews: [-22, 16].map((y) => at([FRAME_RIGHT_X + FRAME_WALL / 2, y, FRAME_H])),
  rightBore: sideRing([FRAME_RIGHT_X + FRAME_WALL, PLUNGER_Y, PLUNGER_Z], 2.4, "x", P, 16),
  floor: solid(FLOOR_PLAN, 0, 0.8, 2),
  floorGrid: buildFloorLines(),
  dividers: DIVIDER_X.map((x) =>
    solid({ x, y: FRAME_FRONT_Y - 12, w: 6, d: 12, r: 1.2 }, 0, 8, 3, 0.5),
  ),
  dividerScrews: DIVIDER_X.map((x) => at([x + 3, FRAME_FRONT_Y - 4, 8])),
};

export interface BayGeometry {
  anchor: SolidPaths;
  rod: SolidPaths;
  rodBore: string;
  sled: SolidPaths;
  pullLip: SolidPaths;
  card: SolidPaths;
  cardInner: string;
  emblem: SolidPaths;
  rivets: Flat[];
  textTransform: string;
}

export const BAYS: BayGeometry[] = BAY_X.map((cx) => {
  const sledPlan: Plan = { x: cx - 16, y: CARRIAGE_REST_BACK_Y, w: 32, d: 38, r: 2.5 };
  const pullPlan: Plan = { x: cx - 7, y: sledPlan.y + sledPlan.d - 0.5, w: 14, d: 4.5, r: 1 };
  const cardPlan: Plan = { x: cx - 13.5, y: sledPlan.y + 3, w: 27, d: 31, r: 2 };
  return {
    anchor: solid({ x: cx - 5, y: FRAME_BACK_Y + FRAME_WALL, w: 10, d: 6, r: 1.2 }, 0.8, 6.2, 3, 0.4),
    rod: solid({ x: cx - 1.5, y: SPRING_BACK_Y, w: 3, d: 60, r: 1.2 }, ROD_Z - 1.5, 3, 3),
    rodBore: sideRing([cx, sledPlan.y + sledPlan.d, ROD_Z], 2.0, "y", P, 14),
    sled: solid(sledPlan, 2.2, 4.0, 4, 0.6),
    pullLip: solid(pullPlan, 2.2, 2.8, 3, 0.4),
    card: solid(cardPlan, 6.2, 2.8, 4, 0.5),
    cardInner: planOutline(insetPlan(cardPlan, 2.0), 9.0, P, 4),
    emblem: cyl(cx, cardPlan.y + 10, 4.2, 9.0, 1.1, 24),
    rivets: [
      at([sledPlan.x + 3, sledPlan.y + sledPlan.d - 2.2, 6.2]),
      at([sledPlan.x + sledPlan.w - 3, sledPlan.y + sledPlan.d - 2.2, 6.2]),
    ],
    textTransform: topMatrix([cx, cardPlan.y + 22.5], 9.0, P, "x"),
  };
});

export function bayCoilAt(bayIndex: number, slideShare: number): { back: string; front: string } {
  const cx = BAY_X[bayIndex]!;
  const toY = CARRIAGE_REST_BACK_Y + slideShare * CARRIAGE_SLIDE_STROKE;
  return coil(SPRING_BACK_Y, toY, [cx, ROD_Z], COIL_R, COIL_TURNS, "y", P, 14);
}

/* --------------------------------------------------------------------------
   4. Clickable Side Plunger Mechanism
   -------------------------------------------------------------------------- */
export const PLUNGER_MOUNT_ART = {
  sleeve: solid(
    { x: FRAME_RIGHT_X + FRAME_WALL, y: PLUNGER_Y - 5, w: 14, d: 10, r: 1.8 },
    PLUNGER_Z - 3.8,
    7.6,
    4,
    0.5,
  ),
  bore: sideRing([FRAME_RIGHT_X + FRAME_WALL + 14, PLUNGER_Y, PLUNGER_Z], 2.6, "x", P, 16),
};

export const PLUNGER_MOVING_ART = {
  shaft: solid(
    { x: FRAME_RIGHT_X + FRAME_WALL + 4, y: PLUNGER_Y - 1.5, w: 36, d: 3, r: 1.2 },
    PLUNGER_Z - 1.5,
    3,
    3,
  ),
  collar: solid(
    { x: PLUNGER_SPRING_END, y: PLUNGER_Y - 3, w: 3.2, d: 6, r: 1.2 },
    PLUNGER_Z - 3,
    6,
    3,
    0.3,
  ),
  knobStem: solid(
    { x: PLUNGER_SPRING_END + 3, y: PLUNGER_Y - 2.5, w: 5, d: 5, r: 1 },
    PLUNGER_Z - 2.5,
    5,
    3,
  ),
  knobCap: cyl(PLUNGER_SPRING_END + 11, PLUNGER_Y, 6.5, 1.5, 9.5, 28, 0.6),
  knobKnurl: knurl(PLUNGER_SPRING_END + 11, PLUNGER_Y, 6.5, 2.2, 8.2, 24, P, 0.3),
  knobRing: ring(PLUNGER_SPRING_END + 11, PLUNGER_Y, 4.2, 11.0, P, 24),
  knobDot: [at([PLUNGER_SPRING_END + 11, PLUNGER_Y, 11.0])],
};

export function plungerCoilAt(pressShare: number): { back: string; front: string } {
  const endX = PLUNGER_SPRING_END - pressShare * PLUNGER_STROKE;
  return coil(PLUNGER_SPRING_START, endX, [PLUNGER_Y, PLUNGER_Z], PLUNGER_COIL_R, PLUNGER_COIL_TURNS, "x", P, 14);
}

/* --------------------------------------------------------------------------
   5. Circular Mechanical Dial Indicator (Impostor Ratio Gauge)
   -------------------------------------------------------------------------- */
const [DX, DY] = DIAL;
const DIAL_STAND: Plan = { x: DX - 20, y: DY - 20, w: 40, d: 40, r: 4 };
const DIAL_TICKS = radialTicks(
  DX,
  DY,
  DIAL_R - 2.6,
  DIAL_MAX_PCT,
  5,
  DIAL_TOP,
  [1.4, 2.8],
  P,
  DIAL_FROM,
  DIAL_SPAN,
);

const ZERO_SX = Math.sin(DIAL_FROM);
const ZERO_SY = -Math.cos(DIAL_FROM);

export const DIAL_ART = {
  stand: solid(DIAL_STAND, 0, DIAL_Z, 4, 0.6),
  standScrews: corners(DIAL_STAND, 4).map(([x, y]) => at([x, y, DIAL_Z])),
  sleeve: solid(
    { x: FRAME_RIGHT_X + FRAME_WALL, y: DY - 3, w: DX - DIAL_R - (FRAME_RIGHT_X + FRAME_WALL) + 1, d: 6, r: 1.2 },
    DIAL_Z + 1.5,
    5,
    3,
  ),
  clamp: cyl(FRAME_RIGHT_X + FRAME_WALL + 5, DY, 1.8, DIAL_Z + 6.5, 1.8, 16),
  lug: solid({ x: DX - DIAL_R - 4.5, y: DY - 4, w: 5.5, d: 8, r: 1.2 }, DIAL_Z + 1.5, 5.5, 3),
  puck: cyl(DX, DY, DIAL_R, DIAL_Z, DIAL_H, 56, 0.8),
  knurl: knurl(DX, DY, DIAL_R, DIAL_Z + DIAL_H - 3.2, DIAL_TOP, 72, P, 0.3),
  band: sideArc(DX, DY, DIAL_R, DIAL_Z + DIAL_H - 3.2, P, 40),
  bezel: ring(DX, DY, DIAL_R - 1.2, DIAL_TOP, P, 56),
  face: ring(DX, DY, DIAL_R - 2.6, DIAL_TOP, P, 56),
  minor: DIAL_TICKS.minor,
  major: DIAL_TICKS.major,
  zeroMark: lineOnTop(
    [DX + ZERO_SX * (DIAL_R - 6.0), DY + ZERO_SY * (DIAL_R - 6.0)],
    [DX + ZERO_SX * (DIAL_R - 2.4), DY + ZERO_SY * (DIAL_R - 2.4)],
    DIAL_TOP,
    P,
  ),
  crown: solid({ x: DX + DIAL_R - 0.6, y: DY - 2.6, w: 4.5, d: 5.2, r: 1.2 }, DIAL_Z + 2, 4.5, 3),
  crownCap: solid({ x: DX + DIAL_R + 3.6, y: DY - 3.4, w: 2.8, d: 6.8, r: 1.2 }, DIAL_Z + 1.2, 6.0, 3),
  hub: cyl(DX, DY, 2.1, DIAL_TOP, 1.2, 20),
  labelTransform: topMatrix([DX, DY + 8.5], DIAL_TOP, P, "x"),
};

export function needleAt(ratioPct: number): string {
  const clamped = Math.max(0, Math.min(DIAL_MAX_PCT, ratioPct));
  const angle = DIAL_FROM + (clamped / DIAL_MAX_PCT) * DIAL_SPAN;
  const sx = Math.sin(angle);
  const sy = -Math.cos(angle);
  const tail: Plane = [DX - sx * 4.5, DY - sy * 4.5];
  const tip: Plane = [DX + sx * (DIAL_R - 4.0), DY + sy * (DIAL_R - 4.0)];
  return pathOf([at([tail[0], tail[1], DIAL_TOP + 0.3]), at([tip[0], tip[1], DIAL_TOP + 0.3])]);
}

/* --------------------------------------------------------------------------
   6. Rest Position Reference Constants
   -------------------------------------------------------------------------- */
export const REST_COILS = BAY_X.map((_, i) => bayCoilAt(i, 1));
export const REST_PLUNGER_COIL = plungerCoilAt(0);
export const REST_NEEDLE = needleAt(100 / 6);
