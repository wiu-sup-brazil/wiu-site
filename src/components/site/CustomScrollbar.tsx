import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Scrollbar customizada global, fixed na borda direita da janela.
 *
 * Substitui a scrollbar nativa do navegador (que é escondida via CSS em
 * styles.css). Fica larga o suficiente pra pegar no mouse e combina com
 * o tema dark do site. Aparece só quando o documento é maior que a
 * janela (scroll faz sentido).
 */
export function CustomScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({
    thumbTop: 0,
    thumbHeight: 0,
    visible: false,
  });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef(0);

  const recalc = useCallback(() => {
    if (typeof window === "undefined") return;
    const doc = document.documentElement;
    const winH = window.innerHeight;
    const docH = doc.scrollHeight;
    const scrollY = window.scrollY || doc.scrollTop || 0;

    if (docH <= winH + 4) {
      setState((s) => (s.visible ? { ...s, visible: false } : s));
      return;
    }

    const ratio = winH / docH;
    // Thumb com no mínimo 40px, ocupa proporção real do viewport no documento
    const thumbHeight = Math.max(40, Math.round(winH * ratio));
    const maxScroll = docH - winH;
    const maxThumbTop = winH - thumbHeight;
    const thumbTop = (scrollY / maxScroll) * maxThumbTop;

    setState({
      thumbTop: Math.max(0, Math.min(maxThumbTop, thumbTop)),
      thumbHeight,
      visible: true,
    });
  }, []);

  useEffect(() => {
    recalc();
    const onScroll = () => recalc();
    const onResize = () => recalc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Observa mudanças no tamanho do documento (imagens carregando,
    // seções abrindo/fechando, etc)
    const ro = new ResizeObserver(recalc);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [recalc]);

  // Arrastar o thumb
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const relY = e.clientY - rect.top - dragOffset.current;
      const winH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const maxThumbTop = winH - state.thumbHeight;
      const maxScroll = docH - winH;
      const clamped = Math.max(0, Math.min(maxThumbTop, relY));
      const scrollY = (clamped / maxThumbTop) * maxScroll;
      window.scrollTo(0, scrollY);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, state.thumbHeight]);

  function onThumbPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = e.clientY - rect.top;
    setDragging(true);
  }

  function onTrackPointerDown(e: React.PointerEvent) {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    // Se clicou dentro do thumb, começa a arrastar. Se clicou fora, pula pro ponto.
    if (clickY >= state.thumbTop && clickY <= state.thumbTop + state.thumbHeight) {
      dragOffset.current = clickY - state.thumbTop;
      setDragging(true);
      return;
    }
    const targetThumbTop = clickY - state.thumbHeight / 2;
    const winH = window.innerHeight;
    const docH = document.documentElement.scrollHeight;
    const maxThumbTop = winH - state.thumbHeight;
    const maxScroll = docH - winH;
    const clamped = Math.max(0, Math.min(maxThumbTop, targetThumbTop));
    const scrollY = (clamped / maxThumbTop) * maxScroll;
    window.scrollTo({ top: scrollY, behavior: "smooth" });
  }

  if (!state.visible) return null;

  return (
    <div
      ref={trackRef}
      onPointerDown={onTrackPointerDown}
      aria-hidden
      className="fixed right-0 top-0 h-screen z-[200] hidden md:block"
      style={{
        width: "14px",
        background: "rgba(12, 26, 32, 0.35)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.06)",
        cursor: "pointer",
      }}
    >
      <div
        onPointerDown={onThumbPointerDown}
        className="absolute left-1/2 -translate-x-1/2 rounded-full transition-colors"
        style={{
          top: `${state.thumbTop}px`,
          height: `${state.thumbHeight}px`,
          width: "8px",
          background: dragging
            ? "rgba(63, 208, 240, 0.9)"
            : "rgba(63, 208, 240, 0.55)",
          boxShadow: dragging
            ? "0 0 12px rgba(63, 208, 240, 0.6)"
            : "0 1px 3px rgba(0,0,0,0.4)",
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
      />
    </div>
  );
}
