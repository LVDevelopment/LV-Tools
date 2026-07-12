import { CopyButton } from '@/components/CopyButton';
import { useAppStore } from '@/store';

const COPY_FORMATS = [
  { label: 'Copy Vector2', format: 'vector2' },
  { label: 'Copy Vector3', format: 'vector3' },
  { label: 'Copy Vector4', format: 'vector4' },
  { label: 'Copy Heading', format: 'heading' },
  { label: 'Copy JSON', format: 'json' },
  { label: 'Copy Lua', format: 'lua' },
  { label: 'Copy QB Target', format: 'qb-target' },
  { label: 'Copy Ox Target', format: 'ox-target' },
  { label: 'Copy PolyZone Point', format: 'polyzone' },
  { label: 'Copy CircleZone', format: 'circlezone' },
  { label: 'Copy BoxZone', format: 'boxzone' },
  { label: 'Copy Spawn Location', format: 'spawn' },
  { label: 'Copy Teleport Command', format: 'teleport' },
];

export function CoordinatesPanel() {
  const data = useAppStore((s) => s.coordinates);

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Coordinates</h2>

      {data && (
        <div className="lv-card mb-6 font-mono text-sm space-y-1">
          <p className="text-lv-accent">vector3({data.coords.x}, {data.coords.y}, {data.coords.z})</p>
          <p className="text-lv-muted">Heading: {data.heading}°</p>
          <p className="text-lv-muted">{data.street}</p>
          <p className="text-lv-muted">{data.zone}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {COPY_FORMATS.map((f) => (
          <CopyButton key={f.format} label={f.label} format={f.format} />
        ))}
      </div>
    </div>
  );
}
