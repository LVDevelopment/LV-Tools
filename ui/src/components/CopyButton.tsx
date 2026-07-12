import { useState } from 'react';
import clsx from 'clsx';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard, fetchNui } from '@/lib/nui';
import { useAppStore } from '@/store';

interface Props {
  label: string;
  format: string;
  className?: string;
}

export function CopyButton({ label, format, className }: Props) {
  const [copied, setCopied] = useState(false);
  const addToast = useAppStore((s) => s.addToast);
  const logHistory = useAppStore((s) => s.logHistory);
  const notifyOnCopy = useAppStore((s) => s.settings.notifyOnCopy);

  const handleCopy = async () => {
    const res = await fetchNui<{ text?: string }>('copyFormat', { format });
    const text = res.text ?? '';
    if (text) {
      copyToClipboard(text);
      setCopied(true);
      if (notifyOnCopy) addToast(`Copied ${label}`, 'success');
      logHistory(`Copied ${label}`, text);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={clsx(
        'lv-btn flex items-center justify-between gap-2 w-full text-left',
        copied && 'border-green-500/50 text-green-400',
        className,
      )}
    >
      <span>{copied ? 'Copied!' : label}</span>
      {copied ? <Check size={14} /> : <Copy size={14} className="text-lv-muted" />}
    </button>
  );
}
