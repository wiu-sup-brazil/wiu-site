type IconProps = { className?: string };

const base = "stroke-current fill-none";

export function KiteIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13c4-6 9-9 13-9s9 3 13 9" />
      <path d="M3 13c3.5 4 8 7 13 8 5-1 9.5-4 13-8" />
      <path d="M10.5 5.5 12 20.2M21.5 5.5 20 20.2M16 4v17" />
      <path d="M16 21v5.5" />
      <path d="M12.5 28h7" />
    </svg>
  );
}

export function BoardIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 2c3.2 3.6 4.8 8.4 4.8 14S19.2 26.4 16 30c-3.2-3.6-4.8-8.4-4.8-14S12.8 5.6 16 2Z" />
      <path d="M12.4 11.5h7.2M12.4 20.5h7.2" />
      <path d="M14 9.5h4M14 22.5h4" />
    </svg>
  );
}

export function BarIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 18h22" />
      <path d="M5 18v-2.5M27 18v-2.5" />
      <path d="M9 18 14 4M23 18 18 4" />
      <path d="M16 18v7" />
      <circle cx="16" cy="27" r="2.2" />
    </svg>
  );
}

export function HarnessIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12c0 7 5.4 12 12 12s12-5 12-12" />
      <path d="M4 12c0-2.6 5.4-4.5 12-4.5S28 9.4 28 12" />
      <path d="M11 19.5c1.6 1.2 3.2 1.8 5 1.8s3.4-.6 5-1.8" />
      <path d="M16 21.3v3.2M13.5 26.5c1.2-1.4 3.8-1.4 5 0" />
    </svg>
  );
}

export function AccessoryIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="12" width="12" height="16" rx="1.5" />
      <path d="M13 12V7.5h6V12" />
      <path d="M16 3v4.5" />
      <path d="M10 18h12" />
      <path d="M22 22h5" />
    </svg>
  );
}

export function WingIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10c6-4 12-5 17-3s10 7 11 12c-6 1-12-.5-17-4S6 6.5 2 10Z" />
      <path d="M9 8.5 22 21" />
      <path d="M13.5 13.5c2 .4 4 1.6 5.5 3.2" />
    </svg>
  );
}

export function FoilIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4h16" />
      <path d="M16 4v18" />
      <path d="M4 22c4-2.5 8-3.8 12-3.8S24 19.5 28 22" />
      <path d="M11 27c1.8-1 3.5-1.5 5-1.5s3.2.5 5 1.5" />
      <path d="M16 22v3.5" />
    </svg>
  );
}

export function GridIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="10" height="10" rx="1" />
      <rect x="18" y="4" width="10" height="10" rx="1" />
      <rect x="4" y="18" width="10" height="10" rx="1" />
      <rect x="18" y="18" width="10" height="10" rx="1" />
    </svg>
  );
}

/** Mapeia a categoria vinda do banco para o ícone certo. */
export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const map: Record<string, (p: IconProps) => JSX.Element> = {
    Kite: KiteIcon, Kites: KiteIcon,
    Prancha: BoardIcon, Pranchas: BoardIcon,
    Barra: BarIcon, Barras: BarIcon,
    "Trapézio": HarnessIcon, "Trapézios": HarnessIcon,
    "Acessório": AccessoryIcon, "Acessórios": AccessoryIcon,
    Bomba: AccessoryIcon, Colete: HarnessIcon, Capacete: AccessoryIcon,
    Wing: WingIcon, Foil: FoilIcon,
    "Kit Completo": GridIcon, Todos: GridIcon,
  };
  const Ico = map[category] || GridIcon;
  return <Ico className={className} />;
}
