import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { IMG } from "./shared";
import { CategoryIcon } from "./CategoryIcons";
import { useProducts } from "@/hooks/use-products";

const WHATSAPP = "5585998477678";

type Cat = "Todos" | "Kites" | "Pranchas" | "Barras" | "Trapézios" | "Acessórios";
const CAT_MAP: Record<string, Cat> = {
  Kite: "Kites", Prancha: "Pranchas", Barra: "Barras", "Trapézio": "Trapézios",
  "Acessório": "Acessórios", Bomba: "Acessórios", Colete: "Acessórios",
  Capacete: "Acessórios", Wing: "Kites", Foil: "Pranchas", "Kit Completo": "Kites",
};
const CATS: Cat[] = ["Todos", "Kites", "Pranchas", "Barras", "Trapézios", "Acessórios"];
const CAT_ICON: Record<Cat, string> = {
  Todos: "Todos", Kites: "Kite", Pranchas: "Prancha",
  Barras: "Barra", "Trapézios": "Trapézio", "Acessórios": "Acessório",
};
const FALLBACK: Record<string, string> = {
  Kite: IMG.kite, Prancha: IMG.board, Barra: IMG.gear, "Trapézio": IMG.gear,
  "Acessório": IMG.beach, Wing: IMG.action, Foil: IMG.board,
};

const brl = (n: number) => n.toLocaleString("pt-BR");

