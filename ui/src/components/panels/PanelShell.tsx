interface Props {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PanelShell({ title, description, actions, children }: Props) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-white/10">
        <div>
          <h2 className="lv-title">{title}</h2>
          {description && <p className="lv-subtle mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">{children}</div>
    </div>
  );
}
