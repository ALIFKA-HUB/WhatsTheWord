"use client";

import * as React from "react";
import { IsoFigure } from "../../components/iso/draw";
import { asksForStillness, useReadout } from "../../components/iso/live";
import { bayCoilAt, needleAt, plungerCoilAt } from "./geometry";
import {
  DEFAULT_IMPOSTOR_SLOT,
  DEFAULT_PLAYERS,
  PLAYER_PRESETS,
  SLOT_COUNT,
  createDispenserModel,
  nextSlotFrom,
  ratioExactFor,
  readoutOf,
  stepDispenser,
  type DispenserModel,
  type PlayerPreset,
} from "./model";
import {
  CARRIAGE_SLIDE_STROKE,
  HEIGHT,
  PLUNGER_STROKE,
  WIDTH,
  playerToX,
  shiftX,
  shiftY,
} from "./view";

const TOUR_FIRST_MS = 1400;
const TOUR_RESUME_MS = 3600;
const TOUR_STEP_SECONDS = 3.0;
const MOST_DT = 1 / 30;

interface BayNodes {
  carriage: SVGGElement | null;
  coilBack: SVGPathElement | null;
  coilFront: SVGPathElement | null;
  label: SVGTextElement | null;
  hitGroup: SVGGElement | null;
}

interface RigNodes {
  rider: SVGGElement | null;
  plungerGroup: SVGGElement | null;
  plungerCoilBack: SVGPathElement | null;
  plungerCoilFront: SVGPathElement | null;
  needle: SVGPathElement | null;
  bays: BayNodes[];
}

export interface DispenserLiveProps {
  label: string;
  base: React.ReactNode;
  rail: React.ReactNode;
  rider: React.ReactNode;
  frameBack: React.ReactNode;
  frameRight: React.ReactNode;
  bayAnchors: React.ReactNode[];
  bayRods: React.ReactNode[];
  bayDividers: React.ReactNode[];
  bayCarriages: Array<{
    sled: React.ReactNode;
    card: React.ReactNode;
    emblem: React.ReactNode;
    cardInner: React.ReactNode;
    rivets: React.ReactNode;
    textTransform: string;
  }>;
  plungerMount: React.ReactNode;
  plungerBody: React.ReactNode;
  dialBack: React.ReactNode;
  dialHub: React.ReactNode;
  controlledPlayers?: number;
  onPlayersChange?: (count: number) => void;
  hidePresetButtons?: boolean;
}

function setLitAttr(node: Element | null | undefined, active: boolean) {
  if (!node) return;
  if (active) node.setAttribute("data-lit", "");
  else node.removeAttribute("data-lit");
}

function applyModelToDom(nodes: RigNodes, model: DispenserModel) {
  nodes.rider?.setAttribute("transform", shiftX(playerToX(model.rider.at)));

  const plungerShift = -model.plunger.at * PLUNGER_STROKE;
  nodes.plungerGroup?.setAttribute("transform", shiftX(plungerShift));
  const pCoil = plungerCoilAt(model.plunger.at);
  nodes.plungerCoilBack?.setAttribute("d", pCoil.back);
  nodes.plungerCoilFront?.setAttribute("d", pCoil.front);

  nodes.needle?.setAttribute("d", needleAt(model.needle.at));

  for (let i = 0; i < SLOT_COUNT; i++) {
    const bay = nodes.bays[i];
    if (!bay) continue;
    const share = model.carriages[i]!.at;
    bay.carriage?.setAttribute("transform", shiftY(share * CARRIAGE_SLIDE_STROKE));
    const bCoil = bayCoilAt(i, share);
    bay.coilBack?.setAttribute("d", bCoil.back);
    bay.coilFront?.setAttribute("d", bCoil.front);

    const isImpostor = i === model.impostorSlot;
    const cardSolid = bay.hitGroup?.querySelector(".rd-card-solid");
    const emblemSolid = bay.hitGroup?.querySelector(".rd-emblem-solid");
    setLitAttr(cardSolid, isImpostor);
    setLitAttr(emblemSolid, isImpostor);
    if (bay.hitGroup) {
      const nextRole = isImpostor ? "penyamar" : "warga";
      if (bay.hitGroup.getAttribute("data-role") !== nextRole) {
        bay.hitGroup.setAttribute("data-role", nextRole);
      }
    }
    if (bay.label) {
      const text = isImpostor ? "Penyamar" : "Warga";
      if (bay.label.textContent !== text) bay.label.textContent = text;
    }
  }
}

