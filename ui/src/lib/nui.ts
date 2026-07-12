import {
  MOCK_CLIPBOARD,
  MOCK_COORDS,
  MOCK_JOBS,
  MOCK_PERFORMANCE,
  MOCK_RAYCAST,
  MOCK_SETTINGS,
  isEnvBrowser,
  mockDoorlockAction,
  mockMarkerAction,
  mockMeasurementAction,
  mockPropAction,
  mockState,
  mockZoneAction,
} from './mock';
import type { NuiResponse } from '@/types';

type CallbackHandler = (data: unknown) => void;

const messageHandlers = new Map<string, Set<CallbackHandler>>();

/** Listen for NUI messages from Lua */
export function onNuiMessage(action: string, handler: CallbackHandler): () => void {
  if (!messageHandlers.has(action)) {
    messageHandlers.set(action, new Set());
  }
  messageHandlers.get(action)!.add(handler);

  return () => messageHandlers.get(action)?.delete(handler);
}

window.addEventListener('message', (event) => {
  const { action, data } = event.data ?? {};
  if (!action) return;
  messageHandlers.get(action)?.forEach((h) => h(data));
});

/** Mock handlers for browser dev mode */
async function mockFetch<T>(event: string, data?: Record<string, unknown>): Promise<NuiResponse<T>> {
  await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));

  switch (event) {
    case 'close':
      return { success: true };
    case 'setActiveTab':
      return { success: true, data: { tab: data?.tab } as T };
    case 'getDashboard':
    case 'getCoordinates':
      return { success: true, data: MOCK_COORDS as T };
    case 'getRaycast':
      return { success: true, data: MOCK_RAYCAST as T };
    case 'getZones':
      return { success: true, data: mockState.zones as T };
    case 'getClipboard':
      return { success: true, data: { entries: MOCK_CLIPBOARD, favorites: [] } as T };
    case 'getSettings':
      return { success: true, data: MOCK_SETTINGS as T };
    case 'copyFormat':
      return {
        success: true,
        text: `vector3(${MOCK_COORDS.coords.x}, ${MOCK_COORDS.coords.y}, ${MOCK_COORDS.coords.z})`,
      };
    case 'raycastAction':
      if (data?.action === 'copyHit') {
        const c = MOCK_RAYCAST.coords;
        const text =
          data.format === 'vector4'
            ? `vector4(${c.x}, ${c.y}, ${c.z}, 90.00)`
            : `vector3(${c.x}, ${c.y}, ${c.z})`;
        return { success: true, text };
      }
      return { success: true, data: data as T };
    case 'zoneAction':
      return { success: true, data: mockZoneAction(data ?? {}) as T };
    case 'getProps':
      return { success: true, data: { props: mockState.props } as T };
    case 'propAction':
      return { success: true, data: mockPropAction(data ?? {}) as T };
    case 'getMarkers':
      return { success: true, data: { markers: mockState.markers } as T };
    case 'markerAction':
      return { success: true, data: mockMarkerAction(data ?? {}) as T };
    case 'getMeasurements':
      return { success: true, data: mockState.measurement as T };
    case 'measurementAction':
      return { success: true, data: mockMeasurementAction(data ?? {}) as T };
    case 'getPerformance':
      return {
        success: true,
        data: {
          ...MOCK_PERFORMANCE,
          fps: 110 + Math.floor(Math.random() * 15),
          ping: 20 + Math.floor(Math.random() * 10),
        } as T,
      };
    case 'getDoorlocks':
      return { success: true, data: { doors: mockState.doors, jobs: MOCK_JOBS } as T };
    case 'doorlockAction': {
      const result = mockDoorlockAction(data ?? {});
      return { success: true, text: result.text, data: { doors: result.doors } as T };
    }
    case 'clipboardAction':
      if (data?.action === 'delete') {
        return { success: true, data: { entries: MOCK_CLIPBOARD.filter((e) => e.id !== data.id) } as T };
      }
      return { success: true, data: data as T };
    case 'debugAction':
    case 'utilityAction':
    case 'saveData':
    case 'loadData':
    case 'updateSettings':
      return { success: true, data: data as T };
    default:
      return { success: false, error: `Unknown mock event: ${event}` };
  }
}

/** Send NUI callback to Lua (or mock in browser) */
export async function fetchNui<T = unknown>(
  event: string,
  data?: Record<string, unknown>,
): Promise<NuiResponse<T>> {
  if (isEnvBrowser) {
    return mockFetch<T>(event, data);
  }

  const resourceName = (window as unknown as { GetParentResourceName?: () => string }).GetParentResourceName?.()
    ?? 'lv-tools';

  const response = await fetch(`https://${resourceName}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data ?? {}),
  });

  return response.json();
}

/** Copy text to clipboard via NUI */
export function copyToClipboard(text: string): void {
  if (isEnvBrowser) {
    navigator.clipboard.writeText(text).catch(() => {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    return;
  }

  const clipElem = document.createElement('textarea');
  clipElem.value = text;
  document.body.appendChild(clipElem);
  clipElem.select();
  document.execCommand('copy');
  document.body.removeChild(clipElem);
  fetchNui('copied');
}

export { isEnvBrowser };
