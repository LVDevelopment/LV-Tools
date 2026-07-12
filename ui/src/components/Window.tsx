import { useRef, useCallback, useEffect } from 'react';
import { X, PanelRight, PanelTop } from 'lucide-react';
import { useAppStore } from '@/store';
import { fetchNui } from '@/lib/nui';

interface Props {
  children: React.ReactNode;
}

const DOCK_MARGIN = 16;
const MIN_WIDTH = 380;
const MAX_WIDTH = 820;
const MIN_HEIGHT = 360;

export function Window({ children }: Props) {
  const { window: windowState, setWindow, settings } = useAppStore();
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; w: number; h: number } | null>(null);
  const dockWidthRef = useRef<{ startX: number; w: number } | null>(null);
  const dockHeightRef = useRef<{ startY: number; h: number } | null>(null);

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (windowState.docked !== 'none') return;
      dragRef.current = { startX: e.clientX, startY: e.clientY, winX: windowState.x, winY: windowState.y };
    },
    [windowState],
  );

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      resizeRef.current = { startX: e.clientX, startY: e.clientY, w: windowState.width, h: windowState.height };
    },
    [windowState],
  );

  const onDockWidthStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dockWidthRef.current = { startX: e.clientX, w: windowState.width };
    },
    [windowState],
  );

  const onDockHeightStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dockHeightRef.current = { startY: e.clientY, h: windowState.height };
    },
    [windowState],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setWindow({ x: dragRef.current.winX + dx, y: dragRef.current.winY + dy });
      }
      if (resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        setWindow({
          width: Math.max(MIN_WIDTH, resizeRef.current.w + dx),
          height: Math.max(MIN_HEIGHT, resizeRef.current.h + dy),
        });
      }
      if (dockWidthRef.current) {
        // Right-docked: dragging the left edge grows the panel toward the left.
        const dx = dockWidthRef.current.startX - e.clientX;
        setWindow({ width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dockWidthRef.current.w + dx)) });
      }
      if (dockHeightRef.current) {
        const dy = e.clientY - dockHeightRef.current.startY;
        setWindow({ height: Math.max(MIN_HEIGHT, dockHeightRef.current.h + dy) });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
      dockWidthRef.current = null;
      dockHeightRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [setWindow]);

  const isRight = windowState.docked === 'right';
  const isLeft = windowState.docked === 'left';
  const isFloating = windowState.docked === 'none';

  // Clamp docked height to the viewport so it never overflows on small screens.
  const maxDockHeight =
    typeof window !== 'undefined' ? window.innerHeight - DOCK_MARGIN * 2 : windowState.height;
  const dockHeight = Math.min(windowState.height, maxDockHeight);

  const dockedStyle: React.CSSProperties = isRight
    ? { right: DOCK_MARGIN, top: DOCK_MARGIN, width: windowState.width, height: dockHeight }
    : isLeft
      ? { left: DOCK_MARGIN, top: DOCK_MARGIN, width: windowState.width, height: dockHeight }
      : { left: windowState.x, top: windowState.y, width: windowState.width, height: windowState.height };

  // Plain translucency (NO backdrop-filter — CEF renders it as a black box).
  const glassAlpha = Math.min(0.72, (settings.opacity ?? 0.9) * 0.62);

  return (
    <div
      className="fixed flex flex-col rounded-2xl border border-white/10 overflow-hidden ring-1 ring-white/5"
      style={{
        ...dockedStyle,
        backgroundColor: `rgba(17, 19, 26, ${glassAlpha})`,
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.28)',
      }}
    >
      {/* Title bar */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.04] select-none ${isFloating ? 'cursor-move' : ''}`}
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-lv-accent shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="text-sm font-semibold tracking-tight text-gray-100">LV-Tools</span>
          <span className="text-[10px] text-lv-muted font-mono">v2.0</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-md hover:bg-white/10 text-lv-muted hover:text-gray-100 transition-colors"
            onClick={() => setWindow({ docked: isRight ? 'none' : 'right' })}
            title={isRight ? 'Undock (float)' : 'Dock right'}
          >
            {isRight ? <PanelTop size={14} /> : <PanelRight size={14} />}
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-red-500/20 text-lv-muted hover:text-red-400 transition-colors"
            onClick={() => fetchNui('close')}
            title="Close (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0">{children}</div>

      {/* Resize handles */}
      {isRight && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-lv-accent/40 transition-colors"
            onMouseDown={onDockWidthStart}
            title="Drag to resize width"
          />
          <div
            className="absolute left-0 right-0 bottom-0 h-1.5 cursor-ns-resize hover:bg-lv-accent/40 transition-colors"
            onMouseDown={onDockHeightStart}
            title="Drag to resize height"
          />
        </>
      )}
      {isFloating && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={onResizeStart}>
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-lv-muted/60" />
        </div>
      )}
    </div>
  );
}
