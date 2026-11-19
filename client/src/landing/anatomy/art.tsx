import * as React from "react";
import { Dots, FaceText, Line, Solid } from "../../components/iso/draw";
import {
  BASE_ART,
  BAYS,
  DIAL_ART,
  FRAME_ART,
  PLUNGER_MOUNT_ART,
  PLUNGER_MOVING_ART,
  RAIL_ART,
  RIDER_ART,
} from "./geometry";
import { RoleDispenserLive } from "./live";
import { DEFAULT_IMPOSTOR_SLOT } from "./model";

const BASE = (
  <g key="base">
    <path className="iso-halo" d={BASE_ART.halo} />
    {BASE_ART.feet.map((parts, index) => (
      <g key={index}>
        {parts.map((paths, part) => (
          <Solid key={part} paths={paths} tone={part ? "mid" : "lo"} crease="faint" />
        ))}
      </g>
    ))}
    <Solid paths={BASE_ART.slab} tone="mid" crease="faint" />
    <Line d={BASE_ART.groove} tone="lo" />
    <Line d={BASE_ART.screwRings} tone="lo" />
    <Dots points={BASE_ART.screws} size={0.5} tone="mid" />
    <Solid paths={BASE_ART.labelPlate} tone="lo" crease="none" />
    <Line d={BASE_ART.labelLine} tone="faint" />
    <Line d={BASE_ART.labelRules} tone="lo" free />
    <Dots points={BASE_ART.labelScrews} size={0.45} tone="mid" />
    <Solid paths={BASE_ART.frontRuler} tone="lo" crease="none" />
    <Line d={BASE_ART.frontTicksMinor} tone="lo" />
    <Line d={BASE_ART.frontTicksMajor} tone="mid" />
  </g>
);

const RAIL = (
  <g key="rail">
    {RAIL_ART.postFeet.map((paths, index) => (
      <Solid key={index} paths={paths} tone="lo" crease="faint" />
    ))}
    <Dots points={RAIL_ART.postFootScrews} size={0.45} tone="mid" />
    {RAIL_ART.posts.map((paths, index) => (
      <Solid key={index} paths={paths} tone="mid" crease="faint" />
    ))}
    <Line d={RAIL_ART.postSeams} tone="faint" />
    <Solid paths={RAIL_ART.beam} tone="mid" crease="faint" />
    <Line d={RAIL_ART.scaleBase} tone="faint" />
    <Line d={RAIL_ART.scaleMinor} tone="lo" />
    <Line d={RAIL_ART.scaleMajor} tone="mid" />
    <Dots points={RAIL_ART.beamScrews} size={0.5} tone="mid" />
    {RAIL_ART.stops.map((paths, index) => (
      <Solid key={index} paths={paths} tone="mid" crease="faint" />
    ))}
  </g>
);

const RIDER = (
  <g key="rider">
    <Solid paths={RIDER_ART.block} tone="hi" crease="faint" />
    <Solid paths={RIDER_ART.knob} tone="mid" crease="faint" />
    <Line d={RIDER_ART.knobKnurl} tone="lo" />
    <Solid paths={RIDER_ART.pointer} tone="mid" crease="none" />
    <Line d={RIDER_ART.indexLine} tone="lit" />
  </g>
);

const FRAME_BACK = (
  <g key="frame-back">
    <Solid paths={FRAME_ART.back} tone="mid" crease="faint" />
    <Dots points={FRAME_ART.backScrews} size={0.5} tone="mid" />
    <Solid paths={FRAME_ART.left} tone="mid" crease="faint" />
    <Dots points={FRAME_ART.leftScrews} size={0.5} tone="mid" />
    <Solid paths={FRAME_ART.floor} tone="lo" crease="none" flat />
    <Line d={FRAME_ART.floorGrid} tone="faint" />
  </g>
);

const FRAME_RIGHT = (
  <g key="frame-right">
    <Solid paths={FRAME_ART.right} tone="mid" crease="faint" />
    <Dots points={FRAME_ART.rightScrews} size={0.5} tone="mid" />
    <Line d={FRAME_ART.rightBore} tone="lo" />
  </g>
);

const BAY_ANCHORS = BAYS.map((bay, i) => (
  <Solid key={`anchor-${i}`} paths={bay.anchor} tone="mid" crease="faint" />
));

const BAY_RODS = BAYS.map((bay, i) => (
  <g key={`rod-${i}`}>
    <Solid paths={bay.rod} tone="mid" crease="none" />
  </g>
));

const BAY_DIVIDERS = FRAME_ART.dividers.map((paths, i) => (
  <g key={`div-${i}`}>
    <Solid paths={paths} tone="mid" crease="faint" />
    <Dots points={[FRAME_ART.dividerScrews[i]!]} size={0.45} tone="mid" />
  </g>
));

