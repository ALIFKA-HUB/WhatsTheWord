import * as React from "react";
import "../../components/iso/iso.css";
import "./dispenser.css";
import { Plate } from "../../components/iso/draw";
import { RoleDispenserArt } from "./art";
import { DEFAULT_PLAYERS, readoutOf } from "./model";

const INITIAL_READOUT = readoutOf(DEFAULT_PLAYERS);

export interface RoleDispenserFigureProps {
  controlledPlayers?: number;
  onPlayersChange?: (count: number) => void;
  hidePresetButtons?: boolean;
  withMrWhite?: boolean;
}

export const RoleDispenserFigure: React.FC<RoleDispenserFigureProps> = ({
  controlledPlayers,
  onPlayersChange,
  hidePresetButtons = false,
  withMrWhite = false,
}) => {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const players = controlledPlayers ?? DEFAULT_PLAYERS;
  const initialReadout = readoutOf(players, withMrWhite);

  React.useEffect(() => {
    if (!withMrWhite) return;
    const slot = wrapRef.current?.querySelector("[data-readout]");
    if (!slot) return;
    if (slot.textContent !== initialReadout) {
      slot.textContent = initialReadout;
    }
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => {
      if (slot.textContent !== initialReadout) {
        slot.textContent = initialReadout;
      }
    });
    observer.observe(slot, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [initialReadout, withMrWhite]);

  return (
    <div ref={wrapRef} className="iso rd-wrap" data-theme="light">
      <Plate
        fig="Instrumen 01"
        title="Mesin pembagi peran"
        hint="Klik tuas atau kartu di dalam mesin"
        readout={controlledPlayers !== undefined || withMrWhite ? initialReadout : INITIAL_READOUT}
        keys={[
          { mark: "lit", label: "Slot Penyamar (terpilih)" },
          { mark: "green", label: "Slot Warga" },
          { mark: "raised", label: "Kereta kartu & rel pemandu" },
          { mark: "edge", label: "Jarum rasio & skala 3..20" },
        ]}
        caption="Setiap ronde dimulai dari pembagian peran acak untuk 3 sampai 20 pemain. Menekan tuas menggeser posisi penyamar, sementara jarum dial membaca rasio sebenarnya."
      >
        <RoleDispenserArt
          controlledPlayers={controlledPlayers}
          onPlayersChange={onPlayersChange}
          hidePresetButtons={hidePresetButtons}
        />
      </Plate>
    </div>
  );
};

export default RoleDispenserFigure;
