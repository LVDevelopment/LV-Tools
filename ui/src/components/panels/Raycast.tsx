import { useEffect, useState } from 'react';
import { Crosshair, Snowflake, MapPin, Copy, Power, Box, User, Car, CircleSlash } from 'lucide-react';
import { PanelShell } from './PanelShell';
import { useAppStore } from '@/store';
import { fetchNui, copyToClipboard, isEnvBrowser } from '@/lib/nui';
import type { RaycastData } from '@/types';

const TYPE_ICON: Record<string, React.ReactNode> = {
  ped: <User size={18} />,
  vehicle: <Car size={18} />,
  object: <Box size={18} />,
  none: <CircleSlash size={18} />,
};

export function RaycastPanel() {
  const data = useAppStore((s) => s.raycast);
  const setRaycast = useAppStore((s) => s.setRaycast);
  const addToast = useAppStore((s) => s.addToast);
  const logHistory = useAppStore((s) => s.logHistory);
  const [enabled, setEnabled] = useState(false);
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetchNui<RaycastData>('getRaycast');
      if (res.data) {
        setRaycast(res.data);
        if (typeof res.data.enabled === 'boolean') setEnabled(res.data.enabled);
      }
    })();
  }, [setRaycast]);

  const toggleEnable = async () => {
    const next = !enabled;
    setEnabled(next);
    await fetchNui('raycastAction', { action: 'enable', enabled: next });
    addToast(next ? 'Raycast enabled' : 'Raycast disabled', next ? 'success' : 'info');
  };

  const toggleFreeze = async () => {
    const next = !frozen;
    setFrozen(next);
    await fetchNui('raycastAction', { action: 'freeze', frozen: next });
  };

  const copyHit = async (format: 'vector3' | 'vector4') => {
    const res = await fetchNui<{ text?: string }>('raycastAction', { action: 'copyHit', format });
    if (res.success && res.text) {
      if (isEnvBrowser) copyToClipboard(res.text);
      addToast(`Copied ${res.text}`, 'success');
      logHistory(`Raycast ${format}`, res.text);
    } else {
      addToast('Nothing in sight', 'warning');
    }
  };

  const spawnMarker = () => fetchNui('raycastAction', { action: 'spawnMarker' });

  const hit = data?.hit ?? false;
  const type = data?.entityType ?? 'none';

  return (
    <PanelShell
      title="Raycast"
      description="See what you're pointing at."
      actions={
        <button
          onClick={toggleEnable}
          className={`lv-btn flex items-center gap-1.5 ${enabled ? 'border-lv-accent/60 text-lv-accent bg-lv-accent/10' : ''}`}
        >
          <Power size={14} /> {enabled ? 'On' : 'Enable'}
        </button>
      }
    >
      {/* Keybind hint */}
      <div className="flex items-center gap-2 text-xs text-gray-300 px-1">
        <Crosshair size={14} className={enabled ? 'text-lv-accent' : 'text-lv-muted'} />
        <span className="text-lv-muted">Copy at crosshair:</span>
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">E</kbd> Vector3
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">Q</kbd> Vector4
      </div>

      {/* Looking-at hero */}
      <div className="lv-card">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${hit ? 'bg-lv-accent/15 text-lv-accent' : 'bg-white/[0.04] text-lv-muted'}`}>
            {TYPE_ICON[type] ?? TYPE_ICON.none}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-100 truncate">
              {hit ? data?.modelName : 'Nothing in sight'}
            </p>
            <p className="lv-subtle capitalize">
              {hit ? `${type} · ${data?.distance ?? 0} m away` : 'Point your crosshair at something'}
            </p>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${hit ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]' : 'bg-white/20'}`}
          />
        </div>
      </div>

      {/* Coordinates + copy */}
      <div className="lv-card space-y-2.5">
        <p className="lv-subtle">Coordinates</p>
        <p className="text-sm font-mono text-gray-100 break-all">
          {data ? `${data.coords.x}, ${data.coords.y}, ${data.coords.z}` : '—'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => copyHit('vector3')} className="lv-btn-primary flex items-center justify-center gap-1.5">
            <Copy size={14} /> Vector3
          </button>
          <button onClick={() => copyHit('vector4')} className="lv-btn-primary flex items-center justify-center gap-1.5">
            <Copy size={14} /> Vector4
          </button>
        </div>
      </div>

      {/* Details */}
      {data && (
        <div className="lv-card divide-y divide-white/[0.06] py-0">
          {(
            [
              ['Distance', `${data.distance} m`],
              ['Entity', data.entity || '—'],
              ['Model hash', data.model || '—'],
              ['Surface normal', `${data.normal.x}, ${data.normal.y}, ${data.normal.z}`],
              ...(data.plate ? ([['Plate', data.plate]] as [string, string][]) : []),
            ] as [string, string | number][]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 py-2">
              <span className="lv-subtle">{label}</span>
              <span className="text-xs font-mono text-gray-200 truncate">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={toggleFreeze} className={`lv-btn flex items-center justify-center gap-1.5 ${frozen ? 'border-lv-accent/60 text-lv-accent' : ''}`}>
          <Snowflake size={14} /> {frozen ? 'Frozen' : 'Freeze'}
        </button>
        <button onClick={spawnMarker} className="lv-btn flex items-center justify-center gap-1.5">
          <MapPin size={14} /> Marker
        </button>
      </div>
    </PanelShell>
  );
}
