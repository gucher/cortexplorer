import { create } from "zustand";
import { STRUCTURE_KEYS, isNerveKey } from "../data/structures";

export type Axis = "x" | "y" | "z";
export type ViewPreset =
  | "reset"
  | "top"
  | "bottom"
  | "front"
  | "back"
  | "left"
  | "right";

/**
 * A camera-move request. The CameraRig watches `nonce`; bumping it re-triggers a
 * move even when the destination is unchanged (e.g. pressing "Reset" twice).
 */
export interface FocusRequest {
  kind: "structure" | "view";
  key?: string;
  view?: ViewPreset;
  nonce: number;
}

export interface SliceState {
  enabled: boolean;
  axis: Axis;
  /** Normalized [-1, 1] position of the clip plane along the axis. */
  position: number;
  flip: boolean;
}

interface BrainState {
  selectedKey: string | null;
  hoveredKey: string | null;
  /** When true, non-selected structures fade translucent. */
  isolate: boolean;
  /** 0 = assembled, 1 = fully exploded. */
  explode: number;
  visibility: Record<string, boolean>;
  slice: SliceState;
  focus: FocusRequest;
  search: string;
  /** Realistic uniform tissue look vs. anatomical colour-coding. */
  realistic: boolean;
  /** Show floating leader-line labels for structures. */
  showLabels: boolean;
  /** Show the cranial-nerve overlay layer (lazy-loads nerves.glb). */
  showNerves: boolean;
  /** Mobile: whether the structure-browser bottom sheet is open. */
  mobileTreeOpen: boolean;

  select: (key: string | null) => void;
  hover: (key: string | null) => void;
  setIsolate: (v: boolean) => void;
  toggleIsolate: () => void;
  setExplode: (v: number) => void;
  setVisibility: (key: string, v: boolean) => void;
  toggleVisibility: (key: string) => void;
  showAll: () => void;
  setSlice: (patch: Partial<SliceState>) => void;
  setView: (view: ViewPreset) => void;
  refocus: () => void;
  setSearch: (s: string) => void;
  toggleRealistic: () => void;
  toggleLabels: () => void;
  toggleNerves: () => void;
  toggleMobileTree: () => void;
  reset: () => void;
}

const allVisible = (): Record<string, boolean> =>
  Object.fromEntries(STRUCTURE_KEYS.map((k) => [k, true]));

export const useBrainStore = create<BrainState>()((set, get) => ({
  selectedKey: null,
  hoveredKey: null,
  isolate: false,
  explode: 0,
  visibility: allVisible(),
  slice: { enabled: false, axis: "x", position: 0, flip: false },
  focus: { kind: "view", view: "reset", nonce: 0 },
  search: "",
  realistic: false,
  showLabels: false,
  showNerves: false,
  mobileTreeOpen: false,

  select: (key) =>
    set((s) => ({
      selectedKey: key,
      // Picking a structure closes the mobile browser so the info sheet shows.
      mobileTreeOpen: false,
      // Selecting a cranial nerve auto-enables its (lazy-loaded) layer.
      showNerves: s.showNerves || isNerveKey(key),
      focus:
        key === null
          ? s.focus
          : { kind: "structure", key, nonce: s.focus.nonce + 1 },
    })),

  hover: (key) => set({ hoveredKey: key }),

  setIsolate: (v) => set({ isolate: v }),
  toggleIsolate: () => set((s) => ({ isolate: !s.isolate })),

  setExplode: (v) => set({ explode: Math.max(0, Math.min(1, v)) }),

  setVisibility: (key, v) =>
    set((s) => ({ visibility: { ...s.visibility, [key]: v } })),
  toggleVisibility: (key) =>
    set((s) => ({ visibility: { ...s.visibility, [key]: !s.visibility[key] } })),
  showAll: () => set({ visibility: allVisible() }),

  setSlice: (patch) => set((s) => ({ slice: { ...s.slice, ...patch } })),

  setView: (view) =>
    set((s) => ({ focus: { kind: "view", view, nonce: s.focus.nonce + 1 } })),

  refocus: () => {
    const { selectedKey } = get();
    set((s) => ({
      focus: selectedKey
        ? { kind: "structure", key: selectedKey, nonce: s.focus.nonce + 1 }
        : { kind: "view", view: "reset", nonce: s.focus.nonce + 1 },
    }));
  },

  setSearch: (s) => set({ search: s }),

  toggleRealistic: () => set((s) => ({ realistic: !s.realistic })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleNerves: () => set((s) => ({ showNerves: !s.showNerves })),
  toggleMobileTree: () => set((s) => ({ mobileTreeOpen: !s.mobileTreeOpen })),

  reset: () =>
    set((s) => ({
      selectedKey: null,
      hoveredKey: null,
      isolate: false,
      explode: 0,
      visibility: allVisible(),
      slice: { enabled: false, axis: "x", position: 0, flip: false },
      search: "",
      focus: { kind: "view", view: "reset", nonce: s.focus.nonce + 1 },
    })),
}));
