export const PLAYER_PRESETS = [4, 6, 8, 10] as const;
export type PlayerPreset = (typeof PLAYER_PRESETS)[number];

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;
export const SLOT_COUNT = 4;
export const DEFAULT_PLAYERS = 6;
export const DEFAULT_IMPOSTOR_SLOT = 2;

export interface SpringState {
  at: number;
  rate: number;
}

export interface DispenserModel {
  playerCount: number;
  impostorSlot: number;
  carriages: SpringState[];
  plunger: SpringState;
  rider: SpringState;
  needle: SpringState;
  dealing: boolean;
  dealAge: number;
}

export function impostorCountFor(players: number): number {
  return players >= 3 ? 1 : 0;
}

export function civilianCountFor(players: number): number {
  return Math.max(1, players - impostorCountFor(players));
}

export function ratioExactFor(players: number): number {
  return (impostorCountFor(players) / Math.max(1, players)) * 100;
}

export function ratioPercentFor(players: number): number {
  return Math.round(ratioExactFor(players));
}

export function readoutOf(players: number, shownRatio?: number): string {
  const imp = impostorCountFor(players);
  const civ = civilianCountFor(players);
  const pct = Math.round(shownRatio ?? ratioExactFor(players));
  return `${players} Pemain \u00b7 ${civ} Warga \u00b7 ${imp} Penyamar \u00b7 ${pct}%`;
}

export function createDispenserModel(
  playerCount = DEFAULT_PLAYERS,
  impostorSlot = DEFAULT_IMPOSTOR_SLOT,
): DispenserModel {
  return {
    playerCount,
    impostorSlot,
    carriages: Array.from({ length: SLOT_COUNT }, () => ({ at: 1, rate: 0 })),
    plunger: { at: 0, rate: 0 },
    rider: { at: playerCount, rate: 0 },
    needle: { at: ratioExactFor(playerCount), rate: 0 },
    dealing: false,
    dealAge: 0,
  };
}

export function nextSlotFrom(current: number): number {
  return (current + 1) % SLOT_COUNT;
}

const SUB_RATE = 240;
const QUIET = 5e-4;

export function stepSpring(
  spring: SpringState,
  target: number,
  dt: number,
  stiffness: number,
  damping: number,
  calm: boolean,
): boolean {
  if (calm) {
    spring.at = target;
    spring.rate = 0;
    return true;
  }
  const steps = Math.max(Math.ceil(dt * SUB_RATE), 1);
  const slice = dt / steps;
  for (let i = 0; i < steps; i++) {
    spring.rate += (target - spring.at) * stiffness * slice - spring.rate * damping * slice;
    spring.at += spring.rate * slice;
  }
  if (Math.abs(target - spring.at) < QUIET && Math.abs(spring.rate) < QUIET) {
    spring.at = target;
    spring.rate = 0;
  }
  return spring.at === target && spring.rate === 0;
}

const STAGGER_STEP = 0.065;
const RETRACT_DURATION = 0.22;

export function stepDispenser(
  model: DispenserModel,
  dt: number,
  calm: boolean,
  peekSlots: boolean[],
): boolean {
  if (model.dealing) {
    model.dealAge += dt;
    if (calm || model.dealAge >= RETRACT_DURATION + SLOT_COUNT * STAGGER_STEP) {
      model.dealing = false;
    }
  }

  const plungerTarget = model.dealing && model.dealAge < RETRACT_DURATION ? 1 : 0;
  const plungerDone = stepSpring(model.plunger, plungerTarget, dt, 420, 26, calm);
  const riderDone = stepSpring(model.rider, model.playerCount, dt, 240, 24, calm);
  const needleDone = stepSpring(model.needle, ratioExactFor(model.playerCount), dt, 210, 20, calm);

  let carriagesDone = true;
  for (let i = 0; i < SLOT_COUNT; i++) {
    let target = peekSlots[i] ? 1.24 : 1;
    if (model.dealing && !calm) {
      const slotReleaseAt = RETRACT_DURATION + i * STAGGER_STEP;
      if (model.dealAge < slotReleaseAt) {
        target = 0;
      }
    }
    const done = stepSpring(model.carriages[i]!, target, dt, 340, 22, calm);
    if (!done) carriagesDone = false;
  }

  return !model.dealing && plungerDone && riderDone && needleDone && carriagesDone;
}
