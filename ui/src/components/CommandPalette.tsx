import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import type { TabId } from '@/types';

const COMMANDS: { id: string; label: string; tab?: TabId; action?: string }[] = [
  { id: 'goto-dashboard', label: 'Go to Dashboard', tab: 'dashboard' },
  { id: 'goto-coords', label: 'Go to Coordinates', tab: 'coordinates' },
  { id: 'goto-raycast', label: 'Go to Raycast', tab: 'raycast' },
  { id: 'goto-polyzones', label: 'Go to Polyzones', tab: 'polyzones' },
  { id: 'goto-settings', label: 'Open Settings', tab: 'settings' },
  { id: 'copy-v3', label: 'Copy Vector3', action: 'copy-v3' },
  { id: 'copy-v4', label: 'Copy Vector4', action: 'copy-v4' },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveTab } = useAppStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const execute = (cmd: (typeof COMMANDS)[0]) => {
    if (cmd.tab) setActiveTab(cmd.tab);
    setCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh] bg-black/50"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-lv-surface border border-lv-border rounded-xl shadow-window overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setSelected((s) => Math.min(s + 1, filtered.length - 1));
            if (e.key === 'ArrowUp') setSelected((s) => Math.max(s - 1, 0));
            if (e.key === 'Enter' && filtered[selected]) execute(filtered[selected]);
          }}
          placeholder="Type a command..."
          className="w-full px-4 py-3 bg-transparent border-b border-lv-border text-gray-200 outline-none"
        />
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => execute(cmd)}
              className={`w-full text-left px-4 py-2 text-sm ${
                i === selected ? 'bg-lv-accent/20 text-lv-accent' : 'text-gray-300 hover:bg-lv-border/50'
              }`}
            >
              {cmd.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-3 text-sm text-lv-muted">No commands found</p>
          )}
        </div>
      </div>
    </div>
  );
}
