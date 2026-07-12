import { useAppStore } from '@/store';
import { fetchNui, copyToClipboard } from '@/lib/nui';
import { Copy, Pin, Trash2 } from 'lucide-react';

export function ClipboardPanel() {
  const clipboard = useAppStore((s) => s.clipboard);
  const setClipboard = useAppStore((s) => s.setClipboard);

  const recopy = async (id: string, text: string) => {
    copyToClipboard(text);
    await fetchNui('clipboardAction', { action: 'copy', id });
  };

  const remove = async (id: string) => {
    const res = await fetchNui<{ entries: typeof clipboard }>('clipboardAction', { action: 'delete', id });
    if (res.data?.entries) setClipboard(res.data.entries);
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Clipboard Manager</h2>
      <div className="space-y-2">
        {clipboard.map((entry) => (
          <div key={entry.id} className="lv-card flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-1.5 py-0.5 rounded bg-lv-bg text-lv-muted">{entry.format}</span>
                {entry.pinned && <Pin size={12} className="text-lv-accent" />}
              </div>
              <p className="text-sm font-mono text-gray-200 truncate">{entry.text}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => recopy(entry.id, entry.text)} className="lv-btn p-2"><Copy size={14} /></button>
              <button onClick={() => remove(entry.id)} className="lv-btn p-2 text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {clipboard.length === 0 && <p className="text-sm text-lv-muted">No clipboard history</p>}
      </div>
    </div>
  );
}
