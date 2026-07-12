import { useEffect } from 'react';
import { Window } from '@/components/Window';
import { Sidebar } from '@/components/Sidebar';
import { ToastContainer } from '@/components/Toast';
import { CommandPalette } from '@/components/CommandPalette';
import { DashboardPanel } from '@/components/panels/Dashboard';
import { CoordinatesPanel } from '@/components/panels/Coordinates';
import { RaycastPanel } from '@/components/panels/Raycast';
import { PolyzonesPanel } from '@/components/panels/Polyzones';
import { DoorlocksPanel } from '@/components/panels/Doorlocks';
import { ClipboardPanel } from '@/components/panels/Clipboard';
import { DebugPanel } from '@/components/panels/Debug';
import { UtilitiesPanel } from '@/components/panels/Utilities';
import { SettingsPanel } from '@/components/panels/Settings';
import { PropsPanel } from '@/components/panels/Props';
import { MarkersPanel } from '@/components/panels/Markers';
import { MeasurementsPanel } from '@/components/panels/Measurements';
import { HistoryPanel } from '@/components/panels/History';
import { PerformancePanel } from '@/components/panels/Performance';
import { useAppStore } from '@/store';
import { onNuiMessage, fetchNui, isEnvBrowser, copyToClipboard } from '@/lib/nui';
import { createMockTicker, MOCK_CLIPBOARD, mockState } from '@/lib/mock';

function PanelRouter() {
  const activeTab = useAppStore((s) => s.activeTab);

  switch (activeTab) {
    case 'dashboard': return <DashboardPanel />;
    case 'coordinates': return <CoordinatesPanel />;
    case 'raycast': return <RaycastPanel />;
    case 'polyzones': return <PolyzonesPanel />;
    case 'doorlocks': return <DoorlocksPanel />;
    case 'props': return <PropsPanel />;
    case 'markers': return <MarkersPanel />;
    case 'measurements': return <MeasurementsPanel />;
    case 'clipboard': return <ClipboardPanel />;
    case 'utilities': return <UtilitiesPanel />;
    case 'history': return <HistoryPanel />;
    case 'settings': return <SettingsPanel />;
    case 'debug': return <DebugPanel />;
    case 'performance': return <PerformancePanel />;
    default: return null;
  }
}

export default function App() {
  const {
    visible,
    setVisible,
    setCoordinates,
    setRaycast,
    setZones,
    setClipboard,
    setProps,
    setMarkers,
    setMeasurement,
    setDoorlocks,
    setJobs,
    setDoorAiming,
    addToast,
  } = useAppStore();

  useEffect(() => {
    if (isEnvBrowser) {
      document.body.classList.add('dev-mode');
      setVisible(true);
      setZones(mockState.zones);
      setClipboard(MOCK_CLIPBOARD);
      setProps(mockState.props);
      setMarkers(mockState.markers);
      setMeasurement(mockState.measurement);
      const stop = createMockTicker(setCoordinates, setRaycast);
      return stop;
    }

    const unsubs = [
      onNuiMessage('open', () => setVisible(true)),
      onNuiMessage('close', () => setVisible(false)),
      onNuiMessage('notify', (data) => {
        const d = data as { message: string; type: 'success' | 'error' | 'info' | 'warning' };
        addToast(d.message, d.type);
      }),
      onNuiMessage('copy', (data) => {
        const d = data as { text: string };
        copyToClipboard(d.text);
      }),
      onNuiMessage('dashboardUpdate', (data) => setCoordinates(data as Parameters<typeof setCoordinates>[0])),
      onNuiMessage('coordinatesUpdate', (data) => setCoordinates(data as Parameters<typeof setCoordinates>[0])),
      onNuiMessage('raycastUpdate', (data) => setRaycast(data as Parameters<typeof setRaycast>[0])),
      onNuiMessage('zonesUpdate', (data) => setZones(data as Parameters<typeof setZones>[0])),
      onNuiMessage('clipboardUpdate', (data) => {
        const d = data as { entries: Parameters<typeof setClipboard>[0] };
        setClipboard(d.entries);
      }),
      onNuiMessage('propsUpdate', (data) => {
        const d = data as { props: Parameters<typeof setProps>[0] };
        setProps(d.props);
      }),
      onNuiMessage('markersUpdate', (data) => {
        const d = data as { markers: Parameters<typeof setMarkers>[0] };
        setMarkers(d.markers);
      }),
      onNuiMessage('measurementUpdate', (data) => setMeasurement(data as Parameters<typeof setMeasurement>[0])),
      onNuiMessage('doorlocksUpdate', (data) => {
        const d = data as { doors?: Parameters<typeof setDoorlocks>[0]; jobs?: Parameters<typeof setJobs>[0] };
        if (d.doors) setDoorlocks(d.doors);
        if (d.jobs?.length) setJobs(d.jobs);
      }),
      onNuiMessage('doorlocksAim', (data) => {
        const d = data as { aiming: boolean };
        setDoorAiming(d.aiming);
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, [setVisible, setCoordinates, setRaycast, setZones, setClipboard, setProps, setMarkers, setMeasurement, setDoorlocks, setJobs, setDoorAiming, addToast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        fetchNui('close');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  // While a text field is focused, stop passing keystrokes to the game so typing
  // doesn't move the player or fire keybinds. Otherwise keep game input alive so
  // the player can walk around with the toolkit open.
  useEffect(() => {
    if (isEnvBrowser) return;
    const isEditable = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable;
    };
    const onFocusIn = (e: FocusEvent) => {
      if (isEditable(e.target)) fetchNui('setKeepInput', { keep: false });
    };
    const onFocusOut = (e: FocusEvent) => {
      if (isEditable(e.target)) fetchNui('setKeepInput', { keep: true });
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  if (!visible && !isEnvBrowser) return <ToastContainer />;

  return (
    <>
      {visible && (
        <Window>
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-hidden">
            <PanelRouter />
          </main>
        </Window>
      )}
      <ToastContainer />
      <CommandPalette />
    </>
  );
}
