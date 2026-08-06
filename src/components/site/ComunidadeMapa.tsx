import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useInView } from "motion/react";
import { X, Send, Wind, MapPin, Plus, Minus, Maximize2, Users, Check, CheckCheck, CalendarClock, Navigation2 } from "lucide-react";

/**
 * Mapa da comunidade v6 — chat estilo WhatsApp e HUD limpa ao abrir.
 *
 * Litoral do NE (Fortaleza → Lençóis) com curva realista, riders sobre
 * a areia, mini-mapa do Brasil no canto e zoom até 5x.
 *
 * Ao abrir o chat de um rider no desktop:
 * - Texto "Arrasta pra explorar..." some
 * - Inset do Brasil some
 * - Card do spot aparece à esquerda, chat estilo WhatsApp à direita
 *
 * Chat: fundo branco, header preto, balões cinzas pro outro, balão
 * azul WIU pra mim, avatares circulares, timestamps.
 *
 * DEMO_RIDERS / SPOT_WIND / DEMO_GROUPS são dados de demonstração.
 * Quando o backend existir (Supabase Realtime), troque pelos canais
 * mantendo o mesmo shape.
 */

type Rider = { id: string; name: string; spot: string; x: number; y: number; level: string };

const SPOTS = [
  { name: "Lençóis", x: 5.5, y: 22 },
  { name: "Atins", x: 10, y: 21.5 },
  { name: "Barra Grande", x: 17, y: 21 },
  { name: "Tatajuba", x: 23, y: 21.5 },
  { name: "Jericoacoara", x: 28.5, y: 22.5 },
  { name: "Preá", x: 33, y: 24.5 },
  { name: "Ilha do Guajiru", x: 38, y: 28 },
  { name: "Icaraizinho", x: 43, y: 32 },
  { name: "Mundaú", x: 48, y: 36 },
  { name: "Flecheiras", x: 53, y: 40 },
  { name: "Paracuru", x: 59, y: 44.5 },
  { name: "Taíba", x: 65, y: 49 },
  { name: "Cumbuco", x: 72, y: 53.5 },
  { name: "Fortaleza", x: 80, y: 57.5 },
];

const DEMO_RIDERS: Rider[] = [
  { id: "r1", name: "Léo", spot: "Cumbuco", x: 71, y: 53, level: "Avançado" },
  { id: "r2", name: "Marina", spot: "Cumbuco", x: 73, y: 54.5, level: "Intermediário" },
  { id: "r3", name: "Pedrão", spot: "Taíba", x: 65, y: 49, level: "Avançado" },
  { id: "r4", name: "Ana", spot: "Paracuru", x: 59, y: 44, level: "Iniciante" },
  { id: "r5", name: "Duda", spot: "Flecheiras", x: 53, y: 39.5, level: "Avançado" },
  { id: "r6", name: "Rafa", spot: "Icaraizinho", x: 43, y: 31.5, level: "Intermediário" },
  { id: "r7", name: "Caio", spot: "Ilha do Guajiru", x: 38, y: 27.5, level: "Avançado" },
  { id: "r8", name: "Thibaut", spot: "Preá", x: 33, y: 24, level: "Avançado" },
  { id: "r9", name: "Sofia", spot: "Jericoacoara", x: 28.5, y: 22, level: "Intermediário" },
  { id: "r10", name: "Marcos", spot: "Barra Grande", x: 17, y: 20.5, level: "Intermediário" },
  { id: "r11", name: "Bia", spot: "Atins", x: 10, y: 21, level: "Avançado" },
];

const SPOT_WIND: Record<string, { avg: number; gust: number; dir: string; deg: number }> = {
  "Fortaleza": { avg: 18, gust: 23, dir: "SSE", deg: 157 },
  "Cumbuco": { avg: 22, gust: 27, dir: "E", deg: 90 },
  "Taíba": { avg: 23, gust: 29, dir: "ESE", deg: 112 },
  "Paracuru": { avg: 21, gust: 26, dir: "E", deg: 90 },
  "Flecheiras": { avg: 20, gust: 24, dir: "ENE", deg: 67 },
  "Mundaú": { avg: 21, gust: 25, dir: "E", deg: 90 },
  "Icaraizinho": { avg: 24, gust: 29, dir: "E", deg: 90 },
  "Ilha do Guajiru": { avg: 25, gust: 30, dir: "E", deg: 90 },
  "Preá": { avg: 26, gust: 32, dir: "E", deg: 90 },
  "Jericoacoara": { avg: 24, gust: 30, dir: "E", deg: 90 },
  "Tatajuba": { avg: 25, gust: 31, dir: "E", deg: 90 },
  "Barra Grande": { avg: 24, gust: 29, dir: "ENE", deg: 67 },
  "Atins": { avg: 26, gust: 33, dir: "ENE", deg: 67 },
  "Lençóis": { avg: 25, gust: 32, dir: "ENE", deg: 67 },
};

