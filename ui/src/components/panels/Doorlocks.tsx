import { useEffect, useState } from 'react';
import { Check, Crosshair, Trash2, Copy, Download, DoorClosed, MapPin, Plus, RefreshCw } from 'lucide-react';
import { PanelShell } from './PanelShell';
import { useAppStore } from '@/store';
import { fetchNui, copyToClipboard, isEnvBrowser } from '@/lib/nui';
import type { DoorFormat, DoorLock } from '@/types';

const FORMATS: { id: DoorFormat; label: string; resource: string }[] = [
  { id: 'qb', label: 'QBCore', resource: 'qb-doorlocks' },
  { id: 'esx', label: 'ESX', resource: 'esx_doorlock' },
  { id: 'qbox', label: 'Qbox', resource: 'ox_doorlock' },
];

export function DoorlocksPanel() {
  const doorlocks = useAppStore((s) => s.doorlocks);
  const setDoorlocks = useAppStore((s) => s.setDoorlocks);
  const jobs = useAppStore((s) => s.jobs);
  const setJobs = useAppStore((s) => s.setJobs);
  const doorAiming = useAppStore((s) => s.doorAiming);
  const setDoorAiming = useAppStore((s) => s.setDoorAiming);
  const addToast = useAppStore((s) => s.addToast);
  const logHistory = useAppStore((s) => s.logHistory);
  const [customJob, setCustomJob] = useState('');
  const [format, setFormat] = useState<DoorFormat>('qb');

  const refresh = async () => {
    const res = await fetchNui<{ doors: DoorLock[]; jobs: typeof jobs }>('getDoorlocks');
    if (res.data?.doors) setDoorlocks(res.data.doors);
    if (res.data?.jobs?.length) setJobs(res.data.jobs);
  };

  useEffect(() => {
    refresh();
  }, []);

  const run = async (action: string, extra: Record<string, unknown> = {}) => {
    const res = await fetchNui<{ doors?: DoorLock[] }>('doorlockAction', { action, ...extra });
    if (!res.success && res.error) addToast(res.error, 'error');
    if (res.data?.doors) setDoorlocks(res.data.doors);
    return res;
  };

  const toggleAim = async () => {
    const next = !doorAiming;
    setDoorAiming(next);
    await fetchNui('doorlockAction', { action: 'aim', enabled: next });
    if (isEnvBrowser && next) {
      // In browser dev there's no game camera — simulate a capture instead.
      setTimeout(() => run('capture'), 400);
    }
  };

  const patch = (id: number, p: Partial<DoorLock>) => run('update', { id, patch: p });

  const toggleJob = (door: DoorLock, job: string) => {
    const has = door.authorizedJobs.includes(job);
    const next = has ? door.authorizedJobs.filter((j) => j !== job) : [...door.authorizedJobs, job];
    patch(door.id, { authorizedJobs: next });
  };

  const addCustomJob = (door: DoorLock) => {
    const j = customJob.trim();
    if (!j) return;
    if (!door.authorizedJobs.includes(j)) patch(door.id, { authorizedJobs: [...door.authorizedJobs, j] });
    setCustomJob('');
  };

  const copyDoor = async (id: number) => {
    const res = await run('copy', { id, format });
    if (res.text) {
      if (isEnvBrowser) copyToClipboard(res.text);
      addToast(`Copied for ${format.toUpperCase()}`, 'success');
      logHistory('Copied door lock', `#${id} (${format})`);
    }
  };

  const exportAll = async () => {
    const res = await run('exportAll', { format });
    if (res.text) {
      if (isEnvBrowser) copyToClipboard(res.text);
      addToast(`Exported ${doorlocks.length} door(s) for ${format.toUpperCase()}`, 'success');
    }
  };

  return (
    <PanelShell
      title="Universal Door Lock Maker"
      description="Aim at doors and export for QBCore, ESX, or Qbox."
      actions={
        <>
          <button onClick={() => run('refreshJobs').then(refresh)} className="lv-btn px-2" title="Refresh jobs">
            <RefreshCw size={14} />
          </button>
          <button onClick={exportAll} className="lv-btn flex items-center gap-1.5">
            <Download size={14} /> Export all
          </button>
          <button onClick={() => run('clear')} className="lv-btn flex items-center gap-1.5">
            <Trash2 size={14} /> Clear
          </button>
        </>
      }
    >
      {/* Export format selector */}
      <div className="lv-card">
        <p className="lv-subtle mb-2">Export format</p>
        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map((f) => {
            const active = format === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2 transition-colors ${
                  active
                    ? 'border-lv-accent/60 bg-lv-accent/10 text-lv-accent'
                    : 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-1 text-sm font-medium">
                  {active && <Check size={13} />}
                  {f.label}
                </span>
                <span className="lv-subtle text-[10px]">{f.resource}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aim control */}
      <div className={`lv-card flex items-center justify-between gap-3 ${doorAiming ? 'ring-1 ring-lv-accent/50' : ''}`}>
        <div className="min-w-0">
          <p className="text-sm text-gray-100 flex items-center gap-2">
            <Crosshair size={15} className={doorAiming ? 'text-lv-accent' : 'text-lv-muted'} />
            {doorAiming ? 'Aim mode active' : 'Aim mode'}
          </p>
          <p className="lv-subtle mt-0.5">
            {doorAiming
              ? 'Look at a door · [E] capture · [Backspace] exit'
              : 'Releases the cursor so you can look around and capture doors.'}
          </p>
        </div>
        <button onClick={toggleAim} className={`lv-btn flex-shrink-0 ${doorAiming ? 'border-lv-accent/60 text-lv-accent bg-lv-accent/10' : ''}`}>
          {doorAiming ? 'Stop' : 'Start aiming'}
        </button>
      </div>

      <button onClick={() => run('capture')} className="lv-btn-primary w-full flex items-center justify-center gap-1.5">
        <Plus size={14} /> Capture door at crosshair
      </button>

      {/* Door list */}
      {doorlocks.length === 0 && (
        <p className="lv-subtle flex items-center justify-center gap-2 py-6">
          <DoorClosed size={14} /> No doors captured yet.
        </p>
      )}

      {doorlocks.map((door) => (
        <div key={door.id} className="lv-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-100 flex items-center gap-2">
              <DoorClosed size={15} className="text-lv-accent" /> Door #{door.id}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => copyDoor(door.id)} className="lv-btn px-2" title="Copy this entry">
                <Copy size={14} />
              </button>
              <button onClick={() => run('delete', { id: door.id })} className="lv-btn px-2 hover:text-red-400" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="lv-subtle">objName</span>
              <input
                value={door.objName}
                onChange={(e) => patch(door.id, { objName: e.target.value })}
                placeholder={`hash ${door.objHash}`}
                className="lv-input mt-1"
              />
            </label>
            <label className="block">
              <span className="lv-subtle">objYaw</span>
              <input
                type="number"
                step="0.1"
                value={door.objYaw}
                onChange={(e) => patch(door.id, { objYaw: Number(e.target.value) })}
                className="lv-input mt-1"
              />
            </label>
          </div>

          <div className="text-xs font-mono text-gray-300">
            <p className="lv-subtle mb-0.5">objCoords</p>
            vec3({door.objCoords.x}, {door.objCoords.y}, {door.objCoords.z})
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-mono text-gray-300 min-w-0">
              <p className="lv-subtle mb-0.5">textCoords</p>
              <span className="truncate">
                vec3({door.textCoords.x}, {door.textCoords.y}, {door.textCoords.z})
              </span>
            </div>
            <button onClick={() => run('textHere', { id: door.id })} className="lv-btn flex-shrink-0 flex items-center gap-1.5">
              <MapPin size={13} /> Set here
            </button>
          </div>

          {/* Jobs */}
          <div>
            <p className="lv-subtle mb-1.5">authorizedJobs</p>
            <div className="flex flex-wrap gap-1.5">
              {jobs.map((job) => {
                const active = door.authorizedJobs.includes(job.name);
                return (
                  <button
                    key={job.name}
                    onClick={() => toggleJob(door, job.name)}
                    className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                      active
                        ? 'bg-lv-accent/20 border-lv-accent/50 text-lv-accent'
                        : 'bg-white/[0.03] border-white/10 text-gray-300 hover:border-white/20'
                    }`}
                    title={job.name}
                  >
                    {job.label}
                  </button>
                );
              })}
            </div>
            {/* Jobs already selected but not in list (custom) */}
            {door.authorizedJobs.filter((j) => !jobs.some((x) => x.name === j)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {door.authorizedJobs
                  .filter((j) => !jobs.some((x) => x.name === j))
                  .map((j) => (
                    <button
                      key={j}
                      onClick={() => toggleJob(door, j)}
                      className="px-2 py-1 rounded-md text-xs border bg-lv-accent/20 border-lv-accent/50 text-lv-accent"
                    >
                      {j} ✕
                    </button>
                  ))}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <input
                value={customJob}
                onChange={(e) => setCustomJob(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomJob(door)}
                placeholder="custom job name"
                className="lv-input flex-1"
              />
              <button onClick={() => addCustomJob(door)} className="lv-btn">Add</button>
            </div>
          </div>

          {/* Toggles + distance */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => patch(door.id, { locked: !door.locked })}
              className={`lv-btn ${door.locked ? 'border-lv-accent/60 text-lv-accent' : ''}`}
            >
              locked: {String(door.locked)}
            </button>
            <button
              onClick={() => patch(door.id, { pickable: !door.pickable })}
              className={`lv-btn ${door.pickable ? 'border-lv-accent/60 text-lv-accent' : ''}`}
            >
              pickable: {String(door.pickable)}
            </button>
          </div>
          <label className="block">
            <span className="lv-subtle">distance</span>
            <input
              type="number"
              step="0.1"
              value={door.distance}
              onChange={(e) => patch(door.id, { distance: Number(e.target.value) })}
              className="lv-input mt-1"
            />
          </label>
        </div>
      ))}
    </PanelShell>
  );
}
