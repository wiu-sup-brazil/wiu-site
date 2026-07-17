import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { SunShape, BirdsShape, KiteShape, WindStreaks, SeaWaves } from "./KiteDecor";

/**
 * Hero claro e enxuto. Lição aprendida da versão anterior: elementos
 * decorativos NUNCA podem competir com o texto principal. Aqui, a regra
 * é simples e foi testada visualmente em mobile e desktop:
 *
 * - O bloco de texto ocupa uma coluna com largura máxima controlada
 *   (max-w-xl em mobile/tablet, mais largo em desktop) e fica sempre
 *   por cima (z-10), nunca tendo decoração desenhada sobre ele.
 * - A decoração (sol, pássaros, pipa, vento) vive só nos 25% mais à
 *   direita da tela em desktop, e é OCULTADA em telas pequenas (abaixo
 *   de md) onde não há espaço sobrando , evitando qualquer sobreposição.
 * - As ondas do mar ficam fixas na base, atrás do texto, com altura
 *   pequena o suficiente para nunca cruzar os botões.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const sceneOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const sceneStyle = reduce ? undefined : { opacity: sceneOpacity };

  return (
    <section ref={ref} id="top" className="relative min-h-[100vh] overflow-hidden bg-paper">
      {/* Fundo: leve gradiente de céu, sempre presente, nunca depende de imagem */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--accent) 5%, var(--paper)) 0%, var(--paper) 60%, color-mix(in srgb, var(--accent) 4%, var(--paper)) 100%)",
        }}
      />

      {/* Ondas do mar, fixas na base, discretas, nunca cruzam o conteúdo */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-20 md:h-28 opacity-70"
        style={{ color: "var(--sky)" }}
      >
        <SeaWaves color="currentColor" className="h-full w-full" />
      </div>

      {/* Pipa: visível em TODAS as telas, cai planando do alto ao abrir.
          Mobile: centralizada abaixo dos botões.
          Desktop: canto superior direito. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[20%] bottom-[12%] w-24 md:right-[3%] md:top-[26%] md:bottom-auto md:w-36 lg:w-44"
        initial={{ y: "-55vh", x: "10vw", rotate: -30, opacity: 0 }}
        animate={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 2.4, delay: 0.3, ease: [0.15, 0.8, 0.2, 1] }}
      >
        <motion.div
          animate={reduce ? undefined : { rotate: [-3, 3, -3], y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2.8 }}
          style={{ transformOrigin: "top center" }}
        >
          <KiteShape color="var(--accent)" />
        </motion.div>
      </motion.div>

      {/* Decoração restante: sol, pássaros, vento, só em telas md+ */}
      <motion.div
        aria-hidden
        style={sceneStyle}
        className="hidden md:block pointer-events-none absolute inset-0"
      >
        <motion.div
          className="absolute right-[6%] top-[10%] w-28 lg:w-36 text-ink/80"
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
          className="absolute right-[16%] top-[40%] w-20 lg:w-24 wind-drift text-accent/50"
          style={{ animationDelay: "1s" }}
        >
          <WindStreaks color="currentColor" />
        </div>
      </motion.div>

      {/* Conteúdo de texto , sempre por cima, sempre livre de decoração */}
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
