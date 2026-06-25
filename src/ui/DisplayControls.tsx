import { useBrainStore } from "../state/store";

export function DisplayControls() {
  const realistic = useBrainStore((s) => s.realistic);
  const toggleRealistic = useBrainStore((s) => s.toggleRealistic);
  const showLabels = useBrainStore((s) => s.showLabels);
  const toggleLabels = useBrainStore((s) => s.toggleLabels);
  const showNerves = useBrainStore((s) => s.showNerves);
  const toggleNerves = useBrainStore((s) => s.toggleNerves);

  const snapshot = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `cortexplorer-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="display">
      <div className="display__seg" role="group" aria-label="Appearance">
        <button
          className={!realistic ? "is-active" : ""}
          onClick={() => realistic && toggleRealistic()}
        >
          Anatomical
        </button>
        <button
          className={realistic ? "is-active" : ""}
          onClick={() => !realistic && toggleRealistic()}
        >
          Realistic
        </button>
      </div>

      <div className="display__sep" />

      <button
        className={"display__btn" + (showLabels ? " is-active" : "")}
        onClick={toggleLabels}
        aria-pressed={showLabels}
      >
        <svg viewBox="0 0 16 16" aria-hidden width="14" height="14">
          <path
            d="M2 4.5A1.5 1.5 0 013.5 3h5.4a1.5 1.5 0 011.06.44l3.6 3.6a1.5 1.5 0 010 2.12l-3.9 3.9a1.5 1.5 0 01-2.12 0l-3.6-3.6A1.5 1.5 0 012 8.4V4.5zm3 .5a1 1 0 100 2 1 1 0 000-2z"
            fill="currentColor"
          />
        </svg>
        Labels
      </button>

      <button
        className={"display__btn" + (showNerves ? " is-active" : "")}
        onClick={toggleNerves}
        aria-pressed={showNerves}
        title="Cranial nerves (I–XII)"
      >
        <svg viewBox="0 0 16 16" aria-hidden width="14" height="14">
          <path
            d="M8 1.5c0 2-2 2.5-2 4.5s2 2.5 2 4.5-2 2.5-2 4M8 1.5c0 2 2 2.5 2 4.5s-2 2.5-2 4.5 2 2.5 2 4"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        Nerves
      </button>

      <button className="display__btn" onClick={snapshot} title="Download PNG">
        <svg viewBox="0 0 16 16" aria-hidden width="14" height="14">
          <path
            d="M5.5 3l-.9 1.2H2.5A1.5 1.5 0 001 5.7v6.8A1.5 1.5 0 002.5 14h11a1.5 1.5 0 001.5-1.5V5.7a1.5 1.5 0 00-1.5-1.5h-2.1L10.5 3h-5zM8 6.2a3 3 0 110 6 3 3 0 010-6zm0 1.6a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z"
            fill="currentColor"
          />
        </svg>
        Snapshot
      </button>
    </div>
  );
}
