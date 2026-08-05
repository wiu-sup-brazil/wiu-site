import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

function Counter({ to, suffix = "", duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased * 10) / 10);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return (
    <span ref={ref}>
      {Number.isInteger(to) ? Math.round(val).toLocaleString("pt-BR") : val.toFixed(1)}
      {suffix}
    </span>
  );
}

const STATS = [
  { n: 12000, s: "+", l: "Riders" },
  { n: 3000, s: "+", l: "Equipamentos" },
  { n: 4.9, s: "", l: "Avaliação" },
];

export function Stats() {
  const reduce = useReducedMotion();
  return (
    <section className="relative bg-paper border-b border-ink/10 section-depth">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-20 grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16">
        {STATS.map((it, i) => (
          <motion.div
            key={it.l}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="text-center sm:text-left"
          >
            {/* Flutuação contínua depois que o número chega — nunca fica parado */}
            <motion.div
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 4.5 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: 1.8 + i * 0.5 }}
              className="serif text-6xl md:text-8xl text-accent leading-none"
              style={{ textShadow: "0 4px 24px rgba(0,180,216,0.25)" }}
            >
              <Counter to={it.n} suffix={it.s} />
            </motion.div>
            <div className="mt-3 text-[13px] uppercase tracking-[0.24em] text-ink/60">{it.l}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
