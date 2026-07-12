import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ClipboardEntry,
  CoordinatesData,
  DoorLock,
  HistoryEntry,
  Job,
  MarkerItem,
  MeasurementData,
  PropItem,
  RaycastData,
  TabId,
  Toast,
  UISettings,
  WindowState,
  ZoneData,
} from '@/types';
import { MOCK_SETTINGS } from '@/lib/mock';

interface AppState {
  visible: boolean;
  activeTab: TabId;
  window: WindowState;
  collapsedPanels: Record<string, boolean>;
  settings: UISettings;
  coordinates: CoordinatesData | null;
  raycast: RaycastData | null;
  zones: ZoneData[];
  clipboard: ClipboardEntry[];
  props: PropItem[];
  markers: MarkerItem[];
  measurement: MeasurementData | null;
  doorlocks: DoorLock[];
  jobs: Job[];
  doorAiming: boolean;
  history: HistoryEntry[];
  toasts: Toast[];
  commandPaletteOpen: boolean;

  setVisible: (v: boolean) => void;
  setActiveTab: (tab: TabId) => void;
  setWindow: (w: Partial<WindowState>) => void;
  togglePanel: (id: string) => void;
  setSettings: (s: Partial<UISettings>) => void;
  setCoordinates: (d: CoordinatesData) => void;
  setRaycast: (d: RaycastData) => void;
  setZones: (z: ZoneData[]) => void;
  setClipboard: (entries: ClipboardEntry[]) => void;
  setProps: (p: PropItem[]) => void;
  setMarkers: (m: MarkerItem[]) => void;
  setMeasurement: (d: MeasurementData) => void;
  setDoorlocks: (d: DoorLock[]) => void;
  setJobs: (j: Job[]) => void;
  setDoorAiming: (a: boolean) => void;
  logHistory: (action: string, detail: string) => void;
  clearHistory: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      visible: false,
      activeTab: 'dashboard',
      // Panel docked to the right edge — wider and tall (clamped to viewport in Window).
      window: { x: 80, y: 60, width: 640, height: 1000, docked: 'right' },
      collapsedPanels: {},
      settings: MOCK_SETTINGS,
      coordinates: null,
      raycast: null,
      zones: [],
      clipboard: [],
      props: [],
      markers: [],
      measurement: null,
      doorlocks: [],
      jobs: [],
      doorAiming: false,
      history: [],
      toasts: [],
      commandPaletteOpen: false,

      setVisible: (v) => set({ visible: v }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setWindow: (w) => set({ window: { ...get().window, ...w } }),
      togglePanel: (id) =>
        set({ collapsedPanels: { ...get().collapsedPanels, [id]: !get().collapsedPanels[id] } }),
      setSettings: (s) => set({ settings: { ...get().settings, ...s } }),
      setCoordinates: (d) => set({ coordinates: d }),
      setRaycast: (d) => set({ raycast: d }),
      setZones: (z) => set({ zones: z }),
      setClipboard: (entries) => set({ clipboard: entries }),
      setProps: (p) => set({ props: p }),
      setMarkers: (m) => set({ markers: m }),
      setMeasurement: (d) => set({ measurement: d }),
      setDoorlocks: (d) => set({ doorlocks: d }),
      setJobs: (j) => set({ jobs: j }),
      setDoorAiming: (a) => set({ doorAiming: a }),
      logHistory: (action, detail) => {
        const entry: HistoryEntry = {
          id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          action,
          detail,
          timestamp: Date.now(),
        };
        set({ history: [entry, ...get().history].slice(0, 200) });
      },
      clearHistory: () => set({ history: [] }),
      addToast: (message, type) => {
        // Respect the "show notifications" setting, but never hide errors.
        if (get().settings.showNotifications === false && type !== 'error') return;
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        set({ toasts: [...get().toasts, { id, message, type }] });
        setTimeout(() => get().removeToast(id), 4000);
      },
      removeToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      // Bumped to reset persisted settings so the new options get their defaults.
      name: 'lv-tools-state-v7',
      partialize: (s) => ({
        activeTab: s.activeTab,
        window: s.window,
        collapsedPanels: s.collapsedPanels,
        settings: s.settings,
      }),
    },
  ),
);
