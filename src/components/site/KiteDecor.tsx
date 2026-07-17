import { motion, useReducedMotion } from "motion/react";

/**
 * Decorative, well-crafted SVG kitesurf motifs.
 * These are clean geometric shapes (a real kite arc, wind streaks, wave lines),
 * NOT hand-drawn figures. Used as floating accents to evoke wind + kite.
 */

export function KiteShape({ className = "", color = "var(--accent)" }: { className?: string; color?: string }) {
  // A curved delta/LEI kite arc with bridle lines converging.
  return (
    <svg viewBox="0 0 240 200" className={className} fill="none" aria-hidden>
      {/* Canopy arc */}
      <path
        d="M20 70 Q120 8 220 70 Q170 92 120 96 Q70 92 20 70 Z"
        fill={color}
        opacity="0.92"
      />
      {/* Cell seams */}
      <g stroke="var(--paper)" strokeWidth="1.5" opacity="0.5">
        <path d="M60 78 Q62 86 64 92" />
        <path d="M95 88 Q96 92 97 95" />
        <path d="M145 88 Q144 92 143 95" />
        <path d="M180 78 Q178 86 176 92" />
        <path d="M120 90 L120 96" />
      </g>
      {/* Bridle / power lines converging to a point */}
      <g stroke={color} strokeWidth="1.4" opacity="0.7">
        <line x1="40" y1="80" x2="120" y2="185" />
        <line x1="90" y1="92" x2="120" y2="185" />
        <line x1="150" y1="92" x2="120" y2="185" />
        <line x1="200" y1="80" x2="120" y2="185" />
      </g>
      {/* Control bar */}
      <rect x="96" y="184" width="48" height="5" rx="2.5" fill={color} />
    </svg>
  );
}

export function WindStreaks({ className = "", color = "var(--ink)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 200 80" className={className} fill="none" aria-hidden>
      <g stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5">
        <path d="M10 20 q40 -10 80 0 t60 -2" />
        <path d="M4 40 q50 -12 100 0 t70 -2" />
        <path d="M16 60 q40 -8 80 0 t54 -2" />
      </g>
    </svg>
  );
}

export function WaveLines({ className = "", color = "var(--sky)" }: { className?: string; color?: string }) {
  const wave = (y: number, amp: number, op: number) =>
    `M0 ${y} q150 -${amp} 300 0 t300 0 t300 0 t300 0 t300 0 t300 0 t300 0 t300 0`;
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="flex w-[200%] wave-flow">
        <svg viewBox="0 0 2400 120" preserveAspectRatio="none" className="w-1/2 h-full shrink-0" fill="none" aria-hidden>
          <g stroke={color} strokeWidth="2">
            <path d={wave(40, 28, 0.55)} opacity="0.55" />
            <path d={wave(70, 24, 0.35)} opacity="0.35" />
            <path d={wave(100, 20, 0.2)} opacity="0.2" />
          </g>
        </svg>
        <svg viewBox="0 0 2400 120" preserveAspectRatio="none" className="w-1/2 h-full shrink-0" fill="none" aria-hidden>
          <g stroke={color} strokeWidth="2">
            <path d={wave(40, 28, 0.55)} opacity="0.55" />
            <path d={wave(70, 24, 0.35)} opacity="0.35" />
            <path d={wave(100, 20, 0.2)} opacity="0.2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/** Sol nascente: semicírculo com raios, no estilo da identidade visual da marca. */
export function SunShape({ className = "", color = "var(--ink)" }: { className?: string; color?: string }) {
  const rays = Array.from({ length: 13 }, (_, i) => {
    const a = Math.PI * (0.06 + (i / 12) * 0.88);
    const r1 = 58;
    const r2 = i % 3 === 0 ? 76 : 70;
    const cx = 100, cy = 105;
    const x1 = cx + r1 * Math.cos(a);
    const y1 = cy - r1 * Math.sin(a);
    const x2 = cx + r2 * Math.cos(a);
    const y2 = cy - r2 * Math.sin(a);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
  });
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden>
      <path d="M30 105 A70 70 0 0 1 170 105" stroke={color} strokeWidth="20" fill="none" />
      <g stroke={color} strokeWidth="2" strokeLinecap="round">
        {rays}
      </g>
    </svg>
  );
}

/** Bando de pássaros em V, voando. */
export function BirdsShape({ className = "", color = "var(--ink)" }: { className?: string; color?: string }) {
  const Bird = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
    <path
      d={`M ${x - 8 * s} ${y} Q ${x - 3.5 * s} ${y - 6 * s} ${x} ${y} Q ${x + 3.5 * s} ${y - 6 * s} ${x + 8 * s} ${y}`}
      stroke={color}
      strokeWidth={2 * s}
      strokeLinecap="round"
      fill="none"
    />
  );
  return (
    <svg viewBox="0 0 200 80" className={className} fill="none" aria-hidden>
      <Bird x={150} y={20} s={0.8} />
      <Bird x={130} y={30} s={0.95} />
      <Bird x={108} y={38} s={1.05} />
      <Bird x={84} y={44} s={1} />
      <Bird x={60} y={48} s={0.85} />
    </svg>
  );
}

