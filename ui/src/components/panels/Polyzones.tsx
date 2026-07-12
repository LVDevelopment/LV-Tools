import { useState } from 'react';
import { Plus, Trash2, Code, Download } from 'lucide-react';
import { useAppStore } from '@/store';
import { fetchNui, copyToClipboard } from '@/lib/nui';
import { Select } from '@/components/Select';

const ZONE_TYPE_OPTIONS = [
  { value: 'box', label: 'Box' },
  { value: 'circle', label: 'Circle' },
  { value: 'poly', label: 'Poly' },
  { value: 'combo', label: 'Combo' },
  { value: 'entity', label: 'Entity' },
  { value: 'dynamic', label: 'Dynamic' },
];

export function PolyzonesPanel() {
  const zones = useAppStore((s) => s.zones);
  const addToast = useAppStore((s) => s.addToast);
  const setZones = useAppStore((s) => s.setZones);
  const [name, setName] = useState('New Zone');
  const [zoneType, setZoneType] = useState('box');
  const [editing, setEditing] = useState(false);

  const createZone = async () => {
    const res = await fetchNui('zoneAction', { action: 'create', name, zoneType });
    if (res.success) {
      setEditing(true);
      addToast(`Creating ${zoneType} zone: ${name}`, 'success');
    }
  };

  const saveZone = async () => {
    const res = await fetchNui<{ zones: typeof zones }>('zoneAction', { action: 'save' });
    if (res.data?.zones) setZones(res.data.zones);
    setEditing(false);
    addToast('Zone saved', 'success');
  };

  const deleteZone = async (id: string) => {
    const res = await fetchNui<{ zones: typeof zones }>('zoneAction', { action: 'delete', id });
    if (res.data?.zones) setZones(res.data.zones);
    addToast('Zone deleted', 'info');
  };

  const clearZones = async () => {
    const res = await fetchNui<{ zones: typeof zones }>('zoneAction', { action: 'clear' });
    if (res.data?.zones) setZones(res.data.zones);
    addToast('Cleared all zones', 'info');
  };

  const exportLua = async (id: string) => {
    const res = await fetchNui<{ lua?: string }>('zoneAction', { action: 'generateLua', id });
    if (res.data?.lua) {
      copyToClipboard(res.data.lua);
      addToast('Lua copied to clipboard', 'success');
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">PolyZone Creator</h2>

      <div className="lv-card mb-6 space-y-3">
        <div className="flex gap-3">
          <input
            className="lv-input flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Zone name"
          />
          <Select
            className="w-36 flex-shrink-0"
            value={zoneType}
            options={ZONE_TYPE_OPTIONS}
            onChange={setZoneType}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={createZone} className="lv-btn-primary flex items-center gap-2">
            <Plus size={14} /> Create
          </button>
          {editing && (
            <button onClick={saveZone} className="lv-btn flex items-center gap-2">
              <Download size={14} /> Save Zone
            </button>
          )}
        </div>
        {editing && (
          <p className="text-xs text-lv-muted">
            Aim and use in-world controls. Add points for poly zones via NUI actions.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-lv-muted">Saved Zones ({zones.length})</h3>
        {zones.length > 0 && (
          <button onClick={clearZones} className="lv-btn text-xs flex items-center gap-1.5 hover:text-red-400">
            <Trash2 size={13} /> Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {zones.map((zone) => (
          <div key={zone.id} className="lv-card flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{zone.name}</p>
              <p className="text-xs text-lv-muted capitalize">{zone.type}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => exportLua(zone.id)} className="lv-btn p-2" title="Copy Lua">
                <Code size={14} />
              </button>
              <button
                onClick={() => deleteZone(zone.id)}
                className="lv-btn p-2 hover:text-red-400"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {zones.length === 0 && <p className="text-sm text-lv-muted">No zones saved yet</p>}
      </div>
    </div>
  );
}
