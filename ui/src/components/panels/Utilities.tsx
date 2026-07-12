import { useAppStore } from '@/store';
import { fetchNui } from '@/lib/nui';

const UTILITIES = [
  { action: 'revive', label: 'Revive' },
  { action: 'heal', label: 'Heal' },
  { action: 'armor', label: 'Armor' },
  { action: 'noclip', label: 'Noclip' },
  { action: 'freeze', label: 'Freeze Player' },
  { action: 'invisible', label: 'Invisible' },
  { action: 'repair', label: 'Repair Vehicle' },
  { action: 'deleteVehicles', label: 'Delete Nearby Vehicles' },
  { action: 'deleteProps', label: 'Delete Nearby Props' },
  { action: 'deletePeds', label: 'Delete Nearby Peds' },
];

export function UtilitiesPanel() {
  const addToast = useAppStore((s) => s.addToast);

  const run = async (action: string) => {
    await fetchNui('utilityAction', { action });
    addToast(`${action} triggered (server validated)`, 'info');
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Utilities</h2>
      <p className="text-xs text-lv-muted mb-4">All actions are permission-protected and server-validated.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {UTILITIES.map((u) => (
          <button key={u.action} onClick={() => run(u.action)} className="lv-btn">
            {u.label}
          </button>
        ))}
      </div>
    </div>
  );
}
