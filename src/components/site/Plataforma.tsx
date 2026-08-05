import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, Compass, Shield, ArrowRight } from "lucide-react";
import { TABS, type TabKey } from "./shared";
import { Marketplace } from "./Marketplace";
import { Instrutores } from "./Instrutores";
import { Laudo } from "./Laudo";

const ICONS: Record<string, any> = { store: Store, compass: Compass, shield: Shield };

export function Plataforma() {
  const [active, setActive] = useState<TabKey>("marketplace");

  const go = (k: TabKey) => {
    setActive(k);
    document.getElementById("painel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail as TabKey;
      const valid = ["marketplace", "instrutores", "laudo"];
      if (valid.includes(tab)) go(tab);
    };
    window.addEventListener("select-tab", handler);
    return () => window.removeEventListener("select-tab", handler);
  }, []);

  return (
    <section id="plataforma" className="relative bg-paper">
 {/* Transição suave do Sobre */}
<div className="pointer-events-none absolute inset-x-0 top-0 h-24"
  style={{ background: "linear-gradient(to bottom, var(--paper-2), transparent)" }} />

    <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-28 md:pt-36">
        <div className="text-center">
          <div className="text-[13px] uppercase tracking-[0.24em] text-accent font-semibold">A plataforma</div>

          {/* Título split: "Tudo num" vem da esquerda, "lugar só." vem da direita */}
          <h2 className="mt-6 md:mt-8 overflow-hidden">
            <motion.span
              className="display text-5xl sm:text-6xl md:text-8xl lg:text-9xl block md:inline-block"
              initial={{ x: "-50%", opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
            >
              Tudo num{" "}
            </motion.span>
            <motion.span
              className="display text-5xl sm:text-6xl md:text-8xl lg:text-9xl block md:inline-block"
              initial={{ x: "50%", opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <span className="serif italic normal-case tracking-normal text-accent">lugar</span>{" "}
              só.
            </motion.span>
          </h2>

          <motion.p
            className="mt-6 text-xl text-ink/70 leading-relaxed mx-auto max-w-md"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Escolha por onde começar.
          </motion.p>
        </div>

        {/* 3 cards — sem Trips */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TABS.map((t, i) => {
            const Icon = ICONS[t.icon];
            const on = t.key === active;
            return (
              <motion.button
                key={t.key}
                onClick={() => go(t.key)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group text-left card-lift card-lift-hover bg-paper border-2 p-7 md:p-8 flex flex-col justify-between min-h-[260px] transition-colors ${
                  on ? "border-accent" : "border-ink/10 hover:border-ink/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full transition-colors gust-${(i % 5) + 1}`}>
                    <div className={`flex h-full w-full items-center justify-center rounded-full transition-colors ${
                      on ? "bg-accent text-paper" : "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-paper"
                    }`}>
                      <Icon className="h-6 w-6 stroke-[1.5]" />
                    </div>
                  </div>
                  <span className="text-[12px] uppercase tracking-[0.3em] text-ink/30">{t.index}</span>
                </div>
                <div>
                  <h3 className="display text-2xl md:text-3xl">{t.label}</h3>
                  <p className="mt-2 text-[15px] text-ink/60">{t.tagline}</p>
                  <span className={`mt-5 inline-flex items-center justify-center gap-2 w-full py-3.5 text-[12px] uppercase tracking-[0.2em] font-semibold transition-colors ${
                    on ? "bg-accent text-paper" : "bg-ink text-paper group-hover:bg-accent"
                  }`}>
                    Abrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Painel ativo */}
      <div id="painel" className="mt-20 scroll-mt-24">
        <div className="sticky top-16 md:top-20 z-40 bg-paper/90 backdrop-blur-md border-y border-ink/10 tabs-depth">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {TABS.map((t) => {
                const Icon = ICONS[t.icon];
                const on = t.key === active;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActive(t.key)}
                    className={`relative flex items-center gap-2.5 whitespace-nowrap px-4 md:px-5 py-3 rounded-full text-[12px] md:text-[13px] uppercase tracking-[0.14em] font-semibold transition-colors ${
                      on ? "bg-ink text-paper" : "text-ink/55 hover:text-ink hover:bg-ink/[0.04]"
                    }`}
                  >
                    <Icon className="h-4 w-4 stroke-[1.6]" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {active === "marketplace" && <Marketplace />}
            {active === "instrutores" && <Instrutores />}
            {active === "laudo" && <Laudo />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
