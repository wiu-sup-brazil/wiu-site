import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { SunShape, BirdsShape, KiteShape, WindStreaks, SeaWaves } from "./KiteDecor";
import { X, Send, ShoppingBag, Compass, Tag, Users } from "lucide-react";

const WHATSAPP = "5585998477678";

type ChatMsg = { from: "ia" | "user"; text: string };

const IA_OPTIONS = [
  { icon: ShoppingBag, label: "Comprar equipamento", href: "#marketplace" },
  { icon: Compass, label: "Aula de kite", href: "#plataforma" },
  { icon: Tag, label: "Vender o meu", href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Oi! Quero vender meu equipamento na WIU.")}` },
  { icon: Users, label: "Conhecer a comunidade", href: "#comunidade" },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const sceneOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const sceneStyle = reduce ? undefined : { opacity: sceneOpacity };

  /* Parallax da pipa: conforme rola, desce planando pra próxima seção */
  const kiteY = useTransform(scrollYProgress, [0, 1], ["0vh", "118vh"]);
  const kiteX = useTransform(scrollYProgress, [0, 1], ["0vw", "-30vw"]);
  const kiteXMobile = useTransform(scrollYProgress, [0, 1], ["0vw", "8vw"]);
  const kiteRotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 8, -6]);

  /* Chat IA: acompanha o scroll e some se ninguém interagir */
  const chatY = useTransform(scrollYProgress, [0, 0.6], ["0vh", "50vh"]);
  const chatScrollOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const interactedRef = useRef(false);
  const [pointerNone, setPointerNone] = useState(false);
  const [chatClosed, setChatClosed] = useState(false);
  const [chatMobileOpen, setChatMobileOpen] = useState(false);

  const chatOpacity = useTransform(chatScrollOpacity, (v) => (interactedRef.current ? 1 : v));

  useMotionValueEvent(chatOpacity, "change", (v) => {
    setPointerNone(v < 0.05);
  });

  return (
    <section ref={ref} id="top" className="relative min-h-[100vh] overflow-x-clip bg-paper">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--accent) 5%, var(--paper)) 0%, var(--paper) 60%, color-mix(in srgb, var(--accent) 4%, var(--paper)) 100%)",
        }}
      />

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-20 md:h-28 opacity-70"
        style={{ color: "var(--sky)" }}
      >
        <SeaWaves color="currentColor" className="h-full w-full" />
      </div>

      {/* Pipa mobile */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute z-30 right-[20%] bottom-[12%] w-24 md:hidden"
        initial={{ y: "-55vh", x: "10vw", rotate: -30, opacity: 0 }}
        animate={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 2.4, delay: 0.3, ease: [0.15, 0.8, 0.2, 1] }}
      >
        <motion.div style={reduce ? undefined : { y: kiteY, x: kiteXMobile, rotate: kiteRotate }}>
          <motion.div
            animate={reduce ? undefined : { rotate: [-3, 3, -3], y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2.8 }}
            style={{ transformOrigin: "top center" }}
          >
            <KiteShape color="var(--accent)" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Pipa desktop */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute z-30 hidden md:block md:right-[3%] md:top-[16%] md:w-32 lg:w-36"
        initial={{ y: "-55vh", x: "10vw", rotate: -30, opacity: 0 }}
        animate={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 2.4, delay: 0.3, ease: [0.15, 0.8, 0.2, 1] }}
      >
        <motion.div style={reduce ? undefined : { y: kiteY, x: kiteX, rotate: kiteRotate }}>
          <motion.div
            animate={reduce ? undefined : { rotate: [-3, 3, -3], y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2.8 }}
            style={{ transformOrigin: "top center" }}
          >
            <KiteShape color="var(--accent)" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Sol/pássaros/vento — só desktop */}
      <motion.div aria-hidden style={sceneStyle} className="hidden md:block pointer-events-none absolute inset-0">
        <motion.div
          className="absolute right-[6%] top-[6%] w-24 lg:w-28 text-ink/80"
          animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <SunShape color="currentColor" />
        </motion.div>

        <motion.div
          className="absolute right-[22%] top-[6%] w-24 lg:w-28 text-ink/55"
          animate={reduce ? undefined : { x: [0, 14, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <BirdsShape color="currentColor" />
        </motion.div>

        <div
          className="absolute right-[16%] top-[30%] w-16 lg:w-20 wind-drift text-accent/50"
          style={{ animationDelay: "1s" }}
        >
          <WindStreaks color="currentColor" />
        </div>
      </motion.div>

      {/* CHAT IA — DESKTOP: mais centralizado (não no canto) */}
      <AnimatePresence>
        {!chatClosed && (
          <motion.div
            className="hidden md:block absolute z-40 md:right-[22%] md:top-[40%] md:w-[340px] lg:w-[360px]"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ delay: 2.8, duration: 0.8, ease: [0.15, 0.8, 0.2, 1] }}
          >
            <motion.div
              style={reduce ? undefined : { y: chatY, opacity: chatOpacity, pointerEvents: pointerNone ? "none" : "auto" }}
            >
              <IAChat
                onInteract={() => { interactedRef.current = true; }}
                onClose={() => setChatClosed(true)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT IA — MOBILE: FAB flutuante com bolha "Fale com a WIU" */}
      <AnimatePresence>
        {!chatClosed && !chatMobileOpen && (
          <motion.div
            className="md:hidden fixed bottom-5 right-5 z-40"
            style={reduce ? undefined : { y: chatY, opacity: chatOpacity, pointerEvents: pointerNone ? "none" : "auto" }}
          >
            <motion.button
              onClick={() => { interactedRef.current = true; setChatMobileOpen(true); }}
              className="relative block"
              aria-label="Falar com a atendente WIU"
              initial={{ scale: 0, y: 80, opacity: 0 }}
              animate={reduce ? { scale: 1, y: 0, opacity: 1 } : { scale: 1, y: [0, -8, 0], opacity: 1 }}
              exit={{ scale: 0, opacity: 0, y: 30 }}
              transition={{
                scale: { delay: 2.5, type: "spring", stiffness: 260, damping: 22 },
                opacity: { delay: 2.5, duration: 0.5 },
                y: reduce ? { delay: 2.5 } : { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 3 },
              }}
            >
              {/* Bolha "Fale com a WIU" ao lado */}
              <motion.span
                className="absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap bg-white rounded-full px-3.5 py-2 text-[12px] font-semibold text-ink"
                style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.2, duration: 0.5 }}
              >
                Fale com a WIU 👋
                <span
                  className="absolute -right-1.5 top-1/2 -translate-y-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid white",
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                  }}
                />
              </motion.span>

              {/* Botão redondo com logo W */}
              <div
                className="relative h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)",
                  boxShadow: "0 8px 24px rgba(0, 180, 216, 0.5), 0 0 0 4px rgba(255,255,255,0.95)",
                }}
              >
                W
                {/* Ping verde */}
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#39e58c] ring-2 ring-white flex items-center justify-center">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39e58c] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                </span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM SHEET MOBILE do chat IA */}
      <AnimatePresence>
        {chatMobileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setChatMobileOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="relative bg-white rounded-t-3xl overflow-hidden h-[85vh] flex flex-col"
              style={{ boxShadow: "0 -20px 60px rgba(0,0,0,0.35)" }}
            >
              {/* Alça de arrasto */}
              <div className="pt-2 pb-1 flex justify-center bg-white shrink-0">
                <span className="h-1 w-10 rounded-full bg-ink/15" />
              </div>
              <IAChat
                onInteract={() => { interactedRef.current = true; }}
                onClose={() => setChatMobileOpen(false)}
                full
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex min-h-[100vh] flex-col">
        <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 md:px-10 pt-24 pb-16">
          <div className="max-w-xl lg:max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="h-px w-10 bg-accent shrink-0" />
              <span className="text-[11px] md:text-[13px] uppercase tracking-[0.22em] font-semibold text-ink/70">
                A maior comunidade de kitesurf do Brasil
              </span>
            </motion.div>

            <h1 className="display text-ink text-[14vw] sm:text-[11vw] md:text-[7vw] lg:text-[6.4vw] leading-[0.9]">
              {["Conecte.", "Navegue."].map((w, i) => (
                <span key={w} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.9, delay: 0.25 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75 }}
              className="mt-6 text-lg md:text-2xl text-ink/65 leading-relaxed"
            >
              Compre e venda equipamentos com segurança.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mt-9 flex flex-wrap items-center gap-3 md:gap-4"
            >
              <a
                href="#plataforma"
                className="group inline-flex items-center gap-3 bg-accent text-paper px-7 md:px-9 py-4 md:py-5 text-[13px] uppercase tracking-[0.2em] font-semibold hover:bg-ink transition-colors shadow-lg shadow-accent/20"
              >
                Comprar
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="#vender"
                className="group inline-flex items-center gap-3 border border-ink/25 text-ink px-7 md:px-9 py-4 md:py-5 text-[13px] uppercase tracking-[0.2em] font-semibold hover:bg-ink hover:text-paper transition-colors"
              >
                Vender
              </a>
              <a
                href="#comunidade"
                className="group inline-flex items-center gap-2.5 px-2 py-4 md:py-5 text-[13px] uppercase tracking-[0.2em] font-semibold text-ink/70 hover:text-accent transition-colors"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39e58c] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39e58c]" />
                </span>
                Conhecer a WIU
                <span className="inline-block transition-transform group-hover:translate-y-0.5">↓</span>
              </a>
            </motion.div>
          </div>
        </div>

        <div className="pb-7 flex flex-col items-center gap-2 scroll-cue">
          <span className="text-[10px] tracking-[0.4em] uppercase text-ink/40">Role</span>
          <span className="h-7 w-px bg-ink/30" />
        </div>
      </div>
    </section>
  );
}