type Grupo = { id: string; spot: string; rota: string; horario: string; dia: string; confirmados: string[] };

const DEMO_GROUPS: Grupo[] = [
  { id: "g1", spot: "Cumbuco", rota: "Cumbuco → Taíba", horario: "12h – 15h", dia: "Hoje", confirmados: ["Léo", "Marina", "Rafa", "Pedrão"] },
  { id: "g2", spot: "Preá", rota: "Preá → Jericoacoara", horario: "9h – 12h", dia: "Amanhã", confirmados: ["Thibaut", "Sofia"] },
  { id: "g3", spot: "Ilha do Guajiru", rota: "Downwind Guajiru → Tatajuba", horario: "13h30 – 17h", dia: "Sábado", confirmados: ["Caio", "Duda", "Léo"] },
];

const MIN_Z = 1;
const MAX_Z = 5;

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const fn = () => setM(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return m;
}

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

function Compass({ label, value, deg, accent }: { label: string; value: number; deg: number; accent: string }) {
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 88 88" className="w-[74px] md:w-[86px]">
        <circle cx="44" cy="44" r="40" fill="none" stroke="#0c1a20" strokeOpacity="0.1" strokeWidth="1.5" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          const main = i % 2 === 0;
          const r1 = main ? 33 : 35.5, r2 = 40;
          return (
            <line key={i}
              x1={44 + r1 * Math.sin(a)} y1={44 - r1 * Math.cos(a)}
              x2={44 + r2 * Math.sin(a)} y2={44 - r2 * Math.cos(a)}
              stroke="#0c1a20" strokeOpacity={main ? 0.35 : 0.15} strokeWidth={main ? 1.6 : 1} strokeLinecap="round" />
          );
        })}
        <text x="44" y="12" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0c1a20" fillOpacity="0.55">N</text>
        <text x="79" y="47" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0c1a20" fillOpacity="0.4">L</text>
        <text x="44" y="83" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0c1a20" fillOpacity="0.4">S</text>
        <text x="9" y="47" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0c1a20" fillOpacity="0.4">O</text>
        <g transform={`rotate(${deg} 44 44)`}>
          <path d="M44 14 L49.5 26 L44 22.8 L38.5 26 Z" fill={accent} style={{ filter: `drop-shadow(0 1px 4px ${accent}66)` }} />
          <path d="M44 74 L46.5 66 L44 68 L41.5 66 Z" fill="#0c1a20" fillOpacity="0.2" />
        </g>
        <text x="44" y="48" textAnchor="middle" fontSize="19" fontWeight="800" fill="#0c1a20">{value}</text>
        <text x="44" y="58" textAnchor="middle" fontSize="7" fontWeight="600" fill="#0c1a20" fillOpacity="0.45" letterSpacing="1">NÓS</text>
      </svg>
      <span className="mt-1 text-[9px] uppercase tracking-[0.18em] font-semibold" style={{ color: accent }}>{label}</span>
    </div>
  );
}

