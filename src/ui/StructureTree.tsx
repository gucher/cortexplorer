import { useMemo } from "react";
import {
  STRUCTURES,
  SYSTEM_ORDER,
  type StructureInfo,
} from "../data/structures";
import { useBrainStore } from "../state/store";

export function StructureTree() {
  const search = useBrainStore((s) => s.search);
  const setSearch = useBrainStore((s) => s.setSearch);
  const selectedKey = useBrainStore((s) => s.selectedKey);
  const hoveredKey = useBrainStore((s) => s.hoveredKey);
  const visibility = useBrainStore((s) => s.visibility);
  const select = useBrainStore((s) => s.select);
  const hover = useBrainStore((s) => s.hover);
  const toggleVisibility = useBrainStore((s) => s.toggleVisibility);

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const map = new Map<string, StructureInfo[]>();
    for (const info of Object.values(STRUCTURES)) {
      if (q && !`${info.name} ${info.system}`.toLowerCase().includes(q)) continue;
      const list = map.get(info.system) ?? [];
      list.push(info);
      map.set(info.system, list);
    }
    return SYSTEM_ORDER.filter((s) => map.has(s)).map(
      (s) => [s, map.get(s)!] as const,
    );
  }, [search]);

  const total = Object.keys(STRUCTURES).length;

  return (
    <div className="tree">
      <div className="tree__search">
        <svg className="tree__search-icon" viewBox="0 0 16 16" aria-hidden>
          <path
            d="M7 1a6 6 0 104.47 10.03l3.25 3.25 1.06-1.06-3.25-3.25A6 6 0 007 1zM3 7a4 4 0 118 0 4 4 0 01-8 0z"
            fill="currentColor"
          />
        </svg>
        <input
          className="tree__input"
          placeholder={`Search ${total} structures…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search structures"
        />
        {search && (
          <button
            className="tree__clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="tree__scroll">
        {groups.length === 0 && (
          <p className="tree__empty">No structures match “{search}”.</p>
        )}
        {groups.map(([system, items]) => (
          <div className="tree__group" key={system}>
            <div className="tree__group-label">{system}</div>
            {items.map((info) => {
              const isSel = selectedKey === info.key;
              const isHov = hoveredKey === info.key;
              const isVisible = visibility[info.key] !== false;
              return (
                <div
                  key={info.key}
                  className={
                    "tree__row" +
                    (isSel ? " is-selected" : "") +
                    (isHov ? " is-hovered" : "") +
                    (isVisible ? "" : " is-hidden")
                  }
                  onMouseEnter={() => hover(info.key)}
                  onMouseLeave={() => hover(null)}
                >
                  <button
                    className="tree__row-main"
                    onClick={() => select(info.key)}
                  >
                    <span
                      className="tree__swatch"
                      style={{ background: info.color }}
                    />
                    <span className="tree__name">{info.name}</span>
                  </button>
                  <button
                    className="tree__eye"
                    onClick={() => toggleVisibility(info.key)}
                    aria-label={isVisible ? "Hide structure" : "Show structure"}
                    title={isVisible ? "Hide" : "Show"}
                  >
                    {isVisible ? (
                      <svg viewBox="0 0 16 16" aria-hidden>
                        <path
                          d="M8 3C4.5 3 1.7 5.1.5 8c1.2 2.9 4 5 7.5 5s6.3-2.1 7.5-5C14.3 5.1 11.5 3 8 3zm0 8a3 3 0 110-6 3 3 0 010 6zm0-4.5A1.5 1.5 0 108 9.5 1.5 1.5 0 008 6.5z"
                          fill="currentColor"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" aria-hidden>
                        <path
                          d="M2.1 2.1l11.8 11.8-1 1-2.2-2.2c-.8.2-1.7.3-2.7.3-3.5 0-6.3-2.1-7.5-5 .6-1.4 1.6-2.6 2.8-3.5L1.1 3.1l1-1zM8 5a3 3 0 012.9 3.8L8.2 5.1A3 3 0 018 5z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
