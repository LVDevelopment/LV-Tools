import { RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store';
import { fetchNui } from '@/lib/nui';
import { Toggle } from '@/components/Toggle';
import { Select } from '@/components/Select';
import { MOCK_SETTINGS } from '@/lib/mock';

const ACCENT_PRESETS = ['#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#f59e0b', '#14b8a6'];

const AUTOSAVE_OPTIONS = [
  { value: '15000', label: 'Every 15 seconds' },
  { value: '30000', label: 'Every 30 seconds' },
  { value: '60000', label: 'Every minute' },
  { value: '300000', label: 'Every 5 minutes' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="lv-card space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-lv-muted">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-200">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function SettingsPanel() {
  const { settings, setSettings, addToast } = useAppStore();

  const update = async (key: keyof typeof settings, value: unknown) => {
    setSettings({ [key]: value } as Partial<typeof settings>);
    await fetchNui('updateSettings', { [key]: value });
  };

  const reset = async () => {
    setSettings(MOCK_SETTINGS);
    await fetchNui('updateSettings', MOCK_SETTINGS as unknown as Record<string, unknown>);
    addToast('Settings reset to defaults', 'info');
  };

  return (
    <div className="p-6 overflow-y-auto h-full max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Settings</h2>
        <button onClick={reset} className="lv-btn flex items-center gap-1.5 text-xs">
          <RotateCcw size={13} /> Reset to defaults
        </button>
      </div>

      <Section title="Appearance">
        <Row label="Accent color">
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {ACCENT_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => update('accentColor', color)}
                  title={color}
                  className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-105 ${
                    settings.accentColor.toLowerCase() === color ? 'border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => update('accentColor', e.target.value)}
              className="h-7 w-10 flex-shrink-0 cursor-pointer rounded bg-transparent"
              title="Custom color"
            />
          </div>
        </Row>

        <Row label={`Opacity — ${Math.round(settings.opacity * 100)}%`}>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.05}
            value={settings.opacity}
            onChange={(e) => update('opacity', parseFloat(e.target.value))}
            className="w-full"
          />
        </Row>

        <Row label={`Font size — ${settings.fontSize}px`}>
          <input
            type="range"
            min={12}
            max={18}
            value={settings.fontSize}
            onChange={(e) => update('fontSize', parseInt(e.target.value))}
            className="w-full"
          />
        </Row>

        <Toggle
          label="Compact mode"
          description="Tighter spacing to fit more on screen."
          checked={settings.compactMode}
          onChange={(v) => update('compactMode', v)}
        />
      </Section>

      <Section title="Behavior">
        <Toggle
          label="Show notifications"
          description="Toast pop-ups for actions and events."
          checked={settings.showNotifications}
          onChange={(v) => update('showNotifications', v)}
        />
        <Toggle
          label="Notify on copy"
          description="Confirm every time something is copied."
          checked={settings.notifyOnCopy}
          onChange={(v) => update('notifyOnCopy', v)}
        />
        <Toggle
          label="Confirm deletions"
          description="Ask before deleting zones, props and doors."
          checked={settings.confirmDeletions}
          onChange={(v) => update('confirmDeletions', v)}
        />
        <Toggle
          label="Performance mode"
          description="Lower update rates for weaker machines."
          checked={settings.performanceMode}
          onChange={(v) => update('performanceMode', v)}
        />
      </Section>

      <Section title="World tools">
        <Row label={`Raycast distance — ${settings.raycastDistance}m`}>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={settings.raycastDistance}
            onChange={(e) => update('raycastDistance', parseInt(e.target.value))}
            className="w-full"
          />
        </Row>
        <Row label={`Overlay text scale — ${settings.overlayScale.toFixed(2)}x`}>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={settings.overlayScale}
            onChange={(e) => update('overlayScale', parseFloat(e.target.value))}
            className="w-full"
          />
        </Row>
      </Section>

      <Section title="Data">
        <Toggle
          label="Developer mode"
          description="Extra logging and debug helpers."
          checked={settings.developerMode}
          onChange={(v) => update('developerMode', v)}
        />
        <Toggle
          label="Autosave"
          description="Automatically persist zones, props and doors."
          checked={settings.autosave}
          onChange={(v) => update('autosave', v)}
        />
        {settings.autosave && (
          <Row label="Autosave interval">
            <Select
              value={String(settings.autosaveInterval)}
              options={AUTOSAVE_OPTIONS}
              onChange={(v) => update('autosaveInterval', parseInt(v))}
            />
          </Row>
        )}
      </Section>
    </div>
  );
}
