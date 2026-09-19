import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

interface DragState {
  down: boolean;
  startX: number;
  startLeft: number;
  moved: boolean;
}

export function useDragToScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const dragRef = useRef<DragState>({ down: false, startX: 0, startLeft: 0, moved: false });
  const detachListRef = useRef<Array<() => void>>([]);

  const detachListeners = useCallback(() => {
    detachListRef.current.forEach((fn) => fn());
    detachListRef.current = [];
  }, []);

  useEffect(() => {
    return () => detachListRef.current.forEach((fn) => fn());
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<T>) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const el = ref.current;
      if (!el) return;

      dragRef.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };

      const onMove = (ev: PointerEvent) => {
        if (!dragRef.current.down) return;
        const dx = ev.clientX - dragRef.current.startX;
        if (Math.abs(dx) > 4) dragRef.current.moved = true;
        if (dragRef.current.moved) {
          const node = ref.current;
          if (node) {
            node.scrollLeft = dragRef.current.startLeft - dx;
            node.style.cursor = "grabbing";
            node.style.userSelect = "none";
          }
        }
      };

      const onEnd = () => {
        detachListeners();
        dragRef.current.down = false;
        const node = ref.current;
        if (node) {
          node.style.cursor = "";
          node.style.userSelect = "";
        }
      };

      const detachCurrent = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
      detachListRef.current.push(detachCurrent);
    },
    [detachListeners],
  );

  const consumeDrag = () => {
    const wasMoved = dragRef.current.moved;
    dragRef.current.moved = false;
    return wasMoved;
  };

  return {
    ref,
    handlers: { onPointerDown },
    consumeDrag,
  };
}