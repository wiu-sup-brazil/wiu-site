import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LOGO_URL, NAV_LINKS } from "./shared";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onNavClick = () => setOpen(false);

  const selectTab = (tab?: string) => {
    setOpen(false);
    if (tab) {
      window.dispatchEvent(new CustomEvent("select-tab", { detail: tab }));
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "bg-paper/90 backdrop-blur-md header-depth" : "bg-paper/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:h-20 md:px-10">
        <a href="#top" onClick={onNavClick} className="flex items-center gap-3">
          <span className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center bg-paper border border-ink/10">
            <img src={LOGO_URL} alt="Wind Is Up" className="h-8 w-8 md:h-10 md:w-10 object-contain mix-blend-multiply" />
          </span>
          <span className="display text-[14px] tracking-[0.18em] hidden sm:inline text-ink">
            WIU
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => selectTab((l as { tab?: string }).tab)}
              className="text-[14px] transition-colors relative group text-ink/70 hover:text-accent"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <a
            href="#entrar"
            className="hidden md:inline-flex text-[14px] px-3 py-2 transition-colors text-ink/80 hover:text-ink"
          >
            Entrar
          </a>
          <a
            href="#plataforma"
            className="hidden sm:inline-flex items-center gap-2 bg-accent text-paper text-[13px] uppercase tracking-[0.18em] font-semibold px-5 py-3 hover:bg-ink transition-colors"
          >
            Comprar
          </a>

          <button
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center border transition-colors border-ink/20 text-ink"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden border-t border-ink/10 bg-paper transition-all duration-300 ${
          open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => selectTab((l as { tab?: string }).tab)}
              className="flex items-center justify-between py-4 border-b border-ink/10 text-ink text-lg display"
            >
              {l.label}
              <span className="text-accent">→</span>
            </a>
          ))}
          <div className="flex gap-3 mt-5 mb-2">
            <a
              href="#entrar"
              onClick={onNavClick}
              className="flex-1 text-center border border-ink/30 py-3.5 text-[13px] uppercase tracking-[0.18em] font-semibold"
            >
              Entrar
            </a>
            <a
              href="#plataforma"
              onClick={onNavClick}
              className="flex-1 text-center bg-accent text-paper py-3.5 text-[13px] uppercase tracking-[0.18em] font-semibold"
            >
              Comprar
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