const BAY_CARRIAGES = BAYS.map((bay, i) => {
  const isDefaultImpostor = i === DEFAULT_IMPOSTOR_SLOT;
  return {
    sled: (
      <React.Fragment key={`sled-${i}`}>
        <Solid paths={bay.sled} tone="mid" crease="faint" />
        <Solid paths={bay.pullLip} tone="mid" crease="faint" />
        <Line d={bay.rodBore} tone="lo" />
      </React.Fragment>
    ),
    card: (
      <Solid
        key={`card-${i}`}
        className="rd-card-solid rd-card-slab"
        paths={bay.card}
        tone="hi"
        crease="faint"
        lit={isDefaultImpostor}
      />
    ),
    emblem: (
      <Solid
        key={`emblem-${i}`}
        className="rd-emblem-solid"
        paths={bay.emblem}
        tone="mid"
        crease="faint"
        lit={isDefaultImpostor}
      />
    ),
    cardInner: <Line key={`inner-${i}`} className="rd-card-inner" d={bay.cardInner} tone="mid" />,
    rivets: <Dots key={`rivets-${i}`} points={bay.rivets} size={0.45} tone="mid" />,
    textTransform: bay.textTransform,
  };
});

const PLUNGER_MOUNT = (
  <g key="plunger-mount">
    <Solid paths={PLUNGER_MOUNT_ART.sleeve} tone="mid" crease="faint" />
    <Line d={PLUNGER_MOUNT_ART.bore} tone="lo" />
  </g>
);

const PLUNGER_BODY = (
  <g key="plunger-body">
    <Solid paths={PLUNGER_MOVING_ART.shaft} tone="mid" crease="none" />
    <Solid paths={PLUNGER_MOVING_ART.collar} tone="mid" crease="faint" />
    <Solid paths={PLUNGER_MOVING_ART.knobStem} tone="mid" crease="none" />
    <Solid paths={PLUNGER_MOVING_ART.knobCap} tone="hi" crease="faint" lit />
    <Line d={PLUNGER_MOVING_ART.knobKnurl} tone="lo" />
    <Line d={PLUNGER_MOVING_ART.knobRing} tone="lit" />
    <Dots points={PLUNGER_MOVING_ART.knobDot} size={0.5} tone="hi" />
  </g>
);

const DIAL_BACK = (
  <g key="dial-back">
    <Solid paths={DIAL_ART.stand} tone="lo" crease="faint" />
    <Dots points={DIAL_ART.standScrews} size={0.45} tone="mid" />
    <Solid paths={DIAL_ART.sleeve} tone="mid" crease="faint" />
    <Solid paths={DIAL_ART.clamp} tone="mid" crease="none" />
    <Solid paths={DIAL_ART.lug} tone="mid" crease="faint" />
    <Solid paths={DIAL_ART.puck} tone="hi" crease="lo" />
    <Line d={DIAL_ART.band} tone="faint" />
    <Line d={DIAL_ART.knurl} tone="lo" />
    <Line d={DIAL_ART.bezel} tone="lo" />
    <Line d={DIAL_ART.face} tone="faint" />
    <Line d={DIAL_ART.minor} tone="lo" />
    <Line d={DIAL_ART.major} tone="mid" />
    <Line d={DIAL_ART.zeroMark} tone="hi" />
    <FaceText transform={DIAL_ART.labelTransform} size={2.8} tone="mid" anchor="middle">
      %
    </FaceText>
  </g>
);

const DIAL_HUB = (
  <g key="dial-hub">
    <Solid paths={DIAL_ART.hub} tone="hi" crease="faint" />
    <Solid paths={DIAL_ART.crown} tone="mid" crease="faint" />
    <Solid paths={DIAL_ART.crownCap} tone="mid" crease="faint" />
  </g>
);

const LABEL =
  "Mesin pembagi peran isometrik dengan empat kereta kartu yang meluncur di atas rel pemandu, pegas penarik, tuas pendorong samping, skala pemain 3 sampai 20, dan jarum dial penunjuk rasio penyamar.";

export interface RoleDispenserArtProps {
  controlledPlayers?: number;
  onPlayersChange?: (count: number) => void;
  hidePresetButtons?: boolean;
}

export function RoleDispenserArt({
  controlledPlayers,
  onPlayersChange,
  hidePresetButtons,
}: RoleDispenserArtProps = {}) {
  return (
    <RoleDispenserLive
      label={LABEL}
      base={BASE}
      rail={RAIL}
      rider={RIDER}
      frameBack={FRAME_BACK}
      frameRight={FRAME_RIGHT}
      bayAnchors={BAY_ANCHORS}
      bayRods={BAY_RODS}
      bayDividers={BAY_DIVIDERS}
      bayCarriages={BAY_CARRIAGES}
      plungerMount={PLUNGER_MOUNT}
      plungerBody={PLUNGER_BODY}
      dialBack={DIAL_BACK}
      dialHub={DIAL_HUB}
      controlledPlayers={controlledPlayers}
      onPlayersChange={onPlayersChange}
      hidePresetButtons={hidePresetButtons}
    />
  );
}
