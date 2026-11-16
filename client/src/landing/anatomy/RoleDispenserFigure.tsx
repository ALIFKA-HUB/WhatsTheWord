import * as React from "react";
import "../../components/iso/iso.css";
import "./dispenser.css";
import { Plate } from "../../components/iso/draw";
import { RoleDispenserArt } from "./art";
import { DEFAULT_PLAYERS, readoutOf } from "./model";

const INITIAL_READOUT = readoutOf(DEFAULT_PLAYERS);

export const RoleDispenserFigure: React.FC = () => {
  return (
    <div className="iso rd-wrap" data-theme="light">
      <Plate
        fig="Instrumen 01"
        title="Mesin pembagi peran"
        hint="Klik tuas atau pilih pemain"
        readout={INITIAL_READOUT}
        keys={[
          { mark: "lit", label: "Slot Penyamar (terpilih)" },
          { mark: "green", label: "Slot Warga" },
          { mark: "raised", label: "Kereta kartu & rel pemandu" },
          { mark: "edge", label: "Jarum rasio & skala 3..20" },
        ]}
        caption="Setiap ronde dimulai dari mekanisme acak yang adil untuk 3 sampai 20 pemain. Menekan tuas samping menggeser posisi Penyamar di antara kereta kartu, sementara jarum dial membaca rasio penyamar sebenarnya."
      >
        <RoleDispenserArt />
      </Plate>
    </div>
  );
};

export default RoleDispenserFigure;
