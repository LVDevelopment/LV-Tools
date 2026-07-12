import { useEffect, useState } from 'react';
import { Box, Trash2, Snowflake, Copy, Download, Plus } from 'lucide-react';
import { PanelShell } from './PanelShell';
import { useAppStore } from '@/store';
import { fetchNui, copyToClipboard, isEnvBrowser } from '@/lib/nui';
import type { PropItem } from '@/types';

const QUICK_PROPS = [
  'prop_barrier_work05',
  'prop_roadcone02a',
  'prop_ld_int_safe_01',
  'v_ilev_fib_door1',
];

export function PropsPanel() {
  const props = useAppStore((s) => s.props);
  const setProps = useAppStore((s) => s.setProps);
  const addToast = useAppStore((s) => s.addToast);
  const logHistory = useAppStore((s) => s.logHistory);
  const [model, setModel] = useState('');
  const [placement, setPlacement] = useState<'raycast' | 'player'>('raycast');

  const refresh = async () => {
    const res = await fetchNui<{ props: PropItem[] }>('getProps');
    if (res.data?.props) setProps(res.data.props);
  };

  useEffect(() => {
    refresh();
  }, []);

  const run = async (action: string, extra: Record<string, unknown> = {}) => {
    const res = await fetchNui<{ props?: PropItem[] }>('propAction', { action, ...extra });
    if (!res.success) {
      addToast(res.error ?? 'Action failed', 'error');
      return res;
    }
    if (res.data?.props) setProps(res.data.props);
    return res;
  };

  const spawn = async (m?: string) => {
    const modelName = m ?? model.trim();
    if (!modelName) {
      addToast('Enter a prop model', 'warning');
      return;
    }
    await run('spawn', { model: modelName, placement });
    addToast(`Spawned ${modelName}`, 'success');
    logHistory('Spawned prop', modelName);
  };

  const copyProp = async (p: PropItem) => {
    const res = await run('copy', { id: p.id });
    if (res.text && isEnvBrowser) copyToClipboard(res.text);
    addToast('Copied prop coords', 'success');
  };

  const exportAll = async () => {
    const res = await run('export');
    if (res.text) {
      if (isEnvBrowser) copyToClipboard(res.text);
      addToast('Exported props to clipboard', 'success');
    }
  };

  return (
    <PanelShell
      title="Props"
      description="Spawn and manage GTA objects."
      actions={
        <>
          <button onClick={exportAll} className="lv-btn flex items-center gap-1.5">
            <Download size={14} /> Export
          </button>
          <button onClick={() => run('clear')} className="lv-btn flex items-center gap-1.5">
            <Trash2 size={14} /> Clear
          </button>
        </>
      }
    >
      <div className="lv-card space-y-3">
        <div className="flex gap-2">
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && spawn()}
            placeholder="prop_model_name"
            className="lv-input flex-1"
          />
          <button onClick={() => spawn()} className="lv-btn-primary flex items-center gap-1.5">
            <Plus size={14} /> Spawn
          </button>
        </div>
        <div className="flex gap-2">
          {(['raycast', 'player'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPlacement(mode)}
              className={`lv-btn flex-1 capitalize ${placement === mode ? 'border-lv-accent/60 text-lv-accent' : ''}`}
            >
              {mode === 'raycast' ? 'At crosshair' : 'In front of me'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROPS.map((p) => (
            <button key={p} onClick={() => spawn(p)} className="lv-btn text-xs">
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {props.length === 0 && <p className="lv-subtle text-center py-6">No props spawned yet.</p>}
        {props.map((p) => (
          <div key={p.id} className="lv-card flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm text-gray-100 flex items-center gap-1.5 truncate">
                <Box size={14} className="text-lv-accent flex-shrink-0" /> {p.modelName}
              </p>
              <p className="lv-subtle font-mono truncate">
                {p.coords.x}, {p.coords.y}, {p.coords.z}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => run('freeze', { id: p.id })}
                className={`lv-btn px-2 ${p.frozen ? 'border-lv-accent/60 text-lv-accent' : ''}`}
                title="Freeze"
              >
                <Snowflake size={14} />
              </button>
              <button onClick={() => copyProp(p)} className="lv-btn px-2" title="Copy coords">
                <Copy size={14} />
              </button>
              <button
                onClick={() => run('delete', { id: p.id })}
                className="lv-btn px-2 hover:text-red-400"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}
