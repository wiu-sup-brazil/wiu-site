import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, Users } from "lucide-react";
import { TiltCard } from "./TiltCard";
import { IMG } from "./shared";

const EVENTS = [
  { nome: "Downwind Cumbuco a Cauípe", local: "Cumbuco, CE", data: "12 Set 2026", nivel: "Todos", conf: 24, img: IMG.spot1 },
  { nome: "Sessão da galera no Preá", local: "Preá, CE", data: "20 Set 2026", nivel: "Iniciante", conf: 12, img: IMG.spot2 },
  { nome: "Travessia Jeri a Guriú", local: "Jericoacoara, CE", data: "05 Out 2026", nivel: "Avançado", conf: 18, img: IMG.spot3 },
  { nome: "Big Air Camp", local: "Ilha do Guajirú, CE", data: "18 Out 2026", nivel: "Avançado", conf: 9, img: IMG.spot4 },
  { nome: "Encontro feminino de kite", local: "Búzios, RJ", data: "02 Nov 2026", nivel: "Todos", conf: 31, img: IMG.spot5 },
  { nome: "Sunset Session", local: "Florianópolis, SC", data: "15 Nov 2026", nivel: "Iniciante", conf: 15, img: IMG.spot6 },
];

const LOCAIS = ["Todos", ...Array.from(new Set(EVENTS.map((e) => e.local)))];

function AvatarStack({ n }: { n: number }) {
  const count = Math.min(4, n);
  const photos = [IMG.p1, IMG.p2, IMG.p3, IMG.p4];
  return (
    <div className="flex -space-x-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-8 w-8 rounded-full border-2 border-paper overflow-hidden"
        >
          <img src={photos[i]} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
      {n > count && (
        <div className="h-8 w-8 rounded-full bg-ink text-paper text-[10px] flex items-center justify-center border-2 border-paper font-semibold">
          +{n - count}
        </div>
      )}
    </div>
  );
}

export function Comunidade() {
  const [local, setLocal] = useState("Todos");
  const filtered = useMemo(
    () => EVENTS.filter((e) => local === "Todos" || e.local === local),
    [local]
  );

  return (
    <div id="sessoes" className="bg-paper-2 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="max-w-3xl">
          <h2 className="display text-5xl md:text-7xl lg:text-8xl gust-4">
            Não navegue <span className="serif italic normal-case tracking-normal">sozinho</span>.
          </h2>
          <p className="mt-6 text-xl text-ink/70 leading-relaxed">
            Sessões, downwinds e trips. Com a galera, no vento certo.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.3em] text-ink/50 mr-2">Localização</span>
          {LOCAIS.map((l) => {
            const active = l === local;
            return (
              <button
                key={l}
                onClick={() => setLocal(l)}
                className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] border transition-colors ${
                  active ? "bg-ink text-paper border-ink" : "border-ink/25 text-ink/75 hover:border-ink"
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>

        <div className="mt-12 -mx-6 md:-mx-10" style={{ perspective: 1000 }}>
          <div className="flex gap-7 overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 md:px-10 pb-2">
            {filtered.map((e, i) => (
              <motion.div
                key={e.nome}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                style={{ width: "min(82vw, 380px)", flex: "0 0 auto" }}
                className="snap-start"
              >
                <TiltCard className="group bg-paper h-full overflow-hidden flex flex-col card-lift card-lift-hover">
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img
                      src={e.img}
                      alt={e.nome}
                      loading="lazy"
                      className="h-full w-full object-cover transition-[filter,transform] duration-500 group-hover:scale-105"
                      style={{ filter: "saturate(1.08)" }}
                    />
                    <div className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.22em] border border-paper/40 text-paper px-2.5 py-1 bg-ink/40 backdrop-blur-sm font-semibold">
                      {e.nivel}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="display text-2xl md:text-3xl leading-tight">{e.nome}</h3>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/70">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> {e.local}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> {e.data}
                      </span>
                    </div>
                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-ink/15 mt-6">
                      <div className="flex items-center gap-3">
                        <AvatarStack n={e.conf} />
                        <span className="text-[11px] uppercase tracking-[0.18em] text-ink/55 inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {e.conf}
                        </span>
                      </div>
                      <button className="text-[11px] uppercase tracking-[0.2em] font-semibold border border-ink px-4 py-2.5 hover:bg-accent hover:border-accent hover:text-paper transition-colors">
                        Participar
                      </button>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 px-7 md:px-11">
            <span className="text-[11px] uppercase tracking-[0.2em] text-ink/35 hidden sm:inline">
              Arraste para o lado →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
