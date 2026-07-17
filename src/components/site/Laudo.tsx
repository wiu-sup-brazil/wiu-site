import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import {
  Video, UploadCloud, SearchCheck, BadgeCheck,
  Check, ShieldCheck, X, RefreshCw, Truck, Users, Award, Calendar,
} from "lucide-react";

const WIU_WHATSAPP = "5585999999999";

/* ─── Ilustração: câmera gravando o kite ─── */
function IlluVideo() {
  return (
    <svg viewBox="0 0 200 140" fill="none" aria-hidden className="w-full h-full">
      {/* Smartphone */}
      <rect x="58" y="20" width="64" height="100" rx="8" fill="var(--paper)" opacity="0.08" stroke="var(--paper)" strokeWidth="1.5" strokeOpacity="0.3" />
      <rect x="64" y="32" width="52" height="72" rx="4" fill="var(--accent)" opacity="0.12" />
      {/* Tela gravando */}
      <circle cx="90" cy="56" r="14" fill="var(--accent)" opacity="0.18" />
      <circle cx="90" cy="56" r="8" fill="var(--accent)" opacity="0.55" />
      <circle cx="90" cy="56" r="3.5" fill="var(--paper)" />
      {/* Kite na tela */}
      <path d="M74 80 Q90 70 106 80 Q99 84 90 85 Q81 84 74 80 Z" fill="var(--accent)" opacity="0.6" />
      <line x1="90" y1="85" x2="90" y2="96" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
      <circle cx="90" cy="98" r="2" fill="var(--paper)" opacity="0.4" />
      {/* Botão REC */}
      <rect x="78" y="108" width="24" height="6" rx="3" fill="#ff4444" opacity="0.7" />
      <circle cx="84" cy="111" r="1.5" fill="var(--paper)" opacity="0.9" />
      <text x="88" y="114" fontSize="4" fill="var(--paper)" opacity="0.85" fontWeight="bold">REC</text>
      {/* Linhas de vídeo - grid */}
      <line x1="64" y1="56" x2="76" y2="56" stroke="var(--accent)" strokeWidth="0.8" opacity="0.3" />
      <line x1="104" y1="56" x2="116" y2="56" stroke="var(--accent)" strokeWidth="0.8" opacity="0.3" />
      <line x1="90" y1="32" x2="90" y2="44" stroke="var(--accent)" strokeWidth="0.8" opacity="0.3" />
      <line x1="90" y1="68" x2="90" y2="76" stroke="var(--accent)" strokeWidth="0.8" opacity="0.3" />
      {/* Upload seta */}
      <path d="M132 55 L148 55 M148 55 L144 50 M148 55 L144 60" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <rect x="130" y="62" width="22" height="14" rx="3" fill="var(--accent)" opacity="0.15" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" />
      <text x="141" y="72" fontSize="5" fill="var(--paper)" opacity="0.7" textAnchor="middle">WIU</text>
    </svg>
  );
}

/* ─── Ilustração: kite sendo inspecionado na mão ─── */
function IlluSelo() {
  return (
    <svg viewBox="0 0 200 140" fill="none" aria-hidden className="w-full h-full">
      {/* Mesa de inspeção */}
      <rect x="30" y="100" width="140" height="6" rx="2" fill="var(--paper)" opacity="0.12" />
      {/* Kite inflado, visto de cima */}
      <path d="M65 70 Q100 38 135 70 Q118 82 100 84 Q82 82 65 70 Z" fill="var(--accent)" opacity="0.25" stroke="var(--accent)" strokeWidth="1.5" />
      <path d="M77 73 Q100 60 123 73" stroke="var(--paper)" strokeWidth="1" opacity="0.3" strokeDasharray="3 2" />
      <path d="M82 76 Q100 65 118 76" stroke="var(--paper)" strokeWidth="1" opacity="0.2" strokeDasharray="3 2" />
      {/* Costuras marcadas */}
      <path d="M100 84 L100 100" stroke="var(--accent)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="100" cy="102" r="2.5" fill="var(--accent)" opacity="0.6" />
      {/* Lupa de inspeção */}
      <circle cx="138" cy="55" r="16" stroke="var(--paper)" strokeWidth="2" opacity="0.5" fill="var(--paper)" fillOpacity="0.04" />
      <circle cx="138" cy="55" r="10" stroke="var(--accent)" strokeWidth="1.5" opacity="0.6" />
      <line x1="149" y1="66" x2="158" y2="75" stroke="var(--paper)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Pontos de inspeção marcados */}
      <circle cx="90" cy="68" r="2" fill="#22c55e" opacity="0.8" />
      <circle cx="100" cy="64" r="2" fill="#22c55e" opacity="0.8" />
      <circle cx="110" cy="68" r="2" fill="#22c55e" opacity="0.8" />
      <circle cx="80" cy="74" r="2" fill="#22c55e" opacity="0.6" />
      <circle cx="120" cy="74" r="2" fill="#22c55e" opacity="0.6" />
      {/* Mão de especialista */}
      <path d="M55 88 Q52 82 55 76 L58 73 Q60 71 63 72 L65 74 Q64 70 67 69 Q70 68 71 71 L72 73 Q72 69 74 68 Q77 67 78 71 L79 82 L77 90 Z" fill="var(--paper)" opacity="0.2" stroke="var(--paper)" strokeWidth="1" strokeOpacity="0.3" />
      {/* Selo */}
      <circle cx="38" cy="48" r="14" fill="var(--accent)" opacity="0.2" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx="38" cy="48" r="10" fill="var(--accent)" opacity="0.15" />
      <path d="M32 48 L36 52 L45 43" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="38" y="66" fontSize="4.5" fill="var(--accent)" opacity="0.8" textAnchor="middle" fontWeight="bold">EXCELENTE</text>
    </svg>
  );
}

