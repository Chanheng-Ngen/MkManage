import { useRef } from "react";
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

  const onPointerDown = (e: ReactPointerEvent<T>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    dragRef.current = {
      down: true,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<T>) => {
    if (!dragRef.current.down) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    if (dragRef.current.moved) {
      const el = ref.current;
      if (el) {
        el.scrollLeft = dragRef.current.startLeft - dx;
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
      }
    }
  };

  const endDrag = () => {
    dragRef.current.down = false;
    const el = ref.current;
    if (el) {
      el.style.cursor = "";
      el.style.userSelect = "";
    }
  };

  const onPointerUp = () => {
    endDrag();
  };

  const onPointerCancel = () => {
    endDrag();
  };

  const wasDrag = () => dragRef.current.moved;

  return {
    ref,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    wasDrag,
  };
}