function SpotPanel({ spot, onClose, compact }: { spot: string; onClose?: () => void; compact?: boolean }) {
  const w = SPOT_WIND[spot] || { avg: 20, gust: 25, dir: "E", deg: 90 };
  return (
    <div className={`rounded-2xl border border-black/10 bg-white ${compact ? "px-4 py-3" : "p-5"} shadow-2xl shadow-black/40`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#0098c0]" />
            <span className="font-semibold text-[#0c1a20] text-sm md:text-base">{spot}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#0c1a20]/55">
            <Navigation2 className="h-3 w-3" style={{ transform: `rotate(${w.deg}deg)` }} />
            Vento de {w.dir} · agora
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-1.5 text-[#0c1a20]/45 hover:text-[#0c1a20] hover:bg-black/5 transition">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-3 flex items-start justify-center gap-5 md:gap-7">
        <Compass label="Vento médio" value={w.avg} deg={w.deg} accent="#18b26b" />
        <Compass label="Rajada" value={w.gust} deg={w.deg} accent="#0098c0" />
      </div>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (w.avg / 40) * 100)}%`, background: "linear-gradient(90deg,#18b26b,#a5d922)" }} />
      </div>
    </div>
  );
}

function WindParticles() {
  const lines = useMemo(
    () => Array.from({ length: 26 }, (_, i) => ({
      y: 4 + (i * 67) % 88, delay: (i * 0.53) % 6, dur: 5 + (i % 4) * 1.6,
      len: 30 + (i % 3) * 22, op: 0.12 + (i % 3) * 0.08,
    })), []
  );
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      {lines.map((l, i) => (
        <span key={i} className="absolute h-px rounded-full"
          style={{
            top: `${l.y}%`, left: "-15%", width: `${l.len}px`,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
            opacity: l.op, animation: `wiu-wind ${l.dur}s linear ${l.delay}s infinite`,
          }} />
      ))}
      <style>{`
        @keyframes wiu-wind { from { transform: translateX(0); } to { transform: translateX(130vw); } }
        @keyframes wiu-ping { 0% { transform: scale(1); opacity: 0.7; } 80%,100% { transform: scale(2.6); opacity: 0; } }
      `}</style>
    </div>
  );
}

function BrasilInset() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M 25 15 L 40 12 Q 55 10 68 15 Q 78 20 85 30 Q 92 40 90 50 Q 88 62 82 72 Q 75 82 65 88 Q 55 92 45 90 Q 35 88 28 82 Q 18 75 15 65 Q 10 55 12 45 Q 15 30 20 22 Q 22 18 25 15 Z"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path
        d="M 55 18 Q 68 16 78 22 Q 87 28 89 38 Q 88 44 82 46 Q 72 45 62 38 Q 55 32 55 24 Q 55 20 55 18 Z"
        fill="#00b4d8"
        fillOpacity="0.35"
        stroke="#3fd0f0"
        strokeWidth="0.8"
      />
      <circle cx="82" cy="28" r="1.6" fill="#39e58c">
        <animate attributeName="r" values="1.6;2.6;1.6" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.4;1" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <text x="50" y="98" fontSize="6" fill="white" fillOpacity="0.55" textAnchor="middle" fontWeight="600" letterSpacing="0.5">
        NORDESTE
      </text>
    </svg>
  );
}

export function ComunidadeMapa() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-15%" });
  const isMobile = useIsMobile();

  const [open, setOpen] = useState<Rider | null>(null);
  const [showGroups, setShowGroups] = useState(false);
  const [joined, setJoined] = useState<Set<string>>(new Set());

  const viewRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0, s: 1 });
  const tRef = useRef(t);
  tRef.current = t;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastTap = useRef(0);

  const clamp = useCallback((x: number, y: number, s: number) => {
    const el = viewRef.current;
    if (!el) return { x, y, s };
    const { width: W, height: H } = el.getBoundingClientRect();
    const minX = W * (1 - s), minY = H * (1 - s);
    return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)), s };
  }, []);

  const zoomAt = useCallback((px: number, py: number, ns: number) => {
    const { x, y, s } = tRef.current;
    const k = ns / s;
    setT(clamp(px - (px - x) * k, py - (py - y) * k, ns));
  }, [clamp]);

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) { dragging.current = true; moved.current = false; }
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: tRef.current.s };
      dragging.current = false;
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const ns = Math.min(MAX_Z, Math.max(MIN_Z, pinch.current.s * (d / pinch.current.d)));
      const rect = viewRef.current!.getBoundingClientRect();
      zoomAt((a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top, ns);
      return;
    }
    if (dragging.current) {
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
      const { x, y, s } = tRef.current;
      setT(clamp(x + dx, y + dy, s));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) {
      dragging.current = false;
      if (!moved.current && e.pointerType === "touch") {
        const now = Date.now();
        if (now - lastTap.current < 300) {
          const rect = viewRef.current!.getBoundingClientRect();
          const px = e.clientX - rect.left, py = e.clientY - rect.top;
          const s = tRef.current.s;
          zoomAt(px, py, s >= MAX_Z - 0.1 ? MIN_Z : Math.min(MAX_Z, s * 1.7));
        }
        lastTap.current = now;
      }
    }
  }

  function onDoubleClick(e: React.MouseEvent) {
    const rect = viewRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const s = tRef.current.s;
    zoomAt(px, py, s >= MAX_Z - 0.1 ? MIN_Z : Math.min(MAX_Z, s * 1.7));
  }

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const s = tRef.current.s;
      const ns = Math.min(MAX_Z, Math.max(MIN_Z, s * (e.deltaY < 0 ? 1.12 : 0.89)));
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, ns);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  function zoomBtn(dir: 1 | -1) {
    const el = viewRef.current!;
    const { width, height } = el.getBoundingClientRect();
    const s = tRef.current.s;
    const ns = Math.min(MAX_Z, Math.max(MIN_Z, s * (dir > 0 ? 1.4 : 0.71)));
    zoomAt(width / 2, height / 2, ns);
  }

  function riderClick(r: Rider) {
    if (moved.current) return;
    setOpen(r);
  }

  const inv = 1 / t.s;
  const chatOpenDesktop = open && !isMobile;

  return (
    <section id="comunidade" ref={sectionRef} className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #07222e 22%, #063246 55%, #07222e 88%, #0a0a0a 100%)" }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-32">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="max-w-3xl">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
            <span className="h-px w-10 bg-[#00b4d8]" /> Conheça a WIU
          </div>
          <h2 className="mt-6 display text-5xl md:text-7xl text-white leading-[0.92]">
            A comunidade está
            <br />
            <span className="serif italic normal-case tracking-normal text-[#3fd0f0]">no vento agora.</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl text-white/60 leading-relaxed max-w-xl">
            Do Ceará ao Maranhão — a rota do vento que faz do Nordeste o paraíso mundial do kite.
            Arrasta, dá zoom, clica num ponto verde: vê o vento do pico e marca de velejar junto.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative mt-14 rounded-2xl overflow-hidden border border-white/10"
          style={{ boxShadow: "0 40px 120px -20px rgba(0,180,216,0.25), 0 20px 60px -30px rgba(0,0,0,0.8)" }}
        >
          <div
            ref={viewRef}
            className="relative aspect-[16/12] md:aspect-[21/10] cursor-grab active:cursor-grabbing select-none touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={onDoubleClick}
          >
            <div className="absolute inset-0" style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, transformOrigin: "0 0" }}>
              <div className="absolute inset-0" style={{ background: "linear-gradient(200deg, #0a2f47 0%, #0e4a6b 40%, #1174a3 75%, #1a8ec4 100%)" }} />

              <svg viewBox="0 0 100 62" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-30" aria-hidden>
                <pattern id="ondas" x="0" y="0" width="6" height="4" patternUnits="userSpaceOnUse">
                  <path d="M 0 2 Q 1.5 1 3 2 T 6 2" fill="none" stroke="#3fd0f0" strokeWidth="0.15" opacity="0.4" />
                </pattern>
                <rect x="0" y="0" width="100" height="20" fill="url(#ondas)" />
              </svg>

              <WindParticles />

              <svg viewBox="0 0 100 62" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                  <linearGradient id="terra" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a5c3e" />
                    <stop offset="40%" stopColor="#134a30" />
                    <stop offset="100%" stopColor="#0d3520" />
                  </linearGradient>
                  <linearGradient id="areia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e8d4a0" />
                    <stop offset="100%" stopColor="#c8b48a" />
                  </linearGradient>
                  <radialGradient id="delta" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#5fd8f5" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#5fd8f5" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <path
                  d="M 0 22 Q 3 21.5 6 21.8 Q 12 20.8 17 20.5 Q 20 20.7 22 21 Q 25 21.8 27.5 21.5 Q 29 21 30 22 Q 32 23.5 34 24 Q 38 26 41 28.5 Q 45 32 48 35 Q 52 39 55 42 Q 59 45 62 47.5 Q 66 50 69 52.5 Q 72 54 74 55 Q 77 56 80 57 Q 88 58.5 100 60 L 100 62 L 0 62 Z"
                  fill="url(#areia)"
                />
                <path
                  d="M 0 25 Q 3 24.5 6 24.8 Q 12 24 17 23.8 Q 20 24 22 24.3 Q 25 25 27.5 25 Q 29 24.5 30 25.5 Q 32 27 34 27.5 Q 38 29.5 41 32 Q 45 35.5 48 38.5 Q 52 42.5 55 45.5 Q 59 48.5 62 51 Q 66 53.5 69 55.5 Q 72 57 74 58 Q 77 59 80 59.5 Q 88 60.5 100 61.5 L 100 62 L 0 62 Z"
                  fill="url(#terra)"
                />

                <circle cx="4" cy="27" r="6" fill="url(#delta)" />
                <ellipse cx="2" cy="26" rx="1.5" ry="0.7" fill="#5fd8f5" opacity="0.6" />
                <ellipse cx="4.5" cy="27.5" rx="1.2" ry="0.6" fill="#5fd8f5" opacity="0.55" />
                <ellipse cx="7" cy="26.5" rx="1" ry="0.5" fill="#5fd8f5" opacity="0.5" />
                <ellipse cx="3" cy="29" rx="0.9" ry="0.5" fill="#5fd8f5" opacity="0.45" />
                <ellipse cx="6" cy="28.5" rx="0.7" ry="0.4" fill="#5fd8f5" opacity="0.5" />
                <ellipse cx="8.5" cy="28" rx="0.6" ry="0.35" fill="#5fd8f5" opacity="0.4" />

                <path d="M 15 62 Q 14 55 12 48 Q 11 42 13 35" fill="none" stroke="#3fd0f0" strokeWidth="0.3" opacity="0.35" />
                <path d="M 45 62 Q 44 55 42 50" fill="none" stroke="#3fd0f0" strokeWidth="0.25" opacity="0.3" />
                <path d="M 75 62 Q 74 60 72 58" fill="none" stroke="#3fd0f0" strokeWidth="0.25" opacity="0.3" />

                <text x="10" y="42" fontSize="1.6" fontWeight="700" fill="#ffffff" fillOpacity="0.18" letterSpacing="0.3">MARANHÃO</text>
                <text x="30" y="55" fontSize="1.4" fontWeight="700" fill="#ffffff" fillOpacity="0.15" letterSpacing="0.3">PIAUÍ</text>
                <text x="60" y="58" fontSize="1.6" fontWeight="700" fill="#ffffff" fillOpacity="0.18" letterSpacing="0.3">CEARÁ</text>

                <g transform="translate(88 10)" opacity="0.35">
                  <circle cx="0" cy="0" r="3.5" fill="none" stroke="#ffffff" strokeWidth="0.15" />
                  <path d="M0 -3.5 L0.5 -0.5 L0 0 L-0.5 -0.5 Z" fill="#ffffff" />
                  <path d="M0 3.5 L0.5 0.5 L0 0 L-0.5 0.5 Z" fill="#ffffff" opacity="0.6" />
                  <path d="M3.5 0 L0.5 0.5 L0 0 L0.5 -0.5 Z" fill="#ffffff" opacity="0.6" />
                  <path d="M-3.5 0 L-0.5 0.5 L0 0 L-0.5 -0.5 Z" fill="#ffffff" opacity="0.6" />
                  <text x="0" y="-4.5" fontSize="1.4" fill="#ffffff" textAnchor="middle" fontWeight="700">N</text>
                </g>

                <g opacity="0.25" fill="none" stroke="#3fd0f0" strokeWidth="0.15" strokeLinecap="round">
                  <path d="M 95 15 L 85 15 M 88 13.5 L 85 15 L 88 16.5" />
                  <path d="M 95 8 L 87 8 M 89.5 6.7 L 87 8 L 89.5 9.3" />
                  <path d="M 95 5 L 88 5 M 90 3.8 L 88 5 L 90 6.2" />
                </g>
              </svg>

              {SPOTS.map((s) => (
                <div key={s.name} className="absolute -translate-x-1/2 pointer-events-none" style={{ left: `${s.x}%`, top: `${s.y + 3.5}%` }}>
                  <div className="flex flex-col items-center gap-0.5" style={{ transform: `scale(${inv})`, transformOrigin: "top center" }}>
                    <MapPin className="h-3 w-3 text-white/50" />
                    <span
                      className="text-[8px] md:text-[10px] uppercase tracking-[0.16em] text-white/80 whitespace-nowrap font-semibold"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)" }}
                    >
                      {s.name}
                    </span>
                  </div>
                </div>
              ))}

              {DEMO_RIDERS.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 300, damping: 18 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${r.x}%`, top: `${r.y}%` }}
                >
                  <button
                    onClick={() => riderClick(r)}
                    className="relative block group"
                    style={{ transform: `scale(${inv})` }}
                    aria-label={`Falar com ${r.name} em ${r.spot}`}
                  >
                    <span className="absolute inset-0 rounded-full bg-[#39e58c]"
                      style={{ animation: "wiu-ping 2.4s cubic-bezier(0,0,0.2,1) infinite", animationDelay: `${i * 0.3}s` }} />
                    <span className="relative block h-3.5 w-3.5 md:h-4 md:w-4 rounded-full bg-[#39e58c] ring-2 ring-white/90 shadow-[0_0_14px_rgba(57,229,140,0.9)] transition-transform group-hover:scale-125" />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap rounded-full bg-black/85 backdrop-blur px-2.5 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {r.name} · {r.spot}
                    </span>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* HUD fixo */}
            <div className="absolute top-3 left-3 md:top-6 md:left-6 flex items-center gap-2.5 rounded-full bg-black/50 backdrop-blur border border-white/10 px-3.5 py-2 md:px-4 pointer-events-none">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#39e58c] opacity-75" style={{ animation: "wiu-ping 1.8s infinite" }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#39e58c]" />
              </span>
              <span className="text-[11px] md:text-sm text-white font-medium tabular-nums">{DEMO_RIDERS.length} riders no vento agora</span>
            </div>

            <div className="absolute top-3 right-3 md:top-6 md:right-6 flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 rounded-full bg-black/50 backdrop-blur border border-white/10 px-3.5 py-2 md:px-4">
                <Wind className="h-3.5 w-3.5 text-[#3fd0f0]" />
                <span className="text-[11px] md:text-sm text-white tabular-nums">22 nós · E</span>
              </div>
              <button
                onClick={() => setShowGroups(true)}
                className="flex items-center gap-2 rounded-full bg-[#00b4d8] px-3.5 py-2 md:px-4 text-[11px] md:text-sm font-semibold text-white shadow-lg shadow-[#00b4d8]/30 hover:brightness-110 transition"
              >
                <Users className="h-3.5 w-3.5" /> Grupos de velejo
                <span className="rounded-full bg-white/25 px-1.5 text-[10px] tabular-nums">{DEMO_GROUPS.length}</span>
              </button>
            </div>

            {/* Controles de zoom */}
            <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 flex flex-col items-start gap-2">
              <div className="flex flex-col rounded-xl overflow-hidden border border-white/15 bg-black/50 backdrop-blur">
                <button onClick={() => zoomBtn(1)} aria-label="Aproximar" className="grid h-9 w-9 place-items-center text-white/80 hover:bg-white/10 transition"><Plus className="h-4 w-4" /></button>
                <div className="h-px bg-white/10" />
                <button onClick={() => zoomBtn(-1)} aria-label="Afastar" className="grid h-9 w-9 place-items-center text-white/80 hover:bg-white/10 transition"><Minus className="h-4 w-4" /></button>
                <div className="h-px bg-white/10" />
                <button onClick={() => setT({ x: 0, y: 0, s: 1 })} aria-label="Resetar" className="grid h-9 w-9 place-items-center text-white/60 hover:bg-white/10 transition"><Maximize2 className="h-3.5 w-3.5" /></button>
              </div>
              <div className="rounded-md bg-black/50 backdrop-blur border border-white/10 px-2 py-1 text-[9px] text-white/60 tabular-nums">
                {Math.round(t.s * 100)}%
              </div>
            </div>

            {/* Mini-mapa do Brasil — some quando abre o chat */}
            <AnimatePresence>
              {!chatOpenDesktop && (
                <motion.div
                  key="inset"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-3 right-3 md:bottom-6 md:right-6 w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden border border-white/15 bg-black/50 backdrop-blur p-1.5"
                >
                  <BrasilInset />
                </motion.div>
              )}
            </AnimatePresence>

            {/* DESKTOP: painel do spot + chat WhatsApp */}
            <AnimatePresence>
              {open && !isMobile && (
                <>
                  <motion.div key="spot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 26, stiffness: 300 }}
                    className="absolute top-24 left-6 w-72 z-20">
                    <SpotPanel spot={open.spot} />
                  </motion.div>
                  <ChatCard key="chat" rider={open} onClose={() => setOpen(null)} className="absolute top-24 right-6 w-[calc(100%-2rem)] max-w-xs z-20" />
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Texto embaixo — some quando abre o chat */}
        <AnimatePresence>
          {!chatOpenDesktop && (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5 text-center text-xs text-white/35"
            >
              Arrasta pra explorar · duplo clique dá zoom · pontos verdes = riders conectados agora.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* MOBILE: chat tela cheia com mapa embaçado atrás */}
      {isMobile && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex flex-col justify-end"
              style={{ background: "rgba(4,14,18,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
              <motion.div initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }} className="px-4 pt-5">
                <SpotPanel spot={open.spot} compact />
              </motion.div>
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="mt-4 flex-1 flex flex-col rounded-t-3xl overflow-hidden">
                <ChatCard rider={open} onClose={() => setOpen(null)} full />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* GRUPOS DE VELEJO */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showGroups && (
            <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[130] flex items-end md:items-center justify-center p-0 md:p-6"
              style={{ background: "rgba(4,14,18,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
              onClick={() => setShowGroups(false)}>
              <motion.div
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full md:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-3xl border border-white/15 bg-[#0c1a20] shadow-2xl">
                <div className="sticky top-0 flex items-center justify-between bg-[#0c1a20]/95 backdrop-blur px-6 py-4 border-b border-white/10">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Comunidade WIU</div>
                    <h3 className="font-semibold text-white text-lg">Grupos de velejo</h3>
                  </div>
                  <button onClick={() => setShowGroups(false)} aria-label="Fechar" className="rounded-full p-2 text-white/50 hover:text-white hover:bg-white/10 transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-3.5">
                  {DEMO_GROUPS.map((g) => {
                    const eu = joined.has(g.id);
                    const total = g.confirmados.length + (eu ? 1 : 0);
                    return (
                      <div key={g.id} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#3fd0f0]">
                              <MapPin className="h-3 w-3" /> {g.spot}
                            </div>
                            <div className="mt-1.5 font-semibold text-white leading-snug">{g.rota}</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-white/55">
                              <CalendarClock className="h-3.5 w-3.5" /> {g.dia} · {g.horario}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-display text-2xl text-white leading-none tabular-nums">{total}</div>
                            <div className="text-[10px] uppercase tracking-wider text-white/45">confirmados</div>
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between gap-3">
                          <div className="flex -space-x-2">
                            {g.confirmados.slice(0, 4).map((n) => (
                              <span key={n} className="grid h-7 w-7 place-items-center rounded-full bg-[#134] ring-2 ring-[#0c1a20] text-[10px] font-semibold text-white">{n.charAt(0)}</span>
                            ))}
                            {eu && <span className="grid h-7 w-7 place-items-center rounded-full bg-[#00b4d8] ring-2 ring-[#0c1a20] text-[10px] font-semibold text-white">Eu</span>}
                            {g.confirmados.length > 4 && (
                              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 ring-2 ring-[#0c1a20] text-[10px] text-white/70">+{g.confirmados.length - 4}</span>
                            )}
                          </div>
                          <button
                            onClick={() => setJoined((p) => { const n = new Set(p); if (n.has(g.id)) { n.delete(g.id); } else { n.add(g.id); } return n; })}
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                              eu ? "bg-[#39e58c]/15 text-[#39e58c] border border-[#39e58c]/40"
                                 : "bg-[#00b4d8] text-white hover:brightness-110 shadow-lg shadow-[#00b4d8]/25"
                            }`}>
                            {eu ? <><Check className="h-3.5 w-3.5" /> Confirmado</> : "Confirmar presença"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <p className="pt-1 text-center text-[11px] text-white/35">
                    Grupos são combinados pela comunidade. Sem conversa aqui — o papo é no ponto verde de cada rider.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}

/* Chat estilo WhatsApp — fundo branco, header preto, balões */
function ChatCard({ rider, onClose, className = "", full }: { rider: Rider; onClose: () => void; className?: string; full?: boolean }) {
  const [msgs, setMsgs] = useState<{ me: boolean; text: string; time: string }[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => { boxRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [msgs, typing]);

  function send() {
    const tt = text.trim();
    if (!tt) return;
    setMsgs((m) => [...m, { me: true, text: tt, time: nowTime() }]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { me: false, text: `Opa! Aqui em ${rider.spot} o vento tá firme. Cola aqui! 🤙`, time: nowTime() }]);
    }, 1400);
  }

  const inner = (
    <>
      {/* Header preto tipo WhatsApp */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#111] shrink-0">
        <div className="relative">
          <div className="grid h-9 w-9 place-items-center rounded-full text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)" }}>
            {rider.name.charAt(0)}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#39e58c] ring-2 ring-[#111]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white truncate">{rider.name}</div>
          <div className="text-[11px] text-white/50">{rider.spot} · {rider.level}</div>
        </div>
        <button onClick={onClose} aria-label="Fechar conversa" className="rounded-full p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Área de mensagens com fundo bege pontilhado (padrão WhatsApp) */}
      <div
        ref={boxRef}
        className={`${full ? "flex-1" : "h-64"} overflow-y-auto px-3.5 py-3 space-y-2`}
        style={{
          background: "#f7f5f0",
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(13,13,13,0.05) 1px, transparent 0)",
          backgroundSize: "14px 14px",
        }}
      >
        {msgs.length === 0 && !typing && (
          <div className="text-center py-6 px-4">
            <p className="text-[11px] text-[#0c1a20]/50 leading-relaxed">
              Diz um "e aí, como tá o vento em {rider.spot}?"
            </p>
            <p className="text-[10px] text-[#0c1a20]/35 mt-1.5">
              A conversa some quando fechar.
            </p>
          </div>
        )}

        {msgs.map((m, i) => (
          <div key={i} className={`flex items-end gap-1.5 ${m.me ? "justify-end" : "justify-start"}`}>
            {!m.me && (
              <div className="grid h-6 w-6 place-items-center rounded-full text-white text-[10px] font-bold shrink-0 mb-0.5"
                style={{ background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)" }}>
                {rider.name.charAt(0)}
              </div>
            )}
            <div
              className={`max-w-[78%] px-3 py-2 text-[13px] leading-snug ${
                m.me
                  ? "bg-[#00b4d8] text-white rounded-2xl rounded-br-sm"
                  : "bg-white text-[#0c1a20] rounded-2xl rounded-bl-sm border border-black/5"
              }`}
              style={!m.me ? { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" } : undefined}
            >
              {!m.me && <div className="text-[10px] font-semibold text-[#00b4d8] mb-0.5">{rider.name}</div>}
              <div>{m.text}</div>
              <div className={`mt-1 flex items-center gap-1 text-[9px] ${m.me ? "text-white/75 justify-end" : "text-[#0c1a20]/40 justify-end"}`}>
                {m.time}
                {m.me && <CheckCheck className="h-3 w-3" />}
              </div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-end gap-1.5 justify-start">
            <div className="grid h-6 w-6 place-items-center rounded-full text-white text-[10px] font-bold shrink-0 mb-0.5"
              style={{ background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)" }}>
              {rider.name.charAt(0)}
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm border border-black/5 px-3.5 py-2.5"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0c1a20]/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-[#0c1a20]/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-[#0c1a20]/30 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra de input branca */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-t border-black/8 shrink-0" style={full ? { paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" } : undefined}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Digite uma mensagem…"
          className="flex-1 bg-[#f2f0ea] rounded-full px-4 py-2 text-[13px] text-[#0c1a20] placeholder:text-[#0c1a20]/40 outline-none border border-black/5 focus:border-[#00b4d8]/40 transition"
        />
        <button
          onClick={send}
          aria-label="Enviar"
          disabled={!text.trim()}
          className="grid h-9 w-9 place-items-center rounded-full bg-[#00b4d8] text-white hover:brightness-110 transition disabled:opacity-40 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </>
  );

  if (full) return <div className="flex h-full flex-col bg-white">{inner}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ type: "spring", damping: 26, stiffness: 300 }}
      className={`overflow-hidden bg-white ${className}`}
      style={{ borderRadius: "18px", boxShadow: "0 25px 70px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)" }}
    >
      {inner}
    </motion.div>
  );
}
