import { useBrainStore, type Axis, type ViewPreset } from "../state/store";

const VIEWS: { label: string; view: ViewPreset }[] = [
  { label: "Front", view: "front" },
  { label: "Back", view: "back" },
  { label: "Left", view: "left" },
  { label: "Right", view: "right" },
  { label: "Top", view: "top" },
  { label: "Bottom", view: "bottom" },
];

const AXES: Axis[] = ["x", "y", "z"];

export function Toolbar() {
  const setView = useBrainStore((s) => s.setView);
  const isolate = useBrainStore((s) => s.isolate);
  const toggleIsolate = useBrainStore((s) => s.toggleIsolate);
  const explode = useBrainStore((s) => s.explode);
  const setExplode = useBrainStore((s) => s.setExplode);
  const reset = useBrainStore((s) => s.reset);
  const slice = useBrainStore((s) => s.slice);
  const setSlice = useBrainStore((s) => s.setSlice);

  return (
    <div className="dock">
      <button className="dock__btn dock__btn--primary" onClick={reset}>
        Reset
      </button>

      <div className="dock__sep" />

      <div className="dock__views">
        {VIEWS.map((v) => (
          <button
            key={v.view}
            className="dock__btn"
            onClick={() => setView(v.view)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="dock__sep" />

      <button
        className={"dock__btn dock__toggle" + (isolate ? " is-active" : "")}
        onClick={toggleIsolate}
        aria-pressed={isolate}
      >
        Isolate
      </button>

      <div className="dock__explode">
        <label htmlFor="explode">Explode</label>
        <input
          id="explode"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={explode}
          onChange={(e) => setExplode(parseFloat(e.target.value))}
        />
      </div>

      <div className="dock__sep" />

      <button
        className={"dock__btn dock__toggle" + (slice.enabled ? " is-active" : "")}
        onClick={() => setSlice({ enabled: !slice.enabled })}
        aria-pressed={slice.enabled}
      >
        Slice
      </button>

      {slice.enabled && (
        <div className="dock__slice">
          <div className="dock__views">
            {AXES.map((a) => (
              <button
                key={a}
                className={"dock__btn" + (slice.axis === a ? " is-active" : "")}
                onClick={() => setSlice({ axis: a })}
              >
                {a.toUpperCase()}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={slice.position}
            onChange={(e) => setSlice({ position: parseFloat(e.target.value) })}
            aria-label="Slice position"
          />
          <button
            className={"dock__btn" + (slice.flip ? " is-active" : "")}
            onClick={() => setSlice({ flip: !slice.flip })}
          >
            Flip
          </button>
        </div>
      )}
    </div>
  );
}