/* ─── Selos visuais ─── */
function SeloQualidade({ nota }: { nota: "EXCELENTE" | "BOM" | "REGULAR" }) {
  const cores: Record<string, string> = {
    EXCELENTE: "#22c55e",
    BOM: "var(--accent)",
    REGULAR: "#f97316",
  };
  return (
    <div
      className="inline-flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 text-center"
      style={{ borderColor: cores[nota], background: `${cores[nota]}18` }}
    >
      <Check className="h-4 w-4 mb-0.5" style={{ color: cores[nota] }} />
      <span className="text-[7px] uppercase tracking-[0.15em] font-bold leading-tight" style={{ color: cores[nota] }}>{nota}</span>
    </div>
  );
}

type LaudoType = {
  key: "video" | "selo";
  badge: string;
  titulo: string;
  subtitulo: string;
  resumo: string;
  icon: typeof Video;
  passos: { icon: typeof Video; t: string; d: string }[];
  detalhes: string[];
};

const TIPOS: LaudoType[] = [
  {
    key: "video",
    badge: "Padrão · Obrigatório",
    titulo: "Laudo por Vídeo",
    subtitulo: "Todo equipamento",
    resumo: "Reavaliado todo mês, por vídeo.",
    icon: Video,
    passos: [
      { icon: Video,        t: "Grave",   d: "Cada parte, de perto." },
      { icon: UploadCloud,  t: "Envie",   d: "Upload direto." },
      { icon: SearchCheck,  t: "Avalie",  d: "Análise técnica." },
      { icon: RefreshCw,    t: "Renove",  d: "Novo vídeo todo mês." },
    ],
    detalhes: [
      "Obrigatório pra todo anúncio.",
      "Renovado todo mês, sempre atual.",
      "100% remoto, sem burocracia.",
    ],
  },
  {
    key: "selo",
    badge: "Premium · Presencial",
    titulo: "Laudo com Selo",
    subtitulo: "Inspeção na base",
    resumo: "Avaliado na mão, por profissionais.",
    icon: Award,
    passos: [
      { icon: Truck,        t: "Envie",      d: "Leve até a base." },
      { icon: Users,        t: "Avalie",     d: "Time experiente, na mão." },
      { icon: SearchCheck,  t: "Inspecione", d: "Estrutura e resistência." },
      { icon: Award,        t: "Selo",       d: "Data e nota do dia." },
    ],
    detalhes: [
      "Avaliado à mão por instrutores.",
      "Mais completo: testa estrutura física.",
      "Selo datado, não recorrente.",
    ],
  },
];

