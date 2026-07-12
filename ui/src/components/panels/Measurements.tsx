import { useEffect } from 'react';
import { Plus, Undo2, Trash2, Ruler } from 'lucide-react';
import { PanelShell } from './PanelShell';
import { useAppStore } from '@/store';
import { fetchNui } from '@/lib/nui';
import type { MeasurementData } from '@/types';

export function MeasurementsPanel() {
  const measurement = useAppStore((s) => s.measurement);
  const setMeasurement = useAppStore((s) => s.setMeasurement);
  const addToast = useAppStore((s) => s.addToast);

  const refresh = async () => {
    const res = await fetchNui<MeasurementData>('getMeasurements');
    if (res.data) setMeasurement(res.data);
  };

  useEffect(() => {
    refresh();
  }, []);

  const run = async (action: string) => {
    const res = await fetchNui<MeasurementData>('measurementAction', { action, placement: 'raycast' });
    if (res.data) setMeasurement(res.data);
    if (action === 'addPoint') addToast('Point added', 'info');
  };

  const stats = [
    ['Points', measurement?.count ?? 0],
    ['Segment', `${measurement?.distance ?? 0} m`],
    ['Horizontal', `${measurement?.horizontal ?? 0} m`],
    ['Height', `${measurement?.height ?? 0} m`],
    ['Slope', `${measurement?.slope ?? 0}°`],
    ['Total path', `${measurement?.total ?? 0} m`],
    ['Area', `${measurement?.area ?? 0} m²`],
  ] as const;

  return (
    <PanelShell
      title="Measurements"
      description="Distance, slope, and area at the crosshair."
      actions={
        <>
          <button onClick={() => run('undo')} className="lv-btn flex items-center gap-1.5">
            <Undo2 size={14} /> Undo
          </button>
          <button onClick={() => run('clear')} className="lv-btn flex items-center gap-1.5">
            <Trash2 size={14} /> Clear
          </button>
        </>
      }
    >
      <button onClick={() => run('addPoint')} className="lv-btn-primary w-full flex items-center justify-center gap-1.5">
        <Plus size={14} /> Add point at crosshair
      </button>

      <div className="grid grid-cols-2 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="lv-card">
            <p className="lv-subtle">{label}</p>
            <p className="text-sm font-mono text-gray-100">{value}</p>
          </div>
        ))}
      </div>

      {(!measurement || measurement.count === 0) && (
        <p className="lv-subtle flex items-center justify-center gap-2 py-4">
          <Ruler size={14} /> Add two or more points to measure.
        </p>
      )}
    </PanelShell>
  );
}
