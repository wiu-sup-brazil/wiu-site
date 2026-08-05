import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Heart, Star, BadgeCheck, Loader2 } from "lucide-react";
import { TiltCard } from "./TiltCard";
import { IMG } from "./shared";
import { useProducts } from "@/hooks/use-products";

type Cat = "Todos" | "Pranchas" | "Kites" | "Barras" | "Trapézios" | "Acessórios";
type Price = "Todos" | "ate1k" | "1k3k" | "3kplus";

// Mapeia a categoria do banco (singular) para a do filtro (plural)
const CAT_MAP: Record<string, Exclude<Cat, "Todos">> = {
  Kite: "Kites",
  Prancha: "Pranchas",
  Barra: "Barras",
  "Trapézio": "Trapézios",
  "Acessório": "Acessórios",
  Wing: "Kites",
  Foil: "Pranchas",
};

const CATS: Cat[] = ["Todos", "Pranchas", "Kites", "Barras", "Trapézios", "Acessórios"];
const PRICES: { v: Price; l: string }[] = [
  { v: "Todos", l: "Todos os preços" },
  { v: "ate1k", l: "Até R$ 1.000" },
  { v: "1k3k", l: "R$ 1.000 a 3.000" },
  { v: "3kplus", l: "R$ 3.000 ou mais" },
];

// Imagem fallback por categoria
const FALLBACK_IMG: Record<string, string> = {
  Kite: IMG.kite,
  Prancha: IMG.board,
  Barra: IMG.gear,
  "Trapézio": IMG.gear,
  "Acessório": IMG.beach,
  Wing: IMG.action,
  Foil: IMG.board,
};

export function Marketplace() {
  const { data: products = [], isLoading } = useProducts();
  const [cat, setCat] = useState<Cat>("Todos");
  const [price, setPrice] = useState<Price>("Todos");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const pCat = CAT_MAP[p.category] || "Acessórios";
      const preco = p.asking_price || 0;

      if (cat !== "Todos" && pCat !== cat) return false;
      if (price === "ate1k" && preco > 1000) return false;
      if (price === "1k3k" && (preco < 1000 || preco > 3000)) return false;
      if (price === "3kplus" && preco < 3000) return false;
      return true;
    });
  }, [products, cat, price]);

  return (
    <div id="marketplace" className="bg-paper-2 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="max-w-3xl">
          <h2 className="display text-5xl md:text-7xl lg:text-8xl gust-3">
            Equipamento <span className="serif italic normal-case tracking-normal">certo</span>, no preço justo.
          </h2>
          <p className="mt-6 text-xl text-ink/70 leading-relaxed">
            Com laudo técnico. Avaliado por quem entende.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-14 border-y border-ink/20 py-6 flex flex-wrap items-center gap-x-8 gap-y-5">
          <FilterGroup label="Categoria" options={CATS} value={cat} onChange={setCat} />
          <span className="h-6 w-px bg-ink/15 hidden md:block" />
          <FilterGroup
            label="Preço"
            options={PRICES.map((p) => p.v) as Price[]}
            labels={Object.fromEntries(PRICES.map((p) => [p.v, p.l]))}
            value={price}
            onChange={setPrice}
          />
          <div className="ml-auto text-[13px] uppercase tracking-[0.22em] text-ink/55">
            {isLoading ? "Carregando..." : `${filtered.length} ${filtered.length === 1 ? "item" : "itens"}`}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mt-16 flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-ink/30" />
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7" style={{ perspective: 1000 }}>
            {filtered.map((p, i) => {
              const img = (p.photos && p.photos[0]) || FALLBACK_IMG[p.category] || IMG.gear;
              const preco = p.asking_price || 0;

              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
                >
                  <TiltCard className="group bg-paper h-full flex flex-col overflow-hidden card-lift card-lift-hover">
                    {/* Cabeçalho */}
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-ink/8">
                      <div className="h-8 w-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold shrink-0">
                        W
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-ink truncate">Wind Is Up</div>
                        <div className="text-[11px] text-ink/45">publicou no marketplace</div>
                      </div>
                      <button
                        aria-label="Favoritar"
                        className="h-8 w-8 flex items-center justify-center text-ink/40 hover:text-accent transition-colors shrink-0"
                      >
                        <Heart className="h-4 w-4 stroke-[1.6]" />
                      </button>
                    </div>

                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={img}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-[filter,transform] duration-500 group-hover:scale-105"
                        style={{ filter: "saturate(1.08)" }}
                      />
                      <div className="absolute top-3 left-3 border border-ink/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-paper/85 backdrop-blur-sm font-semibold">
                        {p.condition || "Usado"}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-ink/55">{p.category}</div>
                      <p className="mt-1.5 text-[15px] leading-snug text-ink">
                        <span className="font-semibold">{p.name}</span>
                        {p.year && <span className="text-ink/50"> ({p.year})</span>}
                      </p>

                      <div className="mt-3 inline-flex items-center gap-1.5 text-accent border border-accent px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold self-start">
                        <BadgeCheck className="h-3.5 w-3.5" /> Avaliado pela WIU
                      </div>

                      <div className="mt-auto pt-5 flex items-end justify-between">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.22em] text-ink/50">R$</div>
                          <div className="serif text-4xl text-ink leading-none">
                            {preco.toLocaleString("pt-BR")}
                          </div>
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/5585998477678?text=${encodeURIComponent(`Oi! Vi o ${p.name} (${p.code}) no site e quero saber mais.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 w-full bg-ink text-paper py-3.5 text-[12px] uppercase tracking-[0.2em] font-semibold hover:bg-accent transition-colors text-center block"
                      >
                        Consultar
                      </a>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="mt-16 border border-dashed border-ink/30 p-16 text-center text-ink/55 text-lg">
            {products.length === 0
              ? "Nenhum equipamento publicado ainda. Em breve!"
              : "Nenhum equipamento bate com esses filtros. Solta um pouco a vela."}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  labels,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Record<string, string>;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[11px] uppercase tracking-[0.3em] text-ink/50">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o === value;
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
              className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] border transition-colors ${
                active
                  ? "bg-ink text-paper border-ink"
                  : "border-ink/25 text-ink/75 hover:border-ink hover:text-ink"
              }`}
            >
              {labels?.[o] ?? o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
