import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Check, CheckCheck } from "lucide-react";
import { WaveLines } from "./KiteDecor";

const STEPS = [
  {
    label: "Conecte",
    title: "Encontre sua tribo",
    desc: "Riders e grupos de kitesurf perto de você. Conversa, dica de spot e parceiro pra próxima sessão.",
  },
  {
    label: "Negocie",
    title: "Compre e venda com confiança",
    desc: "Equipamento novo e usado, direto com quem entende. Com laudo técnico em quem quiser provar o estado real do kite.",
  },
  {
    label: "Navegue",
    title: "Vá pra água, junto",
    desc: "Sessões, downwinds e trips organizados pela própria comunidade. Ninguém navega sozinho.",
  },
];

const PESSOAS = {
  jordao: "https://res.cloudinary.com/dqridehwu/image/upload/v1781871699/611885687_18547652509038756_437999933265285679_n_pikaai.jpg",
  marcelino: "https://res.cloudinary.com/dqridehwu/image/upload/v1781871724/513910372_18507555262056877_5609309447116744797_n_adwklj.jpg",
  breno: "https://res.cloudinary.com/dqridehwu/image/upload/v1781871737/517158899_18279636247257865_3249980425985057124_n_kldhnr.jpg",
  rodrigo: "https://res.cloudinary.com/dqridehwu/image/upload/v1781700459/WhatsApp_Image_2026-06-17_at_09.08.42_ej7m8c.jpg",
};

const MESSAGES = [
  { from: "Jordão", img: PESSOAS.jordao, text: "Vento bom em Cumbuco hoje, quem tá on?", time: "09:12", mine: false },
  { from: "Marcelino", img: PESSOAS.marcelino, text: "Eu! Bora um downwind até a Cauípe", time: "09:14", mine: false },
  { from: "Você", img: PESSOAS.rodrigo, text: "Topo! Levo o kite 12m que comprei aqui no marketplace 🪁", time: "09:15", mine: true },
  { from: "Breno", img: PESSOAS.breno, text: "Vi o laudo, equipamento tava impecável 👌", time: "09:18", mine: false },
];

export function Sobre() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  /* Timeline à esquerda desliza do lado esquerdo pro centro conforme o scroll */
  const timelineX = useTransform(scrollYProgress, [0.1, 0.4], [-80, 0]);
  const timelineOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);

  /* Chat à direita flutua levemente */
  const chatY = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [20, -12, 8]);

  return (
    <section ref={sectionRef} className="relative bg-paper py-24 md:py-32 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 opacity-50">
        <WaveLines color="var(--accent)" className="w-full h-24" />
      </div>

    {/* Transição suave pro próximo bloco */}
<div className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
  style={{ background: "linear-gradient(to bottom, transparent, var(--paper-2))" }} />

      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <div className="text-[13px] uppercase tracking-[0.24em] text-ink/60 font-semibold">Sobre a comunidade</div>
            <div className="mt-3 h-px w-16 bg-ink" />
          </div>
          <div className="md:col-span-8">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="display text-5xl md:text-7xl lg:text-8xl gust-2"
            >
              Mais que um marketplace.{" "}
              <span className="serif italic text-ink/80 normal-case tracking-normal">Uma tribo.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 max-w-2xl text-xl text-ink/70 leading-relaxed"
            >
              É assim que a galera já se organiza no grupo do kite. A gente só deu um lugar pra isso acontecer melhor.
            </motion.p>
          </div>
        </div>

        {/* Corpo: timeline à esquerda (desliza pro centro), mockup à direita (flutua) */}
        <div className="mt-20 grid md:grid-cols-12 gap-12 md:gap-10 items-start">
          {/* Timeline Conecte > Negocie > Navegue */}
          <motion.div
            className="md:col-span-7"
            style={{ x: timelineX, opacity: timelineOpacity }}
          >
            <div className="relative pl-8">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-ink/15" />
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className={`relative ${i < STEPS.length - 1 ? "pb-12 md:pb-14" : ""}`}
                >
                  <span className="absolute -left-8 top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-paper" />
                  <div className="text-[11px] uppercase tracking-[0.3em] text-accent font-semibold">
                    {s.label}
                  </div>
                  <h3 className="display text-2xl md:text-3xl mt-2">{s.title}</h3>
                  <p className="mt-2 text-[15px] md:text-base text-ink/65 leading-relaxed max-w-md">
                    {s.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mockup do chat — flutua suavemente */}
          <motion.div
            className="md:col-span-5"
            style={{ y: chatY }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mx-auto max-w-sm border border-ink/10 bg-paper card-lift overflow-hidden" style={{ boxShadow: "0 20px 60px -15px rgba(13,13,13,0.15)" }}>
                <div className="flex items-center gap-3 px-4 py-3.5 bg-ink text-paper">
                  <div className="flex -space-x-2">
                    {[PESSOAS.jordao, PESSOAS.marcelino, PESSOAS.breno].map((src, i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-ink overflow-hidden shrink-0">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-tight truncate">Galera do Cumbuco 🌊</div>
                    <div className="text-[11px] text-paper/55 leading-tight">Jordão, Marcelino, Breno e +18</div>
                  </div>
                </div>

                <div
                  className="p-4 space-y-3"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--ink) 5%, transparent) 1px, transparent 0)",
                    backgroundSize: "16px 16px",
                  }}
                >
                  {MESSAGES.map((m, i) => (
                    <div key={i} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                      <div className={`flex items-end gap-2 max-w-[85%] ${m.mine ? "flex-row-reverse" : ""}`}>
                        <div className="h-6 w-6 rounded-full overflow-hidden shrink-0 mb-0.5">
                          <img src={m.img} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div
                          className={`px-3.5 py-2.5 text-[13px] leading-snug ${
                            m.mine ? "bg-accent text-paper rounded-2xl rounded-br-sm" : "bg-paper-2 text-ink rounded-2xl rounded-bl-sm border border-ink/8"
                          }`}
                        >
                          {!m.mine && <div className="text-[11px] font-semibold text-accent mb-0.5">{m.from}</div>}
                          <div>{m.text}</div>
                          <div
                            className={`mt-1 flex items-center gap-1 text-[10px] ${
                              m.mine ? "text-paper/70 justify-end" : "text-ink/40"
                            }`}
                          >
                            {m.time}
                            {m.mine && <CheckCheck className="h-3 w-3" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 px-4 py-3 border-t border-ink/10 bg-paper">
                  <div className="flex-1 h-9 rounded-full bg-paper-2 border border-ink/10 px-4 flex items-center text-[13px] text-ink/35">
                    Digite uma mensagem
                  </div>
                  <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-paper" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
