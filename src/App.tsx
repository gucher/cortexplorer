import { Loader } from "@react-three/drei";
import { BrainCanvas } from "./scene/BrainCanvas";
import { StructureTree } from "./ui/StructureTree";
import { InfoPanel } from "./ui/InfoPanel";
import { Toolbar } from "./ui/Toolbar";
import { DisplayControls } from "./ui/DisplayControls";
import { Credits } from "./ui/Credits";
import { useBrainStore } from "./state/store";

export default function App() {
  const selectedKey = useBrainStore((s) => s.selectedKey);
  const mobileTreeOpen = useBrainStore((s) => s.mobileTreeOpen);
  const toggleMobileTree = useBrainStore((s) => s.toggleMobileTree);
  const select = useBrainStore((s) => s.select);

  return (
    <div className="app">
      <div className="stage">
        <BrainCanvas />
      </div>

      <header className="brand">
        <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden>
          <path
            d="M16 4c-3 0-5 1.8-5.5 4.2C8.4 8.6 7 10.3 7 12.4c0 1 .3 1.8.8 2.5-.8.7-1.3 1.7-1.3 2.9 0 1.7 1 3.1 2.5 3.7.2 2.3 2 4 4.3 4 .9 0 1.7-.3 2.4-.7v-17C16.7 6 16 5 16 4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M16 4c3 0 5 1.8 5.5 4.2C23.6 8.6 25 10.3 25 12.4c0 1-.3 1.8-.8 2.5.8.7 1.3 1.7 1.3 2.9 0 1.7-1 3.1-2.5 3.7-.2 2.3-2 4-4.3 4-.9 0-1.7-.3-2.4-.7v-17C15.3 6 16 5 16 4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            opacity="0.55"
          />
        </svg>
        <div className="brand__text">
          <div className="brand__name">Cortexplorer</div>
          <div className="brand__sub">Interactive brain atlas</div>
        </div>
      </header>

      <DisplayControls />

      {/* Tap-away backdrop for the mobile structure sheet. */}
      {mobileTreeOpen && (
        <div className="sheet-backdrop" onClick={toggleMobileTree} />
      )}

      <aside className={"panel panel--left" + (mobileTreeOpen ? " is-open" : "")}>
        <button
          className="panel__grip"
          onClick={toggleMobileTree}
          aria-label="Close structures"
        />
        <StructureTree />
      </aside>

      <aside className={"panel panel--right" + (selectedKey ? " is-open" : "")}>
        <button
          className="panel__grip"
          onClick={() => select(null)}
          aria-label="Close panel"
        />
        <InfoPanel />
      </aside>

      <Toolbar />
      <Credits />

      <Loader
        containerStyles={{ background: "rgba(5,7,11,0.85)" }}
        innerStyles={{ width: 180, height: 3 }}
        barStyles={{ background: "#74a4ff", height: 3 }}
        dataStyles={{
          color: "#9aa6ba",
          fontSize: 12,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "0.4px",
        }}
        dataInterpolation={(p) => `Loading brain… ${p.toFixed(0)}%`}
      />
    </div>
  );
}
