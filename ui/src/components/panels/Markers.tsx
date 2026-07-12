import { useEffect, useState } from 'react';
import { MapPinned, Trash2, Copy, Plus } from 'lucide-react';
import { PanelShell } from './PanelShell';
import { useAppStore } from '@/store';
import { fetchNui, copyToClipboard, isEnvBrowser } from '@/lib/nui';
import type { MarkerItem } from '@/types';

const MARKER_TYPES = [
  { value: 1, label: 'Cylinder' },
  { value: 2, label: 'Arrow' },
  { value: 28, label: 'Sphere' },
  { value: 36, label: 'Ring' },
];

export function MarkersPanel() {
  const markers = useAppStore((s) => s.markers);
  const setMarkers = useAppStore((s) => s.setMarkers);
  const addToast = useAppStore((s) => s.addToast);
  const logHistory = useAppStore((s) => s.logHistory);
  const [type, setType] = useState(1);
  const [placement, setPlacement] = useState<'raycast' | 'player'>('raycast');

  const refresh = async () => {
    const res = await fetchNui<{ markers: MarkerItem[] }>('getMarkers');
    if (res.data?.markers) setMarkers(res.data.markers);
  };

  useEffect(() => {
    refresh();
  }, []);

  const run = async (action: string, extra: Record<string, unknown> = {}) => {
    const res = await fetchNui<{ markers?: MarkerItem[] }>('markerAction', { action, ...extra });
    if (!res.success) {
      addToast(res.error ?? 'Action failed', 'error');
      return res;
    }
    if (res.data?.markers) setMarkers(res.data.markers);
    return res;
  };

  const add = async () => {
    await run('add', { type, placement });
    addToast('Marker placed', 'success');
    logHistory('Placed marker', `type ${type}`);
  };

  const copyMarker = async (m: MarkerItem) => {
    const res = await run('copy', { id: m.id });
    if (res.text && isEnvBrowser) copyToClipboard(res.text);
    addToast('Copied marker coords', 'success');
  };

  return (
    <PanelShell
      title="Markers"
      description="Place and manage world markers."
      actions={
        <button onClick={() => run('clear')} className="lv-btn flex items-center gap-1.5">
          <Trash2 size={14} /> Clear
        </button>
      }
    >
      <div className="lv-card space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {MARKER_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`lv-btn text-xs ${type === t.value ? 'border-lv-accent/60 text-lv-accent' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['raycast', 'player'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPlacement(mode)}
              className={`lv-btn flex-1 ${placement === mode ? 'border-lv-accent/60 text-lv-accent' : ''}`}
            >
              {mode === 'raycast' ? 'At crosshair' : 'In front of me'}
            </button>
          ))}
        </div>
        <button onClick={add} className="lv-btn-primary w-full flex items-center justify-center gap-1.5">
          <Plus size={14} /> Add marker
        </button>
      </div>

      <div className="space-y-2">
        {markers.length === 0 && <p className="lv-subtle text-center py-6">No markers placed yet.</p>}
        {markers.map((m) => (
          <div key={m.id} className="lv-card flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm text-gray-100 flex items-center gap-1.5">
                <MapPinned size={14} className="text-lv-accent flex-shrink-0" /> Marker #{m.id}
              </p>
              <p className="lv-subtle font-mono truncate">
                {m.coords.x}, {m.coords.y}, {m.coords.z}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => copyMarker(m)} className="lv-btn px-2" title="Copy coords">
                <Copy size={14} />
              </button>
              <button
                onClick={() => run('delete', { id: m.id })}
                className="lv-btn px-2 hover:text-red-400"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}
