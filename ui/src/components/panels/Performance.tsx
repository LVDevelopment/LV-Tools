import { useEffect, useState } from 'react';
import { PanelShell } from './PanelShell';
import { fetchNui } from '@/lib/nui';
import type { PerformanceData } from '@/types';

function Meter({ label, value, unit, pct, good }: { label: string; value: number; unit: string; pct: number; good: boolean }) {
  return (
    <div className="lv-card">
      <div className="flex items-center justify-between mb-2">
        <p className="lv-subtle">{label}</p>
        <p className="text-sm font-mono text-gray-100">
          {value} <span className="lv-subtle">{unit}</span>
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${good ? 'bg-lv-accent' : 'bg-amber-400'}`}
          style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}

export function PerformancePanel() {
  const [perf, setPerf] = useState<PerformanceData | null>(null);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      const res = await fetchNui<PerformanceData>('getPerformance');
      if (alive && res.data) setPerf(res.data);
    };
    poll();
    const id = setInterval(poll, 1000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!perf) {
    return (
      <PanelShell title="Performance" description="Live client metrics.">
        <p className="lv-subtle text-center py-8">Reading metrics…</p>
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Performance" description="Live client metrics.">
      <Meter label="FPS" value={perf.fps} unit="fps" pct={(perf.fps / 144) * 100} good={perf.fps >= 50} />
      <Meter label="Frame time" value={perf.frameTimeMs} unit="ms" pct={(perf.frameTimeMs / 33) * 100} good={perf.frameTimeMs <= 20} />
      <Meter label="Ping" value={perf.ping} unit="ms" pct={(perf.ping / 200) * 100} good={perf.ping <= 80} />
      <Meter label="Lua memory" value={perf.memoryMb} unit="MB" pct={(perf.memoryMb / 200) * 100} good={perf.memoryMb <= 120} />
      <div className="lv-card">
        <p className="lv-subtle">Resources</p>
        <p className="text-sm font-mono text-gray-100">{perf.resourceCount} running</p>
      </div>
    </PanelShell>
  );
}