/** Prancha de kitesurf, vista de cima, com leve curvatura e quilhas. */
export function BoardShape({ className = "", color = "var(--ink)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 80 220" className={className} fill="none" aria-hidden>
      <path
        d="M40 4 C 62 4 70 36 70 70 L70 150 C70 184 62 216 40 216 C18 216 10 184 10 150 L10 70 C10 36 18 4 40 4 Z"
        fill={color}
        opacity="0.92"
      />
      <line x1="40" y1="20" x2="40" y2="200" stroke="var(--paper)" strokeWidth="1.5" opacity="0.4" />
      <ellipse cx="40" cy="55" rx="14" ry="22" stroke="var(--paper)" strokeWidth="1.5" opacity="0.35" fill="none" />
    </svg>
  );
}

/** Silhueta de rider em ação, joelhos flexionados, segurando a barra. */
export function RiderShape({ className = "", color = "var(--ink)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 140 200" className={className} fill="none" aria-hidden>
      <g stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* tronco inclinado */}
        <path d="M70 40 L58 95" />
        {/* cabeça */}
        <circle cx="74" cy="26" r="11" fill={color} stroke="none" />
        {/* braços até a barra de controle */}
        <path d="M62 55 L40 70" />
        <path d="M62 55 L88 64" />
        <line x1="34" y1="68" x2="94" y2="62" strokeWidth="4" />
        {/* linhas de força até a pipa (fora do quadro, para cima) */}
        <path d="M64 60 L20 -10" strokeWidth="2" opacity="0.55" />
        <path d="M64 60 L120 -16" strokeWidth="2" opacity="0.55" />
        {/* pernas flexionadas em posição de carving */}
        <path d="M58 95 L36 130 L24 175" />
        <path d="M58 95 L82 122 L100 168" />
      </g>
      {/* prancha sob os pés */}
      <ellipse cx="62" cy="178" rx="46" ry="9" fill={color} opacity="0.92" />
    </svg>
  );
}

/** Ondas estilizadas animadas, 3 camadas fluindo em velocidades diferentes. */
export function SeaWaves({ className = "", color = "var(--sky)" }: { className?: string; color?: string }) {
  const wave1 = "M0 60 q100 -36 200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0";
  const wave2 = "M0 100 q100 -30 200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0";
  const wave3 = "M0 140 q100 -24 200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0";
  return (
    <div className={`overflow-hidden relative ${className}`}>
      <div className="absolute inset-0 flex w-[200%] wave-flow">
        {[0, 1].map((n) => (
          <svg key={n} viewBox="0 0 2400 200" preserveAspectRatio="none" className="w-1/2 h-full shrink-0" fill="none" aria-hidden>
            <path d={wave1} stroke={color} strokeWidth="3" opacity="0.5" />
          </svg>
        ))}
      </div>
      <div className="absolute inset-0 flex w-[200%] wave-flow-slow">
        {[0, 1].map((n) => (
          <svg key={n} viewBox="0 0 2400 200" preserveAspectRatio="none" className="w-1/2 h-full shrink-0" fill="none" aria-hidden>
            <path d={wave2} stroke={color} strokeWidth="3" opacity="0.32" />
          </svg>
        ))}
      </div>
      <div className="absolute inset-0 flex w-[200%] wave-flow-reverse">
        {[0, 1].map((n) => (
          <svg key={n} viewBox="0 0 2400 200" preserveAspectRatio="none" className="w-1/2 h-full shrink-0" fill="none" aria-hidden>
            <path d={wave3} stroke={color} strokeWidth="3" opacity="0.18" />
          </svg>
        ))}
      </div>
    </div>
  );
}

/** Floating cluster of kite motifs, positioned absolutely by parent. */
export function FloatingKites() {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Big kite, top right */}
      <motion.div
        className="absolute right-[6%] top-[12%] w-28 md:w-44 float-slow"
        initial={reduce ? false : { opacity: 0, y: 30, rotate: -8 }}
        animate={reduce ? {} : { opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1.1, delay: 0.3 }}
      >
        <div className="sway">
          <KiteShape color="var(--accent)" />
        </div>
      </motion.div>

      {/* Small kite, mid left */}
      <motion.div
        className="absolute left-[4%] top-[34%] w-16 md:w-24 float-med"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={reduce ? {} : { opacity: 0.85, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <KiteShape color="var(--accent-2)" />
      </motion.div>

      {/* Wind streaks */}
      <div className="absolute left-[18%] top-[24%] w-32 md:w-44 wind-drift" style={{ animationDelay: "0.5s" }}>
        <WindStreaks />
      </div>
      <div className="absolute right-[24%] top-[58%] w-28 md:w-40 wind-drift" style={{ animationDelay: "2.4s" }}>
        <WindStreaks />
      </div>
    </div>
  );
}
