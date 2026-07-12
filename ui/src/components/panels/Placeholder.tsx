import { Construction } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
}

export function PlaceholderPanel({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <Construction size={48} className="text-lv-accent mb-4 opacity-50" />
      <h2 className="text-lg font-semibold text-gray-200 mb-2">{title}</h2>
      <p className="text-sm text-lv-muted max-w-md">
        {description ?? 'This module is scaffolded and ready for Phase 2 implementation.'}
      </p>
    </div>
  );
}
