import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { X, Send, Wind, MapPin } from "lucide-react";

/**
 * Mapa da comunidade — estilo Windy, litoral do Ceará.
 *
 * DEMO_RIDERS é dado de demonstração (front only). Quando o backend de
 * presença existir (Supabase Realtime), troque esse array por um
 * subscribe no canal `presence:riders` e mantenha o mesmo shape.
 * O chat também é local/efêmero: fechou, morreu — como combinado.
 */

type Rider = {
  id: string;
  name: string;
  spot: string;
  x: number; // % no mapa
  y: number;
  level: string;
};

const DEMO_RIDERS: Rider[] = [
  { id: "r1", name: "Léo", spot: "Cumbuco", x: 63, y: 62, level: "Avançado" },
  { id: "r2", name: "Marina", spot: "Cumbuco", x: 66, y: 58, level: "Intermediário" },
  { id: "r3", name: "Pedrão", spot: "Taíba", x: 55, y: 52, level: "Avançado" },
  { id: "r4", name: "Ana", spot: "Paracuru", x: 47, y: 44, level: "Iniciante" },
  { id: "r5", name: "Thibaut", spot: "Preá", x: 22, y: 26, level: "Avançado" },
  { id: "r6", name: "Sofia", spot: "Jericoacoara", x: 14, y: 20, level: "Intermediário" },
  { id: "r7", name: "Rafa", spot: "Icaraí", x: 68, y: 66, level: "Intermediário" },
  { id: "r8", name: "Duda", spot: "Flecheiras", x: 38, y: 36, level: "Avançado" },
];

const SPOTS = [
  { name: "Fortaleza", x: 78, y: 74 },
  { name: "Icaraí", x: 68, y: 67 },
  { name: "Cumbuco", x: 63, y: 61 },
  { name: "Taíba", x: 54, y: 51 },
  { name: "Paracuru", x: 46, y: 43 },
  { name: "Flecheiras", x: 37, y: 35 },
  { name: "Preá", x: 21, y: 25 },
  { name: "Jericoacoara", x: 13, y: 19 },
];

