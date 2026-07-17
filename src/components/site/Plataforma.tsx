import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, Compass, Shield, Users, ArrowRight } from "lucide-react";
import { TABS, type TabKey } from "./shared";
import { Marketplace } from "./Marketplace";
import { Instrutores } from "./Instrutores";
import { Laudo } from "./Laudo";
import { Comunidade } from "./Comunidade";

const ICONS = { store: Store, compass: Compass, shield: Shield, users: Users };

export function Plataforma() {
  const [active, setActive] = useState<TabKey>("marketplace");

  const go = (k: TabKey) => {
    setActive(k);
    document.getElementById("painel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail as TabKey;
      const valid = ["marketplace", "instrutores", "laudo", "comunidade"];
      if (valid.includes(tab)) go(tab);
    };
    window.addEventListener("select-tab", handler);
    return () => window.removeEventListener("select-tab", handler);
  }, []);

  return (
    <section id="plataforma" className="bg-paper">
      {/* Intro: tudo num lugar só */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-24 md:pt-32">
        <div className="max-w-3xl">
          <div className="text-[13px] uppercase tracking-[0.24em] text-accent font-semibold">A plataforma</div>
          <h2 className="display text-5xl md:text-7xl lg:text-8xl mt-4 gust-1">
            Tudo num <span className="serif italic normal-case tracking-normal text-accent">lugar só</span>.
          </h2>
          <p className="mt-6 text-xl text-ink/70 leading-relaxed">
            Escolha por onde começar.
          </p>
        </div>

        {/* Service entry cards , carrossel horizontal com scroll-snap em todas as telas */}
        <div className="mt-12 -mx-6 md:-mx-10">
          <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 md:px-10 pb-2">
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
                  style={{ width: "min(78vw, 300px)", flex: "0 0 auto" }}
                  className={`group snap-start text-left card-lift card-lift-hover bg-paper border-2 p-7 md:p-8 min-h-[260px] flex flex-col justify-between transition-colors ${
                    on ? "border-accent" : "border-ink/10 hover:border-ink/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-full transition-colors gust-${(i % 5) + 1}`}
                      style={{ transformOrigin: "center" }}
                    >
                      <div
                        className={`flex h-full w-full items-center justify-center rounded-full transition-colors ${
                          on ? "bg-accent text-paper" : "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-paper"
                        }`}
                      >
                        <Icon className="h-6 w-6 stroke-[1.5]" />
                      </div>
                    </div>
                    <span className="text-[12px] uppercase tracking-[0.3em] text-ink/30">{t.index}</span>
                  </div>
                  <div>
                    <h3 className="display text-2xl md:text-3xl">{t.label}</h3>
                    <p className="mt-2 text-[15px] text-ink/60">{t.tagline}</p>
                    <span
                      className={`mt-5 inline-flex items-center justify-center gap-2 w-full py-3.5 text-[12px] uppercase tracking-[0.2em] font-semibold transition-colors ${
                        on ? "bg-accent text-paper" : "bg-ink text-paper group-hover:bg-accent"
                      }`}
                    >
                      Abrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Indicador de scroll (pontinhos), só decorativo */}
          <div className="mt-5 flex items-center gap-2 px-1">
            {TABS.map((t) => (
              <span
                key={t.key}
                className={`h-1.5 rounded-full transition-all ${
                  t.key === active ? "w-6 bg-accent" : "w-1.5 bg-ink/15"
                }`}
              />
            ))}
            <span className="ml-3 text-[11px] uppercase tracking-[0.2em] text-ink/35 hidden sm:inline">
              Arraste para o lado →
            </span>
          </div>
        </div>
      </div>

      {/* Painel ativo, com barra de abas tipo segmented control */}
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
            {active === "comunidade" && <Comunidade />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