function TipoModal({ tipo, onClose }: { tipo: LaudoType; onClose: () => void }) {
  const isPremium = tipo.key === "selo";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center"
    >
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%", opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative z-10 w-full max-w-xl max-h-[92vh] overflow-y-auto bg-ink text-paper border md:my-8"
        style={{ borderColor: isPremium ? "rgba(250,201,60,0.35)" : "rgba(255,255,255,0.1)" }}
      >
        {isPremium && (
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #f59e0b, #fcd34d, #f59e0b)" }} />
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 h-10 w-10 bg-paper/10 text-paper flex items-center justify-center rounded-full hover:bg-paper/20 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-7 md:p-10">
          {/* Ilustração do processo */}
          <div
            className="w-full h-40 rounded-sm mb-7"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {tipo.key === "video" ? <IlluVideo /> : <IlluSelo />}
          </div>

          <div className="flex items-center gap-3 justify-between">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5"
              style={isPremium
                ? { border: "1px solid rgba(250,201,60,0.6)", color: "#fcd34d" }
                : { border: "1px solid var(--accent)", color: "var(--accent)" }}
            >
              <tipo.icon className="h-3.5 w-3.5" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold">{tipo.badge}</span>
            </div>
            {isPremium && (
              <div className="flex gap-2">
                <SeloQualidade nota="EXCELENTE" />
              </div>
            )}
          </div>

          <h3 className="display text-3xl md:text-4xl mt-5">{tipo.titulo}</h3>
          <p className="text-paper/60 text-sm uppercase tracking-[0.18em] mt-1">{tipo.subtitulo}</p>

          {/* Passos com linha conectora */}
          <div className="mt-8 relative pl-2">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-paper/12" />
            <div className="flex flex-col gap-6">
              {tipo.passos.map((s, i) => (
                <div key={s.t} className="relative flex gap-4">
                  <div
                    className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
                    style={isPremium
                      ? { border: "1px solid rgba(250,201,60,0.4)", background: "rgba(250,201,60,0.1)", color: "#fcd34d" }
                      : { border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,180,216,0.1)", color: "var(--accent)" }}
                  >
                    <s.icon className="h-4 w-4 stroke-[1.4]" />
                  </div>
                  <div className="pt-1">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-paper/40">0{i + 1}</div>
                    <div className="font-semibold mt-0.5">{s.t}</div>
                    <p className="text-[13px] text-paper/55 mt-0.5">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t pt-7" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <ul className="flex flex-col gap-2.5">
              {tipo.detalhes.map((d) => (
                <li key={d} className="flex items-center gap-3 text-[13px] text-paper/70">
                  <Check className="h-3.5 w-3.5 shrink-0" style={{ color: isPremium ? "#fcd34d" : "var(--accent)" }} />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <a
            href={`https://wa.me/${WIU_WHATSAPP}?text=${encodeURIComponent(`Quero solicitar ${tipo.titulo}!`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-full items-center justify-center gap-3 py-4 text-[13px] uppercase tracking-[0.2em] font-bold transition-colors"
            style={isPremium
              ? { background: "#f59e0b", color: "#000" }
              : { background: "var(--accent)", color: "var(--ink)" }}
          >
            Solicitar via WhatsApp <span>→</span>
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Laudo() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallaxBg = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const parallaxCard = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);
  const [selected, setSelected] = useState<LaudoType | null>(null);

  return (
    <div id="laudo" ref={ref} className="bg-ink text-paper py-24 md:py-32 relative overflow-hidden">
      <motion.div aria-hidden style={{ y: parallaxBg }} className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-40" style={{
          background: "radial-gradient(circle at 15% 10%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 45%), radial-gradient(circle at 85% 90%, color-mix(in srgb, #f59e0b 8%, transparent), transparent 50%)",
        }} />
      </motion.div>
      <div className="pointer-events-none absolute inset-6 md:inset-10 border border-paper/15 float-gentle" />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-3 border border-accent px-4 py-2 text-accent">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[12px] uppercase tracking-[0.22em] font-semibold">Diferencial WIU</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="display text-4xl md:text-6xl lg:text-7xl mt-8"
          >
            Saiba exatamente{" "}
            <span className="serif italic normal-case tracking-normal text-accent">o estado</span>{" "}
            do equipamento.
          </motion.h2>
          <p className="mt-5 text-paper/65 text-lg">
            Dois níveis de verificação. Toque pra ver como funciona.
          </p>
        </div>

        {/* Banner compromisso mensal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 border border-accent/30 bg-accent/8 px-6 py-5"
        >
          <div className="flex items-start gap-5">
            <div className="h-10 w-10 shrink-0 rounded-full bg-accent/20 flex items-center justify-center mt-0.5 gust-lift-1">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold">Atualização Mensal Obrigatória</div>
              <p className="text-[14px] text-paper/80 mt-2 leading-relaxed">
                Todo equipamento anunciado aqui recebe novos vídeos e fotos todo mês.
                As imagens anteriores são apagadas e substituídas.{" "}
                <span className="text-paper font-semibold">
                  O que você vê é o estado real do kite naquele mês, não de quando foi anunciado.
                </span>
              </p>
            </div>
            <div className="ml-auto hidden sm:flex gap-1 shrink-0 items-center">
              {["Jan","Fev","Mar","Abr","Mai","Jun"].map((m, i) => (
                <div key={m} className="flex flex-col items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" style={{ opacity: 0.3 + i * 0.14 }} />
                  <span className="text-[8px] text-paper/35 uppercase">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Cards dos dois tipos */}
        <motion.div style={{ y: parallaxCard }} className="mt-10 grid md:grid-cols-2 gap-6">
          {/* Card Padrão (azul) */}
          <motion.button
            onClick={() => setSelected(TIPOS[0])}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="group text-left relative bg-ink border border-paper/12 p-0 card-lift-dark card-lift-dark-hover overflow-hidden"
          >
            {/* Ilustração */}
            <div className="h-48 relative bg-paper/3 border-b border-paper/8">
              <IlluVideo />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(circle at 70% 30%, color-mix(in srgb, var(--accent) 15%, transparent), transparent 60%)" }}
              />
            </div>
            <div className="p-7">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] uppercase tracking-[0.22em] text-paper/40 border border-paper/15 px-2.5 py-1">
                  {TIPOS[0].badge}
                </span>
                <div className="h-9 w-9 rounded-full bg-accent/15 flex items-center justify-center gust-lift-2">
                  <Video className="h-4 w-4 text-accent" />
                </div>
              </div>
              <h3 className="display text-3xl">{TIPOS[0].titulo}</h3>
              <p className="text-paper/45 text-[11px] uppercase tracking-[0.18em] mt-1">{TIPOS[0].subtitulo}</p>
              <p className="mt-3 text-[14px] text-paper/60">{TIPOS[0].resumo}</p>
              <span className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3 bg-paper/8 group-hover:bg-accent group-hover:text-ink text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors">
                Como funciona <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </motion.button>

          {/* Card Premium (dourado) */}
          <motion.button
            onClick={() => setSelected(TIPOS[1])}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="group text-left relative overflow-hidden card-lift-dark card-lift-dark-hover"
            style={{ background: "linear-gradient(145deg, #1a1508 0%, #0d0d0d 60%)", border: "1px solid rgba(245,158,11,0.3)" }}
          >
            {/* Faixa dourada topo */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, transparent, #f59e0b, #fcd34d, #f59e0b, transparent)" }} />
            {/* Ilustração */}
            <div className="h-48 relative border-b" style={{ borderColor: "rgba(245,158,11,0.15)", background: "rgba(245,158,11,0.04)" }}>
              <IlluSelo />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(circle at 30% 50%, rgba(245,158,11,0.12), transparent 60%)" }}
              />
            </div>
            <div className="p-7">
              <div className="flex items-center justify-between mb-5">
                <span
                  className="text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 font-semibold"
                  style={{ border: "1px solid rgba(245,158,11,0.5)", color: "#fcd34d" }}
                >
                  {TIPOS[1].badge}
                </span>
                <div className="flex gap-1.5">
                  <SeloQualidade nota="EXCELENTE" />
                </div>
              </div>
              <h3 className="display text-3xl" style={{ color: "#fef3c7" }}>{TIPOS[1].titulo}</h3>
              <p className="text-[11px] uppercase tracking-[0.18em] mt-1" style={{ color: "rgba(245,158,11,0.55)" }}>{TIPOS[1].subtitulo}</p>
              <p className="mt-3 text-[14px]" style={{ color: "rgba(254,243,199,0.55)" }}>{TIPOS[1].resumo}</p>
              <span
                className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3 text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors"
                style={{ background: "rgba(245,158,11,0.12)", color: "#fcd34d", border: "0" }}
              >
                Como funciona <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </motion.button>
        </motion.div>

        {/* Rodapé de prova social */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 text-paper/45 text-sm border-t pt-8"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <span className="inline-flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-accent" /> Laudo Nº 00482 · Cabrinha Switchblade 10m
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-accent" /> 8 pontos sensíveis avaliados
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" /> 3 especialistas
          </span>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && <TipoModal tipo={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