/** Partículas de vento (traços que atravessam o mar, estilo Windy). */
function WindParticles() {
  const lines = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        y: 4 + (i * 67) % 88,
        delay: (i * 0.53) % 6,
        dur: 5 + (i % 4) * 1.6,
        len: 30 + (i % 3) * 22,
        op: 0.12 + (i % 3) * 0.08,
      })),
    []
  );
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      {lines.map((l, i) => (
        <span
          key={i}
          className="absolute h-px rounded-full"
          style={{
            top: `${l.y}%`,
            left: "-15%",
            width: `${l.len}px`,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
            opacity: l.op,
            animation: `wiu-wind ${l.dur}s linear ${l.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes wiu-wind {
          from { transform: translateX(0); }
          to { transform: translateX(130vw); }
        }
        @keyframes wiu-ping {
          0% { transform: scale(1); opacity: 0.7; }
          80%, 100% { transform: scale(2.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function ComunidadeMapa() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [open, setOpen] = useState<Rider | null>(null);

  return (
    <section
      id="comunidade"
      ref={ref}
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0a0a0a 0%, #07222e 22%, #063246 55%, #07222e 88%, #0a0a0a 100%)",
      }}
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-32">
        {/* Cabeçalho do bloco */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
            <span className="h-px w-10 bg-[#00b4d8]" /> Conheça a WIU
          </div>
          <h2 className="mt-6 display text-5xl md:text-7xl text-white leading-[0.92]">
            A comunidade está
            <br />
            <span className="serif italic normal-case tracking-normal text-[#3fd0f0]">no vento agora.</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl text-white/60 leading-relaxed max-w-xl">
            Riders online em cada spot do litoral. Clica num ponto verde, puxa papo,
            pergunta como está o vento aí — e marca de velejar junto.
          </p>
        </motion.div>

        {/* Mapa */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative mt-14 rounded-2xl overflow-hidden border border-white/10"
          style={{ boxShadow: "0 40px 120px -20px rgba(0,180,216,0.25), 0 20px 60px -30px rgba(0,0,0,0.8)" }}
        >
          <div className="relative aspect-[16/10] md:aspect-[21/10]">
            {/* Mar */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(215deg, #0b3a52 0%, #0d4a68 35%, #0f5c80 65%, #11689a 100%)",
              }}
            />
            <WindParticles />

            {/* Terra: litoral do Ceará estilizado (costa diagonal NW) */}
            <svg
              viewBox="0 0 100 62"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <defs>
                <linearGradient id="terra" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#123c33" />
                  <stop offset="100%" stopColor="#0d2b25" />
                </linearGradient>
              </defs>
              {/* faixa de areia */}
              <path
                d="M0 32 Q 18 24 34 30 Q 52 37 66 46 Q 80 54 100 58 L 100 62 L 0 62 Z"
                fill="#c8b48a"
                opacity="0.9"
              />
              {/* terra */}
              <path
                d="M0 35 Q 18 27 34 33 Q 52 40 66 49 Q 80 57 100 61 L 100 62 L 0 62 Z"
                fill="url(#terra)"
              />
            </svg>

            {/* Nomes dos spots */}
            {SPOTS.map((s) => (
              <div
                key={s.name}
                className="absolute -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
                style={{ left: `${s.x}%`, top: `${s.y + 8}%` }}
              >
                <MapPin className="h-3 w-3 text-white/40" />
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-white/55 whitespace-nowrap">
                  {s.name}
                </span>
              </div>
            ))}

            {/* Riders online */}
            {DEMO_RIDERS.map((r, i) => (
              <motion.button
                key={r.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.6 + i * 0.12, type: "spring", stiffness: 300, damping: 18 }}
                onClick={() => setOpen(r)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${r.x}%`, top: `${r.y}%` }}
                aria-label={`Falar com ${r.name} em ${r.spot}`}
              >
                <span
                  className="absolute inset-0 rounded-full bg-[#39e58c]"
                  style={{ animation: "wiu-ping 2.4s cubic-bezier(0,0,0.2,1) infinite", animationDelay: `${i * 0.35}s` }}
                />
                <span className="relative block h-3.5 w-3.5 md:h-4 md:w-4 rounded-full bg-[#39e58c] ring-2 ring-[#0a2a1c] shadow-[0_0_14px_rgba(57,229,140,0.8)] transition-transform group-hover:scale-125" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap rounded-full bg-black/80 backdrop-blur px-2.5 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {r.name} · {r.spot}
                </span>
              </motion.button>
            ))}

            {/* Contador ao vivo */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2.5 rounded-full bg-black/50 backdrop-blur border border-white/10 px-4 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#39e58c] opacity-75" style={{ animation: "wiu-ping 1.8s infinite" }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#39e58c]" />
              </span>
              <span className="text-xs md:text-sm text-white font-medium tabular-nums">
                {DEMO_RIDERS.length} riders no vento agora
              </span>
            </div>

            {/* Vento atual */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 rounded-full bg-black/50 backdrop-blur border border-white/10 px-4 py-2">
              <Wind className="h-3.5 w-3.5 text-[#3fd0f0]" />
              <span className="text-xs md:text-sm text-white tabular-nums">22 nós · E</span>
            </div>
          </div>

          {/* Chat efêmero */}
          <AnimatePresence>
            {open && <RiderChat rider={open} onClose={() => setOpen(null)} />}
          </AnimatePresence>
        </motion.div>

        <p className="mt-5 text-center text-xs text-white/35">
          Pontos verdes = riders conectados agora. A conversa é ao vivo e some quando você fecha.
        </p>
      </div>
    </section>
  );
}

function RiderChat({ rider, onClose }: { rider: Rider; onClose: () => void }) {
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([]);
  const [text, setText] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [msgs]);

  function send() {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { me: true, text: t }]);
    setText("");
    // DEMO: resposta simulada. Trocar por canal Realtime quando o backend existir.
    setTimeout(() => {
      setMsgs((m) => [...m, { me: false, text: `Opa! Aqui em ${rider.spot} o vento tá firme. Cola aqui! 🤙` }]);
    }, 1200);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ type: "spring", damping: 26, stiffness: 300 }}
      className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100%-2rem)] max-w-xs rounded-2xl overflow-hidden border border-white/15 bg-[#0c1a20]/95 backdrop-blur-xl shadow-2xl"
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <div className="relative">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#134] text-sm font-semibold text-white">
            {rider.name.charAt(0)}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#39e58c] ring-2 ring-[#0c1a20]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white truncate">{rider.name}</div>
          <div className="text-[11px] text-white/50">{rider.spot} · {rider.level}</div>
        </div>
        <button onClick={onClose} aria-label="Fechar conversa" className="rounded-full p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={boxRef} className="h-44 overflow-y-auto px-4 py-3 space-y-2">
        {msgs.length === 0 && (
          <p className="text-xs text-white/40 pt-2">
            Diz um "e aí, como tá o vento em {rider.spot}?" — a conversa some quando fechar.
          </p>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
            <span
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                m.me ? "bg-[#00b4d8] text-white rounded-br-sm" : "bg-white/10 text-white/90 rounded-bl-sm"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Escreve aí…"
          className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/35 outline-none px-1"
        />
        <button onClick={send} aria-label="Enviar" className="grid h-8 w-8 place-items-center rounded-full bg-[#00b4d8] text-white hover:brightness-110 transition disabled:opacity-40" disabled={!text.trim()}>
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