function IAChat({ onInteract, onClose, full = false }: { onInteract: () => void; onClose: () => void; full?: boolean }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { from: "ia", text: "Olá! Sou a atendente da WIU 👋" },
    { from: "ia", text: "O que você tá procurando?" },
  ]);
  const [text, setText] = useState("");
  const [showOptions, setShowOptions] = useState(true);
  const [typing, setTyping] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => { boxRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [msgs, typing]);

  function pick(opt: typeof IA_OPTIONS[number]) {
    onInteract();
    setMsgs((m) => [...m, { from: "user", text: opt.label }]);
    setShowOptions(false);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "ia", text: "Boa escolha! Te levo pra lá agora." }]);
      setTimeout(() => {
        if (opt.href.startsWith("#")) {
          document.querySelector(opt.href)?.scrollIntoView({ behavior: "smooth", block: "start" });
          onClose();
        } else {
          window.open(opt.href, "_blank", "noopener,noreferrer");
        }
      }, 900);
    }, 800);
  }

  function send() {
    const tt = text.trim();
    if (!tt) return;
    onInteract();
    setMsgs((m) => [...m, { from: "user", text: tt }]);
    setText("");
    setShowOptions(false);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "ia", text: "Entendi! Escolhe uma das opções abaixo pra eu te direcionar:" }]);
      setShowOptions(true);
    }, 900);
  }

  const inner = (
    <>
      {/* Header */}
      <div className={`flex items-center gap-2.5 px-4 py-3 bg-white shrink-0 ${!full ? "border-b border-ink/8" : ""}`}>
        <div className="relative">
          <div className="grid h-9 w-9 place-items-center rounded-full text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)" }}>
            W
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#39e58c] ring-2 ring-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-ink truncate">Atendente WIU</div>
          <div className="text-[10px] text-ink/50 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39e58c] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#39e58c]" />
            </span>
            Online agora
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar chat"
          className="rounded-full p-2 text-ink/40 hover:text-ink hover:bg-ink/5 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Mensagens */}
      <div
        ref={boxRef}
        className={`${full ? "flex-1" : "max-h-60"} overflow-y-auto px-3.5 py-3 space-y-2`}
        style={{
          background: "#f7f5f0",
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(13,13,13,0.05) 1px, transparent 0)",
          backgroundSize: "14px 14px",
        }}
      >
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} items-end gap-1.5`}>
            {m.from === "ia" && (
              <div className="grid h-6 w-6 place-items-center rounded-full text-white text-[10px] font-bold shrink-0 mb-0.5"
                style={{ background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)" }}>
                W
              </div>
            )}
            <div
              className={`max-w-[78%] px-3 py-2 text-[13px] leading-snug ${
                m.from === "user"
                  ? "bg-[#00b4d8] text-white rounded-2xl rounded-br-sm"
                  : "bg-white text-ink rounded-2xl rounded-bl-sm border border-ink/6"
              }`}
              style={m.from === "ia" ? { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" } : undefined}
            >
              {m.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-end gap-1.5 justify-start">
            <div className="grid h-6 w-6 place-items-center rounded-full text-white text-[10px] font-bold shrink-0 mb-0.5"
              style={{ background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)" }}>
              W
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm border border-ink/6 px-3.5 py-2.5"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-ink/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-ink/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-ink/30 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {showOptions && !typing && (
          <div className="pt-2 space-y-1.5">
            {IA_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.label}
                  onClick={() => pick(opt)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white hover:bg-[#00b4d8] hover:text-white hover:border-[#00b4d8] text-ink text-[12px] font-semibold transition-all border border-[#00b4d8]/30 text-left group"
                  style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-[#00b4d8] group-hover:text-white transition-colors" />
                  <span className="flex-1">{opt.label}</span>
                  <span className="text-ink/30 group-hover:text-white transition-colors">→</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-t border-ink/8 bg-white shrink-0"
        style={full ? { paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" } : undefined}
      >
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); if (e.target.value) onInteract(); }}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Digite sua mensagem…"
          className="flex-1 bg-[#f2f0ea] rounded-full px-4 py-2 text-[13px] text-ink placeholder:text-ink/40 outline-none border border-ink/5 focus:border-[#00b4d8]/40 transition-colors"
        />
        <button
          onClick={send}
          aria-label="Enviar"
          disabled={!text.trim()}
          className="grid h-9 w-9 place-items-center rounded-full bg-[#00b4d8] text-white hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </>
  );

  if (full) return <div className="flex h-full flex-col bg-white">{inner}</div>;

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white border border-ink/8"
      style={{ boxShadow: "0 25px 70px -15px rgba(13,13,13,0.2), 0 0 0 1px rgba(0,180,216,0.1)" }}
    >
      {inner}
    </div>
  );
}
