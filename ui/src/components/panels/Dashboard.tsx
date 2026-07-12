import { MousePointerClick, Copy, Keyboard, Zap } from 'lucide-react';

const TIPS = [
  {
    icon: MousePointerClick,
    title: 'Pick a tool',
    text: 'Choose any tool from the sidebar on the left to get started.',
  },
  {
    icon: Copy,
    title: 'Copy anything',
    text: 'Grab coordinates, zones, props and doors in one click — ready to paste.',
  },
  {
    icon: Keyboard,
    title: 'Move freely',
    text: 'Walk around with the menu open. Press F7 to toggle, Esc to close.',
  },
  {
    icon: Zap,
    title: 'Zero idle cost',
    text: 'Tools only run while you use them, so your server stays fast.',
  },
];

export function DashboardPanel() {
  return (
    <div className="h-full overflow-y-auto flex items-center justify-center p-8 text-center">
      <div className="w-full max-w-md">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-lv-accent/30 bg-lv-accent/15">
          <span className="text-xl font-bold text-lv-accent">LV</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-gray-100">
          Welcome to LV Development Tools
        </h1>
        <p className="mt-2 text-sm text-lv-muted">
          A fast, modern toolkit for building and debugging your FiveM server.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {TIPS.map((tip) => (
            <div key={tip.title} className="lv-card">
              <tip.icon size={18} className="mb-2 text-lv-accent" />
              <p className="text-sm font-medium text-gray-100">{tip.title}</p>
              <p className="lv-subtle mt-1 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>

        <p className="lv-subtle mt-8">Select a tool from the sidebar to begin.</p>
      </div>
    </div>
  );
}
