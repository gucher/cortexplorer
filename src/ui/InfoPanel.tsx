import { STRUCTURES } from "../data/structures";
import { useBrainStore } from "../state/store";

export function InfoPanel() {
  const selectedKey = useBrainStore((s) => s.selectedKey);
  const select = useBrainStore((s) => s.select);
  const hover = useBrainStore((s) => s.hover);
  const isolate = useBrainStore((s) => s.isolate);
  const toggleIsolate = useBrainStore((s) => s.toggleIsolate);

  const info = selectedKey ? STRUCTURES[selectedKey] : null;

  if (!info) {
    return (
      <div className="info info--empty">
        <div className="info__hint">
          <div className="info__hint-mark">◎</div>
          <h2>Select a structure</h2>
          <p>
            Click any part of the brain — or pick from the list — to focus the
            camera and read about it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="info">
      <div className="info__head">
        <span className="info__system" style={{ color: info.color }}>
          <span className="info__dot" style={{ background: info.color }} />
          {info.system}
        </span>
        <h2 className="info__title">{info.name}</h2>
      </div>

      <p className="info__desc">{info.desc}</p>

      <section className="info__section">
        <h3 className="info__label">Functions</h3>
        <ul className="info__functions">
          {info.functions.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      {info.related.length > 0 && (
        <section className="info__section">
          <h3 className="info__label">Connected structures</h3>
          <div className="info__chips">
            {info.related.map((relKey) => {
              const rel = STRUCTURES[relKey];
              if (!rel) return null;
              return (
                <button
                  key={relKey}
                  className="chip"
                  onClick={() => select(relKey)}
                  onMouseEnter={() => hover(relKey)}
                  onMouseLeave={() => hover(null)}
                >
                  <span
                    className="chip__swatch"
                    style={{ background: rel.color }}
                  />
                  {rel.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="info__actions">
        <button
          className={"btn btn--ghost" + (isolate ? " is-active" : "")}
          onClick={toggleIsolate}
        >
          {isolate ? "Show all parts" : "Isolate this"}
        </button>
        <button className="btn btn--ghost" onClick={() => select(null)}>
          Deselect
        </button>
      </div>
    </div>
  );
}
