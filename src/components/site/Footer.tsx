import { Instagram, Youtube, Facebook } from "lucide-react";
import { LOGO_URL } from "./shared";

const COLS = [
  {
    title: "Plataforma",
    links: ["Marketplace", "Laudo de Qualidade", "Instrutores", "Sessões"],
  },
  {
    title: "Comunidade",
    links: ["Como funciona", "Vender", "Regras"],
  },
  {
    title: "Ajuda",
    links: ["FAQ", "Contato", "Segurança"],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-paper border-t border-ink/15">
      {/* Final CTA */}
      <div className="bg-ink text-paper">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-32 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-8">
            <div className="text-[13px] uppercase tracking-[0.24em] text-paper/55 font-semibold">Última chamada</div>
            <h2 className="display text-5xl md:text-7xl lg:text-8xl mt-4">
              Pronto para entrar{" "}
              <span className="serif italic normal-case tracking-normal text-accent">na tribo</span>?
            </h2>
          </div>
          <div className="md:col-span-4 md:text-right">
            <a
              href="#criar"
              className="inline-flex items-center gap-3 bg-accent text-ink px-8 py-5 text-[13px] uppercase tracking-[0.2em] font-bold hover:bg-paper transition-colors"
            >
              Criar conta <span>→</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center bg-paper">
                <img src={LOGO_URL} alt="Wind Is Up" className="h-10 w-10 object-contain mix-blend-multiply" />
              </span>
              <span className="display text-lg tracking-[0.18em]">WIU</span>
            </div>
            <p className="mt-6 max-w-sm serif text-2xl text-ink/80 italic">
              A comunidade que respira vento.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[Instagram, Youtube, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="h-10 w-10 border border-ink/30 flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                >
                  <Icon className="h-4 w-4 stroke-[1.4]" />
                </a>
              ))}
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50 mb-5">{c.title}</div>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[15px] text-ink/75 hover:text-accent transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-1 hidden md:block" />
        </div>

        <div className="mt-16 pt-6 border-t border-ink/15 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-ink/50">
          <span>© {year} Wind Is Up Kitesurf</span>
          <span>Feito com vento bom no Brasil</span>
        </div>
      </div>
    </footer>
  );
}
