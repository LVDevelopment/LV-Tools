import { useState } from 'react';
import { fetchNui } from '@/lib/nui';
import { useAppStore } from '@/store';

const OVERLAYS = [
  { key: 'entityIds', label: 'Draw Entity IDs' },
  { key: 'vehicleIds', label: 'Draw Vehicle IDs' },
  { key: 'zoneNames', label: 'Draw Zone Names' },
  { key: 'heading', label: 'Draw Heading' },
  { key: 'collision', label: 'Draw Collision' },
  { key: 'boundingBoxes', label: 'Draw Bounding Boxes' },
];

export function DebugPanel() {
  const addToast = useAppStore((s) => s.addToast);
  const [overlays, setOverlays] = useState<Record<string, boolean>>({});

  const toggle = async (key: string) => {
    const enabled = !overlays[key];
    const res = await fetchNui<{ overlays?: Record<string, boolean> }>('debugAction', {
      action: 'toggle',
      overlay: key,
      enabled,
    });
    if (res.data?.overlays) setOverlays(res.data.overlays);
    addToast(`${key} ${enabled ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Debug Utilities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {OVERLAYS.map((o) => (
          <button
            key={o.key}
            onClick={() => toggle(o.key)}
            className={`lv-btn text-left ${overlays[o.key] ? 'border-lv-accent text-lv-accent' : ''}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