export function RoleDispenserLive(props: DispenserLiveProps) {
  const { anchor, say } = useReadout<HTMLDivElement>();
  const modelRef = React.useRef<DispenserModel>(
    createDispenserModel(DEFAULT_PLAYERS, DEFAULT_IMPOSTOR_SLOT),
  );
  const peekRef = React.useRef<boolean[]>([false, false, false, false]);

  const nodesRef = React.useRef<RigNodes>({
    rider: null,
    plungerGroup: null,
    plungerCoilBack: null,
    plungerCoilFront: null,
    needle: null,
    bays: Array.from({ length: SLOT_COUNT }, () => ({
      carriage: null,
      coilBack: null,
      coilFront: null,
      label: null,
      hitGroup: null,
    })),
  });

  const [selectedPlayers, setSelectedPlayers] = React.useState<number>(DEFAULT_PLAYERS);
  const [liveAnnouncement, setLiveAnnouncement] = React.useState<string>("");

  const frameRef = React.useRef(0);
  const lastRef = React.useRef(0);
  const tourClockRef = React.useRef(0);
  const tourStepIndexRef = React.useRef(0);
  const touringRef = React.useRef(false);

  const [visible, setVisible] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [idle, setIdle] = React.useState(true);
  const [poke, setPoke] = React.useState(0);

  const stopLoop = React.useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
  }, []);

  const drawFrame = React.useCallback(() => {
    const model = modelRef.current;
    applyModelToDom(nodesRef.current, model);
    say(readoutOf(model.playerCount, model.needle.at));
  }, [say]);

  const runLoop = React.useCallback(() => {
    if (frameRef.current) return;
    lastRef.current = 0;
    const tick = (now: number) => {
      const dt = lastRef.current ? Math.min((now - lastRef.current) / 1000, MOST_DT) : 1 / 60;
      lastRef.current = now;
      const calm = asksForStillness();

      if (touringRef.current && !calm) {
        tourClockRef.current += dt;
        if (tourClockRef.current >= TOUR_STEP_SECONDS) {
          tourClockRef.current = 0;
          const nextIdx = (tourStepIndexRef.current + 1) % PLAYER_PRESETS.length;
          tourStepIndexRef.current = nextIdx;
          const nextPreset = PLAYER_PRESETS[nextIdx]!;
          const model = modelRef.current;
          model.playerCount = nextPreset;
          model.impostorSlot = nextSlotFrom(model.impostorSlot);
          model.dealing = true;
          model.dealAge = 0;
          peekRef.current = [false, false, false, false];
          setSelectedPlayers(nextPreset);
          props.onPlayersChange?.(nextPreset);
        }
      }

      const settled = stepDispenser(modelRef.current, dt, calm, peekRef.current);
      drawFrame();
      const keepGoing = !settled || (touringRef.current && !calm);
      frameRef.current = keepGoing ? requestAnimationFrame(tick) : 0;
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [drawFrame, props.onPlayersChange]);

  const wakeUser = React.useCallback(() => {
    touringRef.current = false;
    setIdle(false);
    setPoke((n) => n + 1);
  }, []);

  const triggerDeal = React.useCallback(
    (nextPlayers?: number, fromUser = true) => {
      if (fromUser) wakeUser();
      const model = modelRef.current;
      if (nextPlayers !== undefined) {
        model.playerCount = nextPlayers;
        setSelectedPlayers(nextPlayers);
        if (fromUser) props.onPlayersChange?.(nextPlayers);
      }
      model.impostorSlot = nextSlotFrom(model.impostorSlot);
      model.dealing = true;
      model.dealAge = 0;
      peekRef.current = [false, false, false, false];
      if (asksForStillness()) {
        stepDispenser(model, 1, true, peekRef.current);
        drawFrame();
      } else {
        runLoop();
      }
      setLiveAnnouncement(readoutOf(model.playerCount));
    },
    [drawFrame, props.onPlayersChange, runLoop, wakeUser],
  );

  React.useEffect(() => {
    const next = props.controlledPlayers;
    if (next !== undefined && next !== modelRef.current.playerCount) {
      triggerDeal(next, false);
    }
  }, [props.controlledPlayers, triggerDeal]);

  const toggleCardPeek = React.useCallback(
    (slotIndex: number) => {
      wakeUser();
      peekRef.current[slotIndex] = !peekRef.current[slotIndex];
      if (asksForStillness()) {
        stepDispenser(modelRef.current, 1, true, peekRef.current);
        drawFrame();
      } else {
        runLoop();
      }
    },
    [drawFrame, runLoop, wakeUser],
  );

  React.useEffect(() => {
    const node = anchor.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(Boolean(entries.at(-1)?.isIntersecting)),
      { rootMargin: "120px 0px" },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      stopLoop();
    };
  }, [anchor, stopLoop]);

  const engaged = hovering || focused;

  React.useEffect(() => {
    if (engaged) {
      setIdle(false);
      return;
    }
    const timer = window.setTimeout(() => setIdle(true), TOUR_RESUME_MS);
    return () => window.clearTimeout(timer);
  }, [engaged, poke]);

  const shouldTour = visible && idle && !engaged;

  React.useEffect(() => {
    if (!visible) {
      touringRef.current = false;
      stopLoop();
      return;
    }
    if (shouldTour && !asksForStillness()) {
      const timer = window.setTimeout(() => {
        touringRef.current = true;
        tourClockRef.current = 0;
        runLoop();
      }, TOUR_FIRST_MS);
      return () => {
        window.clearTimeout(timer);
        touringRef.current = false;
      };
    }
    touringRef.current = false;
    return undefined;
  }, [visible, shouldTour, runLoop, stopLoop]);

  React.useEffect(() => {
    drawFrame();
  }, [drawFrame]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const currentIndex = PLAYER_PRESETS.indexOf(selectedPlayers as PlayerPreset);
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = PLAYER_PRESETS[(Math.max(0, currentIndex) + 1) % PLAYER_PRESETS.length]!;
      triggerDeal(next);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      const prev =
        PLAYER_PRESETS[(Math.max(0, currentIndex) - 1 + PLAYER_PRESETS.length) % PLAYER_PRESETS.length]!;
      triggerDeal(prev);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      triggerDeal(undefined);
    }
  };

  return (
    <div
      ref={anchor}
      className="rd-stage"
      tabIndex={0}
      role="group"
      aria-label="Mesin pembagi peran interaktif: pilih jumlah pemain atau tekan tuas untuk mengacak slot penyamar"
      onKeyDown={handleKeyDown}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHovering(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setHovering(false);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <IsoFigure width={WIDTH} height={HEIGHT} label={props.label}>
        {props.base}
        {props.rail}
        <g
          ref={(el) => {
            nodesRef.current.rider = el;
          }}
          transform={shiftX(playerToX(DEFAULT_PLAYERS))}
        >
          {props.rider}
        </g>

        {props.frameBack}

        {Array.from({ length: SLOT_COUNT }, (_, i) => {
          const cardData = props.bayCarriages[i]!;
          const isDefaultImpostor = i === DEFAULT_IMPOSTOR_SLOT;
          return (
            <React.Fragment key={`bay-${i}`}>
              {props.bayAnchors[i]}
              <path
                ref={(el) => {
                  nodesRef.current.bays[i]!.coilBack = el;
                }}
                className="iso-line"
                data-tone="lo"
                d={bayCoilAt(i, 1).back}
              />
              {props.bayRods[i]}
              <path
                ref={(el) => {
                  nodesRef.current.bays[i]!.coilFront = el;
                }}
                className="iso-line"
                data-tone="mid"
                d={bayCoilAt(i, 1).front}
              />
              <g
                ref={(el) => {
                  nodesRef.current.bays[i]!.carriage = el;
                }}
                transform={shiftY(CARRIAGE_SLIDE_STROKE)}
              >
                <g
                  ref={(el) => {
                    nodesRef.current.bays[i]!.hitGroup = el;
                  }}
                  className="rd-card-hit"
                  data-role={isDefaultImpostor ? "penyamar" : "warga"}
                  onClick={() => toggleCardPeek(i)}
                >
                  {cardData.sled}
                  {cardData.card}
                  {cardData.emblem}
                  {cardData.cardInner}
                  {cardData.rivets}
                  <text
                    ref={(el) => {
                      nodesRef.current.bays[i]!.label = el;
                    }}
                    className="iso-face-text rd-card-label"
                    transform={cardData.textTransform}
                    fontSize={3.1}
                    textAnchor="middle"
                  >
                    {isDefaultImpostor ? "Penyamar" : "Warga"}
                  </text>
                </g>
              </g>
              {i < SLOT_COUNT - 1 ? props.bayDividers[i] : null}
            </React.Fragment>
          );
        })}

        {props.frameRight}
        {props.plungerMount}

        <path
          ref={(el) => {
            nodesRef.current.plungerCoilBack = el;
          }}
          className="iso-line"
          data-tone="lo"
          d={plungerCoilAt(0).back}
        />
        <g
          ref={(el) => {
            nodesRef.current.plungerGroup = el;
          }}
          className="rd-plunger-hit"
          onClick={() => triggerDeal(undefined)}
        >
          {props.plungerBody}
        </g>
        <path
          ref={(el) => {
            nodesRef.current.plungerCoilFront = el;
          }}
          className="iso-line"
          data-tone="mid"
          d={plungerCoilAt(0).front}
        />

        {props.dialBack}
        <path
          ref={(el) => {
            nodesRef.current.needle = el;
          }}
          className="iso-line rd-needle"
          data-tone="lit"
          d={needleAt(ratioExactFor(DEFAULT_PLAYERS))}
        />
        {props.dialHub}
      </IsoFigure>

      <div className="rd-controls">
        {!props.hidePresetButtons ? (
          <div className="rd-preset-group" role="group" aria-label="Pilih jumlah pemain">
            <span className="rd-preset-label">Pemain:</span>
            {PLAYER_PRESETS.map((count) => (
              <button
                key={count}
                type="button"
                className="rd-btn"
                aria-pressed={selectedPlayers === count}
                onClick={() => triggerDeal(count)}
              >
                {count}
              </button>
            ))}
          </div>
        ) : (
          <span className="rd-preset-label">
            Klik kartu di mesin untuk intip, atau tekan tuas di kanan.
          </span>
        )}
        <button
          type="button"
          className="rd-btn rd-btn--action"
          onClick={() => triggerDeal(undefined)}
        >
          Bagi Ulang
        </button>
      </div>

      <div className="rd-sr-only" aria-live="polite">
        {liveAnnouncement}
      </div>
    </div>
  );
}
