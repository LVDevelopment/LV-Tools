import clsx from 'clsx';
import {
  LayoutDashboard,
  MapPin,
  Crosshair,
  Shapes,
  DoorClosed,
  Box,
  MapPinned,
  Ruler,
  Clipboard,
  Wrench,
  History,
  Settings,
  Bug,
  Gauge,
  Search,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { fetchNui } from '@/lib/nui';
import type { TabId } from '@/types';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'coordinates', label: 'Coordinates', icon: <MapPin size={18} /> },
  { id: 'raycast', label: 'Raycast', icon: <Crosshair size={18} /> },
  { id: 'polyzones', label: 'Polyzones', icon: <Shapes size={18} /> },
  { id: 'doorlocks', label: 'Door Locks', icon: <DoorClosed size={18} /> },
  { id: 'props', label: 'Props', icon: <Box size={18} /> },
  { id: 'markers', label: 'Markers', icon: <MapPinned size={18} /> },
  { id: 'measurements', label: 'Measurements', icon: <Ruler size={18} /> },
  { id: 'clipboard', label: 'Clipboard', icon: <Clipboard size={18} /> },
  { id: 'utilities', label: 'Utilities', icon: <Wrench size={18} /> },
  { id: 'history', label: 'History', icon: <History size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  { id: 'debug', label: 'Debug', icon: <Bug size={18} /> },
  { id: 'performance', label: 'Performance', icon: <Gauge size={18} /> },
];

export function Sidebar() {
  const { activeTab, setActiveTab, setCommandPaletteOpen } = useAppStore();

  const handleTab = (tab: TabId) => {
    setActiveTab(tab);
    fetchNui('setActiveTab', { tab });
  };

  return (
    <nav className="w-14 flex-shrink-0 border-r border-white/10 bg-white/[0.02] flex flex-col items-center py-2 gap-1 no-scrollbar overflow-y-auto">
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="group relative w-10 h-10 rounded-lg flex items-center justify-center text-lv-muted hover:text-gray-100 hover:bg-white/[0.06] transition-colors mb-1"
        title="Search (Ctrl+K)"
      >
        <Search size={18} />
        <Tooltip label="Search" />
      </button>

      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTab(tab.id)}
            className={clsx(
              'group relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
              active
                ? 'bg-lv-accent/20 text-lv-accent ring-1 ring-lv-accent/40'
                : 'text-lv-muted hover:text-gray-100 hover:bg-white/[0.06]',
            )}
          >
            {tab.icon}
            <Tooltip label={tab.label} />
          </button>
        );
      })}
    </nav>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-black/85 px-2 py-1 text-xs text-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
      {label}
    </span>
  );
}
