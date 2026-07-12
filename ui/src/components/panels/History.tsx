import { Trash2, Copy, History as HistoryIcon } from 'lucide-react';
import { PanelShell } from './PanelShell';
import { useAppStore } from '@/store';
import { copyToClipboard } from '@/lib/nui';

export function HistoryPanel() {
  const history = useAppStore((s) => s.history);
  const clearHistory = useAppStore((s) => s.clearHistory);
  const addToast = useAppStore((s) => s.addToast);

  const timeAgo = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  return (
    <PanelShell
      title="History"
      description="Session log of copies and edits."
      actions={
        <button onClick={clearHistory} className="lv-btn flex items-center gap-1.5">
          <Trash2 size={14} /> Clear
        </button>
      }
    >
      {history.length === 0 && (
        <p className="lv-subtle flex items-center justify-center gap-2 py-8">
          <HistoryIcon size={14} /> No actions recorded yet.
        </p>
      )}
      {history.map((h) => (
        <div key={h.id} className="lv-card flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-gray-100">{h.action}</p>
            <p className="lv-subtle font-mono truncate">{h.detail}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="lv-subtle">{timeAgo(h.timestamp)}</span>
            <button
              onClick={() => {
                copyToClipboard(h.detail);
                addToast('Copied', 'success');
              }}
              className="lv-btn px-2"
              title="Copy"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      ))}
    </PanelShell>
  );
}