export function Marketplace() {
  const { data: products = [], isLoading } = useProducts();
  const [cat, setCat] = useState<Cat>("Todos");
  const [open, setOpen] = useState<any | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Todos: products.length };
    products.forEach((p: any) => {
      const k = CAT_MAP[p.category] || "Acessórios";
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [products]);

  const filtered = useMemo(
    () => products.filter((p: any) => cat === "Todos" || (CAT_MAP[p.category] || "Acessórios") === cat),
    [products, cat]
  );

  return (
    <div id="marketplace" className="bg-paper-2 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
      <div className="text-center max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.3em] text-ink/50">
            <span className="h-px w-10 bg-ink/30" /> Estoque real, atualizado hoje <span className="h-px w-10 bg-ink/30" />
          </div>
       <h2 className="mt-6 md:mt-8 overflow-visible">
            <motion.span
              className="display text-4xl sm:text-5xl md:text-7xl lg:text-8xl block"
              initial={{ x: "-40%", opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
              style={{ lineHeight: 1.1 }}
            >
              Equipamento <span className="serif italic normal-case tracking-normal">certo</span>,
            </motion.span>
            <motion.span
              className="display text-4xl sm:text-5xl md:text-7xl lg:text-8xl block mt-1"
              initial={{ x: "40%", opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
              style={{ lineHeight: 1.1, paddingBottom: "0.15em" }}
            >
              no preço justo.
            </motion.span>
          </h2>
          <motion.p
            className="mt-6 text-xl text-ink/70 leading-relaxed mx-auto max-w-xl"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Todo item passa por laudo técnico escrito. Você vê o estado real antes de perguntar o preço.
          </motion.p>
        </div>

        {/* Categorias com ícone */}
        <div className="mt-16 grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATS.map((c) => {
            const active = c === cat;
            const n = counts[c] || 0;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`group relative flex flex-col items-center justify-center gap-3 border py-7 px-2 transition-all duration-300 ${
                  active ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink hover:border-ink/60 hover:-translate-y-0.5"
                }`}
              >
                <CategoryIcon category={CAT_ICON[c]} className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-[11px] uppercase tracking-[0.18em] font-semibold">{c}</span>
                <span className={`absolute top-2.5 right-3 text-[10px] tabular-nums ${active ? "text-paper/50" : "text-ink/35"}`}>{n}</span>
              </button>
            );
          })}
        </div>

        {isLoading && (
          <div className="mt-20 flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-ink/25" /></div>
        )}

        {/* Grid de produtos */}
        {!isLoading && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7 gap-y-14">
            <AnimatePresence mode="popLayout">
              {filtered.map((p: any, i: number) => {
                const img = p.photos?.[0] || FALLBACK[p.category] || IMG.gear;
                return (
                  <motion.button
                    key={p.id}
                    layout
                    onClick={() => setOpen(p)}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.45, delay: (i % 4) * 0.05 }}
                    className="group text-left"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-ink/5">
                      <img src={img} alt={p.name} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]" />
                      <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
                      <div className="absolute top-0 left-0 bg-paper px-3 py-2">
                        <CategoryIcon category={p.category} className="h-5 w-5 text-ink" />
                      </div>
                      {p.size && (
                        <div className="absolute bottom-0 right-0 bg-paper px-3 py-1.5 serif text-lg leading-none">{p.size}</div>
                      )}
                    </div>

                    <div className="mt-5 flex items-start justify-between gap-4 border-t border-ink/15 pt-4">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-ink/45">
                          {p.brand || p.category}{p.year ? ` · ${p.year}` : ""}
                        </div>
                        <h3 className="mt-1.5 text-[17px] font-semibold leading-tight text-ink">
                          {p.model || p.name}
                        </h3>
                      <div className="mt-2.5 flex items-center gap-2.5">
                        {p.eval_type === "presencial" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18b26b]/10 border border-[#18b26b]/30 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] font-bold text-[#18b26b]">
                            <svg viewBox="0 0 16 16" className="h-3 w-3"><path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-ink/55">
                            <ShieldCheck className="h-3.5 w-3.5" /> {p.condition || "Avaliado"}
                          </span>
                        )}
                      </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-ink/45">R$</div>
                        <div className="serif text-3xl leading-none text-ink">{brl(p.asking_price || 0)}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink/50 transition-colors group-hover:text-accent">
                      Ver laudo <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="mt-16 border border-dashed border-ink/25 p-20 text-center">
            <CategoryIcon category={CAT_ICON[cat]} className="h-10 w-10 mx-auto text-ink/25" />
            <p className="mt-5 text-ink/55 text-lg">
              {products.length === 0 ? "Estoque sendo carregado. Volta já já." : `Nenhum item em ${cat} agora.`}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>{open && <ProductSheet p={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}

function ProductSheet({ p, onClose }: { p: any; onClose: () => void }) {
  const [img, setImg] = useState(p.photos?.[0] || FALLBACK[p.category] || IMG.gear);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  const msg = encodeURIComponent(`Oi! Vi o ${p.name} (${p.code}) no site da WIU e quero saber mais.`);

  return (
    <motion.div className="fixed inset-0 z-[100] flex justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[3px]" onClick={onClose} />
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 260 }}
        className="relative h-full w-full max-w-[560px] overflow-y-auto bg-paper"
      >
        <button onClick={onClose}
          className="sticky top-0 z-10 ml-auto mr-5 mt-5 flex h-10 w-10 items-center justify-center border border-ink/20 bg-paper hover:bg-ink hover:text-paper transition-colors">
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pb-16 -mt-10">
          <div className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.24em] text-ink/45">
            <CategoryIcon category={p.category} className="h-4 w-4" />
            {p.category} · {p.code}
          </div>

          <h2 className="mt-4 display text-4xl md:text-5xl leading-[0.95]">{p.model || p.name}</h2>
          <div className="mt-3 text-lg text-ink/60">
            {[p.brand, p.year, p.size].filter(Boolean).join(" · ")}
          </div>

          <div className="mt-8 aspect-[4/3] overflow-hidden bg-ink/5">
            <img src={img} alt={p.name} className="h-full w-full object-cover" />
          </div>
          {p.photos?.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {p.photos.map((ph: string, i: number) => (
                <button key={i} onClick={() => setImg(ph)}
                  className={`h-16 w-20 shrink-0 overflow-hidden border-2 transition ${img === ph ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <img src={ph} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-10 flex items-end justify-between border-y border-ink/15 py-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-ink/45">Preço</div>
              <div className="mt-1 serif text-5xl leading-none">R$ {brl(p.asking_price || 0)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.24em] text-ink/45">Estado</div>
              <div className="mt-1.5 text-sm font-semibold">{p.condition || "Avaliado"}</div>
            </div>
          </div>

          {p.raio_x && (
            <section className="mt-10">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <h3 className="text-[11px] uppercase tracking-[0.24em] font-semibold">Laudo técnico</h3>
              </div>
              <p className="mt-4 border-l-2 border-accent pl-5 text-[15px] leading-relaxed text-ink/80 whitespace-pre-wrap">
                {p.raio_x}
              </p>
              <p className="mt-4 text-xs text-ink/45 leading-relaxed">
                Escrito pela equipe da WIU depois de inspecionar o item. Nada de avaria escondida.
              </p>
            </section>
          )}

          {p.accessories?.length > 0 && (
            <section className="mt-10">
              <h3 className="text-[11px] uppercase tracking-[0.24em] font-semibold text-ink/60">Vai junto</h3>
              <ul className="mt-4 space-y-2.5">
                {p.accessories.map((a: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-[15px] text-ink/80">
                    <span className="h-1 w-1 rounded-full bg-accent" /> {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <a href={`https://wa.me/${WHATSAPP}?text=${msg}`} target="_blank" rel="noopener noreferrer"
            className="mt-12 flex w-full items-center justify-center gap-3 bg-ink py-5 text-[12px] uppercase tracking-[0.22em] font-semibold text-paper transition-colors hover:bg-accent">
            Falar sobre este item <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-4 text-center text-xs text-ink/45">Resposta no WhatsApp, direto com a equipe.</p>
        </div>
      </motion.aside>
    </motion.div>
  );
}
