import { boxCorners, fitProjection, iso, type Flat, type Plan, type Point3, type Projection } from "../../components/iso/iso-kit";
import { MAX_PLAYERS, MIN_PLAYERS } from "./model";

export const WIDTH = 620;
export const HEIGHT = 360;
const PAD = 28;
export const AZIMUTH = 52;
export const ELEVATION = 30;

export const BASE: Plan = { x: -138, y: -82, w: 300, d: 156, r: 9 };
export const BASE_H = 10;
export const FOOT_H = 5;

export const POST_L = -127;
export const POST_R = 66;
export const POST = 11;
export const RAIL_Y = -60;
export const RAIL_D = 8;
export const RAIL_Z = 44;
export const RAIL_H = 8;
export const RAIL_TOP = RAIL_Z + RAIL_H;

export const RULE_FROM = -110;
export const RULE_STEP = 10;
export const RULE_TO = RULE_FROM + (MAX_PLAYERS - MIN_PLAYERS) * RULE_STEP;

export function playerToX(players: number): number {
  const clamped = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, players));
  return RULE_FROM + (clamped - MIN_PLAYERS) * RULE_STEP;
}

export const FRAME_BACK_Y = -44;
export const FRAME_FRONT_Y = 32;
export const FRAME_LEFT_X = -116;
export const FRAME_RIGHT_X = 70;
export const FRAME_WALL = 8;
export const FRAME_H = 10;

export const BAY_X = [-86, -42, 2, 46] as const;
export const DIVIDER_X = [-67, -23, 21] as const;
export const ROD_Z = 4.2;
export const SPRING_BACK_Y = -30;
export const CARRIAGE_REST_BACK_Y = -20;
export const CARRIAGE_SLIDE_STROKE = 24;
export const COIL_R = 3.6;
export const COIL_TURNS = 5;

export const PLUNGER_Y = -18;
export const PLUNGER_Z = 6;
export const PLUNGER_SPRING_START = 92;
export const PLUNGER_SPRING_END = 118;
export const PLUNGER_STROKE = 14;
export const PLUNGER_COIL_R = 3.6;
export const PLUNGER_COIL_TURNS = 5;

export const DIAL: Flat = [122, 34];
export const DIAL_R = 19;
export const DIAL_Z = 3;
export const DIAL_H = 9;
export const DIAL_TOP = DIAL_Z + DIAL_H;
export const DIAL_FROM = -Math.PI * 0.75;
export const DIAL_SPAN = Math.PI * 1.5;
export const DIAL_MAX_PCT = 35;

export const P: Projection = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    ...boxCorners(
      { x: POST_L - 4, y: RAIL_Y - RAIL_D / 2, w: POST_R + POST - POST_L + 8, d: RAIL_D, r: 0 },
      RAIL_Z,
      RAIL_TOP + 10,
    ),
  ],
  WIDTH,
  HEIGHT,
  { pad: PAD, azimuth: AZIMUTH, elevation: ELEVATION },
);

export const at = (point: Point3): Flat => iso(point, P);

const ORIGIN = at([0, 0, 0]);
const diff = (a: Flat, b: Flat): Flat => [a[0] - b[0], a[1] - b[1]];
export const EX = diff(at([1, 0, 0]), ORIGIN);
export const EY = diff(at([0, 1, 0]), ORIGIN);
export const EZ = diff(at([0, 0, 1]), ORIGIN);

const fine = (v: number) => Math.round(v * 100) / 100;

export const shiftX = (x: number) => `translate(${fine(EX[0] * x)} ${fine(EX[1] * x)})`;
export const shiftY = (y: number) => `translate(${fine(EY[0] * y)} ${fine(EY[1] * y)})`;
