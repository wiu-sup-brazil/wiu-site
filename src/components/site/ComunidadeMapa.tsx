import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useInView } from "motion/react";
import { X, Send, Wind, MapPin, Plus, Minus, Maximize2, Users, Check, CheckCheck, CalendarClock, Navigation2, CloudSun, Search, Waves, Droplets, UserPlus, Sparkles, ChevronUp, ChevronDown, Minimize2, MousePointerClick } from "lucide-react";

/**
 * Mapa da comunidade v11.
 *
 * Muda em relação à v10:
 *  - Desktop: mapa começa em modo compacto (aspect 16/5) com overlay CTA
 *    "Toque pra explorar o mapa". Wheel e drag passam direto pra página.
 *    Ao clicar o overlay, expande pro aspect 16/12 usual, todo o resto
 *    (zoom, drag, riders, painéis) volta a funcionar como na v10.
 *  - Handle de scroll da página na borda direita do mapa (só expandido):
 *    setinha pra cima, setinha pra baixo (segurar = scroll contínuo) e
 *    botão de minimizar (volta pro modo compacto).
 *  - Mobile ignora o modo compacto: sempre expandido (comportamento igual v10).
 */

/* ============================================================
 *  Projeção geográfica, lat/lng -> coordenadas do viewBox 100x100
 * ============================================================ */

const LAT_MAX = -1.5;   // topo do mapa (norte)
const LAT_MIN = -17.6;  // base do mapa (sul)
const LNG_MIN = -44.5;  // esquerda do mapa (oeste)
const LNG_MAX = -34.5;  // direita do mapa (leste)

function proj(lat: number, lng: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
  return { x, y };
}

/* ============================================================
 *  Spots (lat/lng reais)
 * ============================================================ */

type Rider = { id: string; name: string; spot: string; lat: number; lng: number; level: string };
type Spot = { name: string; lat: number; lng: number; principal?: boolean };

const SPOTS: Spot[] = [
  // MARANHÃO
  { name: "Lençóis", lat: -2.6, lng: -43.0, principal: true },
  { name: "Atins", lat: -2.58, lng: -42.73 },

  // PIAUÍ
  { name: "Barra Grande", lat: -2.9, lng: -41.68 },

  // CEARÁ norte, litoral horizontal
  { name: "Tatajuba", lat: -2.92, lng: -41.03 },
  { name: "Jericoacoara", lat: -2.79, lng: -40.51, principal: true },
  { name: "Preá", lat: -2.85, lng: -40.35 },
  { name: "Ilha do Guajiru", lat: -2.95, lng: -39.99 },
  { name: "Icaraizinho", lat: -3.02, lng: -39.55 },
  { name: "Mundaú", lat: -3.09, lng: -39.4 },
  { name: "Flecheiras", lat: -3.23, lng: -39.27 },
  { name: "Paracuru", lat: -3.4, lng: -39.03 },
  { name: "Taíba", lat: -3.5, lng: -38.9 },
  { name: "Cumbuco", lat: -3.62, lng: -38.73 },
  { name: "Fortaleza", lat: -3.72, lng: -38.54, principal: true },

  // RIO GRANDE DO NORTE (curva pra sul no cabo de São Roque)
  { name: "Galinhos", lat: -5.09, lng: -36.27 },
  { name: "S. M. Gostoso", lat: -5.12, lng: -35.63 },
  { name: "Natal", lat: -5.78, lng: -35.2, principal: true },

  // PARAÍBA
  { name: "Cabedelo", lat: -6.97, lng: -34.83 },
  { name: "João Pessoa", lat: -7.12, lng: -34.86 },

  // PERNAMBUCO
  { name: "Porto de Galinhas", lat: -8.5, lng: -34.99, principal: true },

  // ALAGOAS
  { name: "Maragogi", lat: -9.0, lng: -35.22 },
  { name: "Maceió", lat: -9.66, lng: -35.73, principal: true },

  // SERGIPE / BAHIA
  { name: "Mangue Seco", lat: -11.44, lng: -37.11 },
  { name: "Praia do Forte", lat: -12.57, lng: -38.0 },
  { name: "Salvador", lat: -12.97, lng: -38.5, principal: true },
  { name: "Prado", lat: -17.34, lng: -39.22 },
];

// Cidades adicionais que aparecem só em zoom alto, sem ponto verde.
// Servem de referência geográfica.
const CIDADES_REF: { name: string; lat: number; lng: number }[] = [
  { name: "São Luís", lat: -2.53, lng: -44.3 },
  { name: "Parnaíba", lat: -2.9, lng: -41.78 },
  { name: "Camocim", lat: -2.9, lng: -40.85 },
  { name: "Acaraú", lat: -2.89, lng: -40.12 },
  { name: "Aracati", lat: -4.55, lng: -37.77 },
  { name: "Icapuí", lat: -4.7, lng: -37.35 },
  { name: "Areia Branca", lat: -4.95, lng: -37.13 },
  { name: "Macau", lat: -5.11, lng: -36.63 },
  { name: "Touros", lat: -5.2, lng: -35.46 },
  { name: "Baía Formosa", lat: -6.37, lng: -35.0 },
  { name: "Recife", lat: -8.05, lng: -34.87 },
  { name: "Aracaju", lat: -10.9, lng: -37.07 },
  { name: "Ilhéus", lat: -14.79, lng: -39.03 },
  { name: "Porto Seguro", lat: -16.44, lng: -39.06 },
];

// Rótulos de estados (posicionados pra interior, não na costa)
const ESTADOS: { name: string; lat: number; lng: number; size?: "lg" | "md" | "sm" }[] = [
  { name: "MARANHÃO", lat: -5.5, lng: -44.0, size: "lg" },
  { name: "PIAUÍ", lat: -7.5, lng: -42.5, size: "lg" },
  { name: "CEARÁ", lat: -5.5, lng: -39.5, size: "lg" },
  { name: "R. G. NORTE", lat: -6.3, lng: -37.5, size: "md" },
  { name: "PARAÍBA", lat: -7.4, lng: -36.8, size: "md" },
  { name: "PERNAMBUCO", lat: -8.5, lng: -37.5, size: "md" },
  { name: "ALAGOAS", lat: -9.5, lng: -36.7, size: "md" },
  { name: "SERGIPE", lat: -10.7, lng: -37.7, size: "sm" },
  { name: "BAHIA", lat: -13.5, lng: -42.0, size: "lg" },
];

/* ============================================================
 *  Contorno da costa, pontos reais aproximados
 *  Sequência de latitude decrescente (norte -> sul) seguindo o litoral.
 * ============================================================ */

const COAST: [number, number][] = [
  // Costa norte MA, Baía de São Marcos e Golfão
  [-1.55, -44.5],
  [-2.0, -44.35],
  [-2.4, -44.05],
  [-2.55, -43.55],
  [-2.55, -43.15],  // Lençóis
  [-2.55, -42.8],   // Atins
  // Delta do Parnaíba
  [-2.75, -42.4],
  [-2.95, -42.05],
  [-2.85, -41.75],  // Barra Grande, PI
  [-2.85, -41.35],
  [-2.9, -41.0],    // Camocim
  [-2.82, -40.65],
  [-2.79, -40.5],   // Jericoacoara
  [-2.83, -40.35],  // Preá
  [-2.9, -40.15],
  [-2.95, -39.99],  // Guajiru
  [-3.0, -39.75],
  [-3.03, -39.55],
  [-3.11, -39.4],
  [-3.22, -39.27],  // Flecheiras
  [-3.4, -39.03],   // Paracuru
  [-3.5, -38.9],    // Taíba
  [-3.62, -38.73],  // Cumbuco
  [-3.72, -38.54],  // Fortaleza
  [-3.86, -38.35],
  [-4.15, -37.9],
  [-4.4, -37.6],
  [-4.55, -37.77],  // Aracati (baía)
  [-4.7, -37.35],   // Icapuí
  [-4.85, -37.15],
  [-5.0, -36.9],
  [-5.05, -36.55],
  [-5.09, -36.27],  // Galinhos
  [-5.1, -35.95],
  [-5.12, -35.63],  // S. M. Gostoso
  [-5.13, -35.4],
  // Cabo de São Roque, curva 90° pra sul
  [-5.25, -35.29],
  [-5.5, -35.24],
  [-5.78, -35.2],   // Natal
  [-6.2, -35.1],
  [-6.5, -35.03],
  [-6.85, -34.86],
  [-6.97, -34.83],  // Cabedelo
  [-7.12, -34.86],  // João Pessoa
  [-7.5, -34.83],
  [-7.85, -34.83],
  [-8.05, -34.87],  // Recife
  [-8.3, -34.93],
  [-8.5, -34.99],   // Porto de Galinhas
  [-8.75, -35.08],
  [-9.0, -35.17],   // Maragogi
  [-9.4, -35.45],
  [-9.66, -35.73],  // Maceió
  [-10.0, -36.05],
  [-10.5, -36.5],
  [-10.9, -36.9],   // Barra Aracaju
  [-11.2, -37.05],
  [-11.44, -37.11], // Mangue Seco
  [-11.7, -37.2],
  [-11.95, -37.55],
  // Baía de Todos os Santos, indenta pra oeste
  [-12.25, -37.85],
  [-12.5, -38.0],   // Praia do Forte
  [-12.85, -38.35],
  [-12.97, -38.5],  // Salvador
  // Sul da BA, contorno até Prado
  [-13.3, -38.9],
  [-13.8, -38.95],
  [-14.4, -38.98],
  [-14.79, -39.03], // Ilhéus
  [-15.4, -38.95],
  [-16.0, -38.98],
  [-16.44, -39.06], // Porto Seguro
  [-17.0, -39.15],
  [-17.34, -39.22], // Prado
  [-17.6, -39.3],
];

/* ============================================================
 *  Dados de vento / maré / grupos (mantidos)
 * ============================================================ */

const SPOT_WIND: Record<string, { avg: number; gust: number; dir: string; deg: number }> = {
  "Lençóis": { avg: 25, gust: 32, dir: "ENE", deg: 67 },
  "Atins": { avg: 26, gust: 33, dir: "ENE", deg: 67 },
  "Barra Grande": { avg: 24, gust: 29, dir: "ENE", deg: 67 },
  "Tatajuba": { avg: 25, gust: 31, dir: "E", deg: 90 },
  "Jericoacoara": { avg: 24, gust: 30, dir: "E", deg: 90 },
  "Preá": { avg: 26, gust: 32, dir: "E", deg: 90 },
  "Ilha do Guajiru": { avg: 25, gust: 30, dir: "E", deg: 90 },
  "Icaraizinho": { avg: 24, gust: 29, dir: "E", deg: 90 },
  "Mundaú": { avg: 21, gust: 25, dir: "E", deg: 90 },
  "Flecheiras": { avg: 20, gust: 24, dir: "ENE", deg: 67 },
  "Paracuru": { avg: 21, gust: 26, dir: "E", deg: 90 },
  "Taíba": { avg: 23, gust: 29, dir: "ESE", deg: 112 },
  "Cumbuco": { avg: 22, gust: 27, dir: "E", deg: 90 },
  "Fortaleza": { avg: 18, gust: 23, dir: "SSE", deg: 157 },
  "Galinhos": { avg: 22, gust: 28, dir: "E", deg: 90 },
  "S. M. Gostoso": { avg: 23, gust: 29, dir: "E", deg: 90 },
  "Natal": { avg: 20, gust: 25, dir: "SE", deg: 135 },
  "Cabedelo": { avg: 17, gust: 22, dir: "SE", deg: 135 },
  "João Pessoa": { avg: 16, gust: 21, dir: "SE", deg: 135 },
  "Porto de Galinhas": { avg: 18, gust: 24, dir: "SE", deg: 135 },
  "Maragogi": { avg: 16, gust: 22, dir: "SE", deg: 135 },
  "Maceió": { avg: 15, gust: 20, dir: "SE", deg: 135 },
  "Mangue Seco": { avg: 22, gust: 28, dir: "NE", deg: 45 },
  "Praia do Forte": { avg: 15, gust: 20, dir: "NE", deg: 45 },
  "Salvador": { avg: 13, gust: 18, dir: "E", deg: 90 },
  "Prado": { avg: 14, gust: 19, dir: "NE", deg: 45 },
};

const SPOT_TIDES: Record<string, { level: string; height: string; next: string; waterTemp: number }> = {
  "Lençóis": { level: "Alta", height: "2.0m", next: "14:50 · Vazando", waterTemp: 28 },
  "Atins": { level: "Enchendo", height: "1.8m", next: "16:00 · Alta", waterTemp: 28 },
  "Barra Grande": { level: "Alta", height: "2.2m", next: "13:40 · Vazando", waterTemp: 29 },
  "Tatajuba": { level: "Vazando", height: "1.5m", next: "14:10 · Baixa", waterTemp: 29 },
  "Jericoacoara": { level: "Enchendo", height: "1.8m", next: "15:20 · Alta", waterTemp: 29 },
  "Preá": { level: "Alta", height: "1.9m", next: "14:00 · Vazando", waterTemp: 29 },
  "Ilha do Guajiru": { level: "Enchendo", height: "1.7m", next: "15:45 · Alta", waterTemp: 28 },
  "Icaraizinho": { level: "Alta", height: "1.8m", next: "13:30 · Vazando", waterTemp: 28 },
  "Mundaú": { level: "Vazando", height: "1.4m", next: "14:25 · Baixa", waterTemp: 27 },
  "Flecheiras": { level: "Enchendo", height: "1.5m", next: "15:10 · Alta", waterTemp: 27 },
  "Paracuru": { level: "Alta", height: "2.0m", next: "13:50 · Vazando", waterTemp: 28 },
  "Taíba": { level: "Vazando", height: "1.6m", next: "14:40 · Baixa", waterTemp: 28 },
  "Cumbuco": { level: "Alta", height: "2.1m", next: "13:15 · Vazando", waterTemp: 28 },
  "Fortaleza": { level: "Enchendo", height: "1.8m", next: "16:20 · Alta", waterTemp: 27 },
  "Galinhos": { level: "Alta", height: "1.9m", next: "14:15 · Vazando", waterTemp: 27 },
  "S. M. Gostoso": { level: "Enchendo", height: "1.6m", next: "15:30 · Alta", waterTemp: 27 },
  "Natal": { level: "Alta", height: "1.7m", next: "13:55 · Vazando", waterTemp: 27 },
  "Cabedelo": { level: "Vazando", height: "1.5m", next: "14:20 · Baixa", waterTemp: 27 },
  "João Pessoa": { level: "Vazando", height: "1.4m", next: "14:35 · Baixa", waterTemp: 27 },
  "Porto de Galinhas": { level: "Alta", height: "1.6m", next: "13:40 · Vazando", waterTemp: 28 },
  "Maragogi": { level: "Enchendo", height: "1.5m", next: "15:05 · Alta", waterTemp: 28 },
  "Maceió": { level: "Alta", height: "1.4m", next: "14:00 · Vazando", waterTemp: 28 },
  "Mangue Seco": { level: "Vazando", height: "1.6m", next: "14:45 · Baixa", waterTemp: 27 },
  "Praia do Forte": { level: "Alta", height: "1.5m", next: "13:25 · Vazando", waterTemp: 26 },
  "Salvador": { level: "Enchendo", height: "1.7m", next: "15:40 · Alta", waterTemp: 26 },
  "Prado": { level: "Alta", height: "1.4m", next: "14:10 · Vazando", waterTemp: 25 },
};

type Grupo = { id: string; spot: string; rota: string; horario: string; dia: string; confirmados: string[] };

const DEMO_GROUPS: Grupo[] = [
  { id: "g1", spot: "Cumbuco", rota: "Cumbuco → Taíba", horario: "12h – 15h", dia: "Hoje", confirmados: ["Léo", "Marina", "Rafa", "Pedrão"] },
  { id: "g2", spot: "Preá", rota: "Preá → Jericoacoara", horario: "9h – 12h", dia: "Amanhã", confirmados: ["Thibaut", "Sofia"] },
  { id: "g3", spot: "Ilha do Guajiru", rota: "Downwind Guajiru → Tatajuba", horario: "13h30 – 17h", dia: "Sábado", confirmados: ["Caio", "Duda", "Léo"] },
];

// Riders demo, cada um em lat/lng próximo do spot que ele curte
const DEMO_RIDERS: Rider[] = [
  { id: "r1",  name: "Léo",      spot: "Cumbuco",           lat: -3.60, lng: -38.72, level: "Avançado"     },
  { id: "r2",  name: "Marina",   spot: "Cumbuco",           lat: -3.64, lng: -38.75, level: "Intermediário" },
  { id: "r3",  name: "Pedrão",   spot: "Taíba",             lat: -3.50, lng: -38.88, level: "Avançado"     },
  { id: "r4",  name: "Ana",      spot: "Paracuru",          lat: -3.39, lng: -39.02, level: "Iniciante"    },
  { id: "r5",  name: "Duda",     spot: "Flecheiras",        lat: -3.22, lng: -39.26, level: "Avançado"     },
  { id: "r6",  name: "Rafa",     spot: "Icaraizinho",       lat: -3.01, lng: -39.54, level: "Intermediário" },
  { id: "r7",  name: "Caio",     spot: "Ilha do Guajiru",   lat: -2.94, lng: -39.98, level: "Avançado"     },
  { id: "r8",  name: "Thibaut",  spot: "Preá",              lat: -2.84, lng: -40.34, level: "Avançado"     },
  { id: "r9",  name: "Sofia",    spot: "Jericoacoara",      lat: -2.78, lng: -40.50, level: "Intermediário" },
  { id: "r10", name: "Marcos",   spot: "Barra Grande",      lat: -2.89, lng: -41.67, level: "Intermediário" },
  { id: "r11", name: "Bia",      spot: "Atins",             lat: -2.58, lng: -42.73, level: "Avançado"     },
  { id: "r12", name: "Fred",     spot: "Natal",             lat: -5.77, lng: -35.19, level: "Avançado"     },
  { id: "r13", name: "Camila",   spot: "Porto de Galinhas", lat: -8.49, lng: -34.98, level: "Intermediário" },
  { id: "r14", name: "Vinícius", spot: "Maceió",            lat: -9.65, lng: -35.72, level: "Avançado"     },
  { id: "r15", name: "Larissa",  spot: "Salvador",          lat: -12.96, lng: -38.49, level: "Iniciante"   },
  { id: "r16", name: "Bruno",    spot: "Praia do Forte",    lat: -12.56, lng: -37.99, level: "Avançado"    },
];

const MIN_Z = 1;
const MAX_Z = 8; // aumentado, permite aproximação Windy-style

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const fn = () => setM(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return m;
}

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/* ============================================================
 *  Geração do path da costa, curva suave interpolando os pontos
 * ============================================================ */

function coastPathD(): string {
  const pts = COAST.map(([lat, lng]) => proj(lat, lng));

  // Suaviza com Catmull-Rom -> Bezier (cardinal 0.5)
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// Path fechado (continente), curva da costa + volta pelo interior/oeste
function landPathD(): string {
  const coast = coastPathD();
  // Fecha o polígono descendo pra esquerda-inferior e subindo pela esquerda,
  // representando o interior do Brasil (que sai pela borda oeste do viewBox)
  return `${coast} L 0 100 L 0 0 Z`;
}

/* ============================================================
 *  Componentes reutilizados (Compass, WindParticles, BrasilInset)
 * ============================================================ */

function Compass({ label, value, deg, accent }: { label: string; value: number; deg: number; accent: string }) {
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 88 88" className="w-[62px] md:w-[72px]">
        <circle cx="44" cy="44" r="40" fill="none" stroke="#0c1a20" strokeOpacity="0.1" strokeWidth="1.5" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          const main = i % 2 === 0;
          const r1 = main ? 33 : 35.5, r2 = 40;
          return (
            <line key={i}
              x1={44 + r1 * Math.sin(a)} y1={44 - r1 * Math.cos(a)}
              x2={44 + r2 * Math.sin(a)} y2={44 - r2 * Math.cos(a)}
              stroke="#0c1a20" strokeOpacity={main ? 0.35 : 0.15} strokeWidth={main ? 1.6 : 1} strokeLinecap="round" />
          );
        })}
        <text x="44" y="12" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0c1a20" fillOpacity="0.55">N</text>
        <text x="79" y="47" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0c1a20" fillOpacity="0.4">L</text>
        <text x="44" y="83" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0c1a20" fillOpacity="0.4">S</text>
        <text x="9" y="47" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0c1a20" fillOpacity="0.4">O</text>
        <g transform={`rotate(${deg} 44 44)`}>
          <path d="M44 14 L49.5 26 L44 22.8 L38.5 26 Z" fill={accent} style={{ filter: `drop-shadow(0 1px 4px ${accent}66)` }} />
          <path d="M44 74 L46.5 66 L44 68 L41.5 66 Z" fill="#0c1a20" fillOpacity="0.2" />
        </g>
        <text x="44" y="48" textAnchor="middle" fontSize="19" fontWeight="800" fill="#0c1a20">{value}</text>
        <text x="44" y="58" textAnchor="middle" fontSize="7" fontWeight="600" fill="#0c1a20" fillOpacity="0.45" letterSpacing="1">NÓS</text>
      </svg>
      <span className="mt-0.5 text-[8px] uppercase tracking-[0.16em] font-semibold" style={{ color: accent }}>{label}</span>
    </div>
  );
}

function SpotPanel({ spot, onClose, compact }: { spot: string; onClose?: () => void; compact?: boolean }) {
  const w = SPOT_WIND[spot] || { avg: 20, gust: 25, dir: "E", deg: 90 };
  return (
    <div className={`rounded-2xl border border-black/10 bg-white ${compact ? "px-3 py-2.5" : "p-3.5"} shadow-2xl shadow-black/40`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-[#0098c0] shrink-0" />
            <span className="font-semibold text-[#0c1a20] text-[13px] truncate">{spot}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#0c1a20]/55">
            <Navigation2 className="h-2.5 w-2.5" style={{ transform: `rotate(${w.deg}deg)` }} />
            Vento de {w.dir}, agora
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-[#0c1a20]/45 hover:text-[#0c1a20] hover:bg-black/5 transition shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="mt-2 flex items-start justify-center gap-4">
        <Compass label="Vento médio" value={w.avg} deg={w.deg} accent="#18b26b" />
        <Compass label="Rajada" value={w.gust} deg={w.deg} accent="#0098c0" />
      </div>
      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (w.avg / 40) * 100)}%`, background: "linear-gradient(90deg,#18b26b,#a5d922)" }} />
      </div>
    </div>
  );
}

function WindParticles() {
  const lines = useMemo(
    () => Array.from({ length: 44 }, (_, i) => ({
      y: 2 + (i * 41) % 96, delay: (i * 0.31) % 6, dur: 4.5 + (i % 5) * 1.4,
      len: 24 + (i % 4) * 20, op: 0.10 + (i % 3) * 0.08,
    })), []
  );
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      {lines.map((l, i) => (
        <span key={i} className="absolute h-px rounded-full"
          style={{
            top: `${l.y}%`, left: "-15%", width: `${l.len}px`,
            background: "linear-gradient(90deg, transparent, rgba(200,235,255,0.85), transparent)",
            opacity: l.op, animation: `wiu-wind ${l.dur}s linear ${l.delay}s infinite`,
          }} />
      ))}
      <style>{`
        @keyframes wiu-wind { from { transform: translateX(0); } to { transform: translateX(130vw); } }
        @keyframes wiu-ping { 0% { transform: scale(1); opacity: 0.7; } 80%,100% { transform: scale(2.6); opacity: 0; } }
      `}</style>
    </div>
  );
}

function BrasilInset() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M 25 15 L 40 12 Q 55 10 68 15 Q 78 20 85 30 Q 92 40 90 50 Q 88 62 82 72 Q 75 82 65 88 Q 55 92 45 90 Q 35 88 28 82 Q 18 75 15 65 Q 10 55 12 45 Q 15 30 20 22 Q 22 18 25 15 Z"
        fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" strokeLinejoin="round"
      />
      <path
        d="M 55 18 Q 68 16 78 22 Q 87 28 89 38 Q 88 50 82 60 Q 78 68 72 70 Q 65 68 62 60 Q 60 48 60 38 Q 58 28 55 22 Q 55 20 55 18 Z"
        fill="#00b4d8" fillOpacity="0.35" stroke="#3fd0f0" strokeWidth="0.8"
      />
      <circle cx="82" cy="30" r="1.6" fill="#39e58c">
        <animate attributeName="r" values="1.6;2.6;1.6" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.4;1" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <text x="50" y="98" fontSize="6" fill="white" fillOpacity="0.55" textAnchor="middle" fontWeight="600" letterSpacing="0.5">NORDESTE</text>
    </svg>
  );
}

/* ============================================================
 *  Componente principal
 * ============================================================ */

export function ComunidadeMapa() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-15%" });
  const isMobile = useIsMobile();

  const [open, setOpen] = useState<Rider | null>(null);
  const [showGroups, setShowGroups] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<Grupo[]>(DEMO_GROUPS);
  const [expanded, setExpanded] = useState(false);
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;

  const viewRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0, s: 1 });
  const tRef = useRef(t);
  tRef.current = t;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastTap = useRef(0);
  const [cursor, setCursor] = useState<{ lat: number; lng: number } | null>(null);

  // Animação zoom/pan (RAF) + estado salvo pré-zoom-ao-rider
  const rafId = useRef<number | null>(null);
  const preZoomState = useRef<{ x: number; y: number; s: number } | null>(null);

  const cancelAnim = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const animateTo = useCallback((target: { x: number; y: number; s: number }, duration = 550) => {
    cancelAnim();
    const start = { ...tRef.current };
    const t0 = performance.now();
    const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const e = easeOut(p);
      setT({
        x: start.x + (target.x - start.x) * e,
        y: start.y + (target.y - start.y) * e,
        s: start.s + (target.s - start.s) * e,
      });
      if (p < 1) {
        rafId.current = requestAnimationFrame(step);
      } else {
        rafId.current = null;
      }
    };
    rafId.current = requestAnimationFrame(step);
  }, [cancelAnim]);

  const clamp = useCallback((x: number, y: number, s: number) => {
    const el = viewRef.current;
    if (!el) return { x, y, s };
    const { width: W, height: H } = el.getBoundingClientRect();
    const minX = W * (1 - s), minY = H * (1 - s);
    return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)), s };
  }, []);

  const zoomAt = useCallback((px: number, py: number, ns: number) => {
    const { x, y, s } = tRef.current;
    const k = ns / s;
    setT(clamp(px - (px - x) * k, py - (py - y) * k, ns));
  }, [clamp]);

  function screenToGeo(px: number, py: number) {
    const el = viewRef.current;
    if (!el) return null;
    const { width: W, height: H } = el.getBoundingClientRect();
    const { x, y, s } = tRef.current;
    // pixel do viewport -> pixel do mapa base
    const mx = (px - x) / s;
    const my = (py - y) / s;
    // 0..1 no mapa base
    const nx = mx / W;
    const ny = my / H;
    const lng = LNG_MIN + nx * (LNG_MAX - LNG_MIN);
    const lat = LAT_MAX - ny * (LAT_MAX - LAT_MIN);
    return { lat, lng };
  }

  function isMapInteractive() {
    // No mobile o mapa sempre é interativo. No desktop precisa estar expandido.
    return isMobile || expandedRef.current;
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!isMapInteractive()) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) { dragging.current = true; moved.current = false; }
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: tRef.current.s };
      dragging.current = false;
    }
    // qualquer interação manual cancela a animação em curso
    cancelAnim();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isMapInteractive()) return;
    const prev = pointers.current.get(e.pointerId);
    if (prev) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size === 2 && pinch.current) {
        const [a, b] = [...pointers.current.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const ns = Math.min(MAX_Z, Math.max(MIN_Z, pinch.current.s * (d / pinch.current.d)));
        const rect = viewRef.current!.getBoundingClientRect();
        zoomAt((a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top, ns);
        return;
      }
      if (dragging.current) {
        const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
        const { x, y, s } = tRef.current;
        setT(clamp(x + dx, y + dy, s));
      }
    }
    // atualiza coordenadas do cursor (só desktop)
    if (!isMobile && viewRef.current) {
      const rect = viewRef.current.getBoundingClientRect();
      const g = screenToGeo(e.clientX - rect.left, e.clientY - rect.top);
      if (g) setCursor(g);
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!isMapInteractive()) return;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) {
      dragging.current = false;
      if (!moved.current && e.pointerType === "touch") {
        const now = Date.now();
        if (now - lastTap.current < 300) {
          const rect = viewRef.current!.getBoundingClientRect();
          const px = e.clientX - rect.left, py = e.clientY - rect.top;
          const s = tRef.current.s;
          zoomAt(px, py, s >= MAX_Z - 0.1 ? MIN_Z : Math.min(MAX_Z, s * 1.7));
        }
        lastTap.current = now;
      }
    }
  }

  function onDoubleClick(e: React.MouseEvent) {
    if (!isMapInteractive()) return;
    const rect = viewRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const s = tRef.current.s;
    zoomAt(px, py, s >= MAX_Z - 0.1 ? MIN_Z : Math.min(MAX_Z, s * 1.7));
  }

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Só sequestra o wheel se o mapa está interativo. Caso contrário deixa
      // o scroll da página seguir naturalmente.
      if (!isMapInteractive()) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const s = tRef.current.s;
      const ns = Math.min(MAX_Z, Math.max(MIN_Z, s * (e.deltaY < 0 ? 1.15 : 0.87)));
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, ns);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  function zoomBtn(dir: 1 | -1) {
    const el = viewRef.current!;
    const { width, height } = el.getBoundingClientRect();
    const s = tRef.current.s;
    const ns = Math.min(MAX_Z, Math.max(MIN_Z, s * (dir > 0 ? 1.4 : 0.71)));
    zoomAt(width / 2, height / 2, ns);
  }

  function riderClick(r: Rider) {
    if (moved.current) return;
    setOpen(r);
    if (isMobile) return;

    const el = viewRef.current;
    if (!el) return;
    const { width: W, height: H } = el.getBoundingClientRect();
    // Posição do rider no mapa base (scale = 1), em pixels
    const p = proj(r.lat, r.lng);
    const rx = (p.x / 100) * W;
    const ry = (p.y / 100) * H;

    // Zoom alvo: 3x. Rider vai pra ~32% horizontal (sobra ~44% pro chat na
    // direita) e ~48% vertical (levemente acima do centro pra dar respiro
    // aos painéis embaixo).
    const ns = 3;
    const targetX = W * 0.32 - rx * ns;
    const targetY = H * 0.48 - ry * ns;
    const target = clamp(targetX, targetY, ns);

    // Salva estado atual antes de puxar
    preZoomState.current = { ...tRef.current };
    animateTo(target, 600);
  }

  function closeChat() {
    setOpen(null);
    if (preZoomState.current && !isMobile) {
      animateTo(preZoomState.current, 550);
    }
    preZoomState.current = null;
  }

  useEffect(() => {
    return () => cancelAnim();
  }, [cancelAnim]);

  // Page scroll contínuo (segurar setinha na borda direita do mapa)
  const scrollDir = useRef<-1 | 0 | 1>(0);
  const scrollRaf = useRef<number | null>(null);

  const stopPageScroll = useCallback(() => {
    scrollDir.current = 0;
    if (scrollRaf.current !== null) {
      cancelAnimationFrame(scrollRaf.current);
      scrollRaf.current = null;
    }
  }, []);

  const startPageScroll = useCallback((dir: -1 | 1) => {
    scrollDir.current = dir;
    if (scrollRaf.current !== null) return;
    const tick = () => {
      if (scrollDir.current !== 0) {
        window.scrollBy(0, scrollDir.current * 9);
        scrollRaf.current = requestAnimationFrame(tick);
      } else {
        scrollRaf.current = null;
      }
    };
    scrollRaf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => stopPageScroll();
  }, [stopPageScroll]);

  // Minimizar (voltar pro modo compacto)
  function collapseMap() {
    stopPageScroll();
    closeChat();
    setShowGroups(false);
    setShowForecast(false);
    setT({ x: 0, y: 0, s: 1 });
    setExpanded(false);
  }

  // Handlers de grupos passados pro ChatCard
  const inviteToGroup = useCallback((groupId: string, riderName: string) => {
    setGroups((prev) => prev.map((g) => {
      if (g.id !== groupId) return g;
      if (g.confirmados.includes(riderName)) return g;
      return { ...g, confirmados: [...g.confirmados, riderName] };
    }));
    // Convidante entra automático como confirmado nesse grupo
    setJoined((prev) => new Set(prev).add(groupId));
  }, []);

  const createGroup = useCallback((rota: string, dia: string, horario: string, spot: string, riderName: string) => {
    const id = `g_${Date.now()}`;
    const novoGrupo: Grupo = {
      id, spot, rota, dia, horario,
      confirmados: [riderName],
    };
    setGroups((prev) => [...prev, novoGrupo]);
    setJoined((prev) => new Set(prev).add(id));
    return id;
  }, []);

  const inv = 1 / t.s;
  const chatOpenDesktop = open && !isMobile;

  // No mobile o mapa é sempre expandido. No desktop começa colapsado.
  const isCollapsed = !isMobile && !expanded;

  // Level of detail baseado no zoom
  const showAllSpotNames = t.s >= 1.4;
  const showCidadesRef = t.s >= 2.2;
  const coastD = useMemo(() => coastPathD(), []);
  const landD = useMemo(() => landPathD(), []);

  return (
    <section id="comunidade" ref={sectionRef} className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #07222e 22%, #063246 55%, #07222e 88%, #0a0a0a 100%)" }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-32">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="max-w-3xl">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
            <span className="h-px w-10 bg-[#00b4d8]" /> Conheça a WIU
          </div>
          <h2 className="mt-6 display text-5xl md:text-7xl text-white leading-[0.92]">
            A comunidade está
            <br />
            <span className="serif italic normal-case tracking-normal text-[#3fd0f0]">no vento agora.</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl text-white/60 leading-relaxed max-w-xl">
            Do Maranhão à Bahia, a rota do vento que faz do Nordeste o paraíso mundial do kite.
            Arrasta, dá zoom, clica num ponto verde, vê o vento do pico e marca de velejar junto.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative mt-14 rounded-2xl overflow-hidden border border-white/10"
          style={{ boxShadow: "0 40px 120px -20px rgba(0,180,216,0.25), 0 20px 60px -30px rgba(0,0,0,0.8)" }}
        >
          <div
            ref={viewRef}
            className={`relative select-none touch-none ${isCollapsed ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"}`}
            style={{
              aspectRatio: isCollapsed ? "16 / 5" : "16 / 12",
              transition: "aspect-ratio 500ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={() => setCursor(null)}
            onDoubleClick={onDoubleClick}
          >
            <div className="absolute inset-0" style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, transformOrigin: "0 0" }}>
              {/* Oceano base */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(200deg, #08283f 0%, #0d4468 40%, #106a99 75%, #1584b8 100%)" }} />

              {/* Grid discreto de latitude/longitude, feeling Windy */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-25" aria-hidden>
                <defs>
                  <pattern id="wave" x="0" y="0" width="5" height="3" patternUnits="userSpaceOnUse">
                    <path d="M 0 1.5 Q 1.25 0.5 2.5 1.5 T 5 1.5" fill="none" stroke="#7fd6f5" strokeWidth="0.12" opacity="0.5" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="100" height="100" fill="url(#wave)" />
                {/* Meridianos */}
                {[-42, -40, -38, -36].map((lng) => {
                  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
                  return <line key={lng} x1={x} y1={0} x2={x} y2={100} stroke="#7fd6f5" strokeWidth="0.06" strokeDasharray="0.5 0.8" opacity="0.4" />;
                })}
                {/* Paralelos */}
                {[-4, -6, -8, -10, -12, -14, -16].map((lat) => {
                  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
                  return <line key={lat} x1={0} y1={y} x2={100} y2={y} stroke="#7fd6f5" strokeWidth="0.06" strokeDasharray="0.5 0.8" opacity="0.4" />;
                })}
              </svg>

              <WindParticles />

              {/* MAPA — CONTORNO REAL DO LITORAL */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                  <linearGradient id="terra9" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1f6647" />
                    <stop offset="50%" stopColor="#134a32" />
                    <stop offset="100%" stopColor="#0c3020" />
                  </linearGradient>
                  <radialGradient id="lencois9" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#5fd8f5" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#5fd8f5" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Continente (polígono fechado) */}
                <path d={landD} fill="url(#terra9)" />

                {/* Linha da costa em destaque */}
                <path d={coastD} fill="none" stroke="#e4d3a4" strokeWidth="0.35" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                <path d={coastD} fill="none" stroke="#f0dfae" strokeWidth="0.15" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />

                {/* Lençóis Maranhenses, dunas e lagoas */}
                {(() => {
                  const c = proj(-2.55, -43.0);
                  return (
                    <>
                      <circle cx={c.x} cy={c.y - 2} r="4" fill="url(#lencois9)" />
                      <ellipse cx={c.x - 2} cy={c.y - 2.5} rx="1.1" ry="0.5" fill="#5fd8f5" opacity="0.55" />
                      <ellipse cx={c.x + 1} cy={c.y - 2} rx="0.9" ry="0.45" fill="#5fd8f5" opacity="0.5" />
                      <ellipse cx={c.x - 0.8} cy={c.y - 1} rx="0.7" ry="0.35" fill="#5fd8f5" opacity="0.45" />
                    </>
                  );
                })()}

                {/* Rios (linhas azul-claro esparsas, dentro do continente) */}
                <path d={`M ${proj(-3.72,-38.54).x} ${proj(-3.72,-38.54).y} Q ${proj(-5.5,-39.5).x} ${proj(-5.5,-39.5).y} ${proj(-7,-40).x} ${proj(-7,-40).y}`} fill="none" stroke="#3fd0f0" strokeWidth="0.15" opacity="0.35" />
                <path d={`M ${proj(-2.9,-41.75).x} ${proj(-2.9,-41.75).y} Q ${proj(-5,-42.5).x} ${proj(-5,-42.5).y} ${proj(-7.5,-43).x} ${proj(-7.5,-43).y}`} fill="none" stroke="#3fd0f0" strokeWidth="0.15" opacity="0.3" />

                {/* Setas de vento animadas, tipo Windy, distribuídas no oceano */}
                <g opacity="0.35" fill="none" stroke="#8be0ff" strokeWidth="0.12" strokeLinecap="round">
                  {[
                    [10, 10], [30, 8], [50, 6], [70, 12], [88, 20],
                    [92, 35], [88, 50], [90, 65], [85, 80], [75, 90],
                    [55, 30], [40, 22], [25, 15], [80, 45], [78, 60],
                  ].map(([cx, cy], i) => (
                    <g key={i} transform={`translate(${cx} ${cy}) rotate(200)`}>
                      <line x1={-3} y1={0} x2={3} y2={0} />
                      <path d="M 1.5 -1 L 3 0 L 1.5 1" />
                    </g>
                  ))}
                </g>

                {/* Rosa dos ventos */}
                <g transform="translate(92 8)" opacity="0.4">
                  <circle cx="0" cy="0" r="3.5" fill="none" stroke="#ffffff" strokeWidth="0.15" />
                  <path d="M0 -3.5 L0.6 -0.6 L0 0 L-0.6 -0.6 Z" fill="#ffffff" />
                  <path d="M0 3.5 L0.6 0.6 L0 0 L-0.6 0.6 Z" fill="#ffffff" opacity="0.6" />
                  <path d="M3.5 0 L0.6 0.6 L0 0 L0.6 -0.6 Z" fill="#ffffff" opacity="0.6" />
                  <path d="M-3.5 0 L-0.6 0.6 L0 0 L-0.6 -0.6 Z" fill="#ffffff" opacity="0.6" />
                  <text x="0" y="-4.5" fontSize="1.6" fill="#ffffff" textAnchor="middle" fontWeight="700">N</text>
                </g>
              </svg>

              {/* RÓTULOS DE ESTADOS (compensam zoom) */}
              {ESTADOS.map((e) => {
                const p = proj(e.lat, e.lng);
                const base = e.size === "lg" ? 15 : e.size === "md" ? 12 : 10;
                return (
                  <div key={e.name} className="absolute pointer-events-none"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `translate(-50%,-50%) scale(${inv})` }}>
                    <span
                      className="uppercase font-bold whitespace-nowrap"
                      style={{
                        fontSize: `${base}px`,
                        color: "rgba(255,255,255,0.14)",
                        letterSpacing: "0.35em",
                        textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                      }}
                    >
                      {e.name}
                    </span>
                  </div>
                );
              })}

              {/* CIDADES DE REFERÊNCIA (LOD alto) */}
              <AnimatePresence>
                {showCidadesRef && CIDADES_REF.map((c) => {
                  const p = proj(c.lat, c.lng);
                  return (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute -translate-x-1/2 pointer-events-none"
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    >
                      <div className="flex flex-col items-center gap-0.5" style={{ transform: `scale(${inv})`, transformOrigin: "top center" }}>
                        <span className="h-1 w-1 rounded-full bg-white/45" />
                        <span
                          className="text-[8px] tracking-[0.06em] text-white/45 whitespace-nowrap"
                          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
                        >
                          {c.name}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* PINS DOS SPOTS */}
              {SPOTS.map((s) => {
                const p = proj(s.lat, s.lng);
                const visible = s.principal || showAllSpotNames;
                return (
                  <div key={s.name} className="absolute -translate-x-1/2 pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y + 1.5}%` }}>
                    <div className="flex flex-col items-center gap-0.5" style={{ transform: `scale(${inv})`, transformOrigin: "top center", opacity: visible ? 1 : 0, transition: "opacity 0.25s" }}>
                      <MapPin className={s.principal ? "h-3 w-3 text-white/70" : "h-2.5 w-2.5 text-white/40"} />
                      <span
                        className={
                          s.principal
                            ? "text-[9px] md:text-[10px] uppercase tracking-[0.16em] text-white/90 whitespace-nowrap font-semibold"
                            : "text-[7.5px] md:text-[8.5px] uppercase tracking-[0.12em] text-white/60 whitespace-nowrap font-medium"
                        }
                        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)" }}
                      >
                        {s.name}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* RIDERS */}
              {DEMO_RIDERS.map((r, i) => {
                const p = proj(r.lat, r.lng);
                return (
                  <motion.div
                    key={r.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 300, damping: 18 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <button
                      onClick={() => riderClick(r)}
                      className="relative block group"
                      style={{ transform: `scale(${inv})` }}
                      aria-label={`Falar com ${r.name} em ${r.spot}`}
                    >
                      <span className="absolute inset-0 rounded-full bg-[#39e58c]"
                        style={{ animation: "wiu-ping 2.4s cubic-bezier(0,0,0.2,1) infinite", animationDelay: `${i * 0.3}s` }} />
                      <span className="relative block h-3.5 w-3.5 md:h-4 md:w-4 rounded-full bg-[#39e58c] ring-2 ring-white/90 shadow-[0_0_14px_rgba(57,229,140,0.9)] transition-transform group-hover:scale-125" />
                      <span className="absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap rounded-full bg-black/85 backdrop-blur px-2.5 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {r.name}, {r.spot}
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* ============ HUD e painéis (só quando expandido) ============ */}
            {!isCollapsed && (
              <>
                {/* Contador de riders (topo esquerda) */}
                <div className="absolute top-3 left-3 md:top-4 md:left-4 flex items-center gap-2.5 rounded-full bg-black/50 backdrop-blur border border-white/10 px-3.5 py-2 pointer-events-none">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#39e58c] opacity-75" style={{ animation: "wiu-ping 1.8s infinite" }} />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#39e58c]" />
                  </span>
                  <span className="text-[11px] md:text-sm text-white font-medium tabular-nums">{DEMO_RIDERS.length} riders no vento agora</span>
                </div>

                {/* Vento + grupos (topo direita) */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 rounded-full bg-black/50 backdrop-blur border border-white/10 px-3.5 py-2">
                    <Wind className="h-3.5 w-3.5 text-[#3fd0f0]" />
                    <span className="text-[11px] md:text-sm text-white tabular-nums">22 nós, E</span>
                  </div>
                  <button
                    onClick={() => setShowGroups(true)}
                    className="flex items-center gap-2 rounded-full bg-[#00b4d8] px-3.5 py-2 text-[11px] md:text-sm font-semibold text-white shadow-lg shadow-[#00b4d8]/30 hover:brightness-110 transition"
                  >
                    <Users className="h-3.5 w-3.5" /> Grupos de velejo
                    <span className="rounded-full bg-white/25 px-1.5 text-[10px] tabular-nums">{groups.length}</span>
                  </button>
                </div>

                {/* Zoom buttons (meio esquerda) */}
                <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 flex flex-col items-start gap-2">
                  <div className="flex flex-col rounded-xl overflow-hidden border border-white/15 bg-black/50 backdrop-blur">
                    <button onClick={() => zoomBtn(1)} aria-label="Aproximar" className="grid h-9 w-9 place-items-center text-white/80 hover:bg-white/10 transition"><Plus className="h-4 w-4" /></button>
                    <div className="h-px bg-white/10" />
                    <button onClick={() => zoomBtn(-1)} aria-label="Afastar" className="grid h-9 w-9 place-items-center text-white/80 hover:bg-white/10 transition"><Minus className="h-4 w-4" /></button>
                    <div className="h-px bg-white/10" />
                    <button onClick={() => setT({ x: 0, y: 0, s: 1 })} aria-label="Resetar" className="grid h-9 w-9 place-items-center text-white/60 hover:bg-white/10 transition"><Maximize2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="rounded-md bg-black/50 backdrop-blur border border-white/10 px-2 py-1 text-[9px] text-white/60 tabular-nums">
                    {Math.round(t.s * 100)}%
                  </div>
                </div>

                {/* Handle de scroll da PÁGINA (borda direita, só desktop expandido) */}
                {!isMobile && (
                  <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col rounded-xl overflow-hidden border border-white/15 bg-black/60 backdrop-blur shadow-lg">
                    <button
                      aria-label="Rolar página pra cima"
                      onPointerDown={(e) => { e.preventDefault(); startPageScroll(-1); }}
                      onPointerUp={stopPageScroll}
                      onPointerLeave={stopPageScroll}
                      onPointerCancel={stopPageScroll}
                      onClick={() => window.scrollBy({ top: -180, behavior: "smooth" })}
                      className="grid h-9 w-9 place-items-center text-white/80 hover:bg-white/10 active:bg-white/15 transition"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <div className="h-px bg-white/10" />
                    <button
                      aria-label="Rolar página pra baixo"
                      onPointerDown={(e) => { e.preventDefault(); startPageScroll(1); }}
                      onPointerUp={stopPageScroll}
                      onPointerLeave={stopPageScroll}
                      onPointerCancel={stopPageScroll}
                      onClick={() => window.scrollBy({ top: 180, behavior: "smooth" })}
                      className="grid h-9 w-9 place-items-center text-white/80 hover:bg-white/10 active:bg-white/15 transition"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="h-px bg-white/10" />
                    <button
                      aria-label="Minimizar mapa"
                      onClick={collapseMap}
                      className="grid h-9 w-9 place-items-center text-white/70 hover:text-white hover:bg-white/10 transition"
                    >
                      <Minimize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Coordenadas do cursor (rodapé centro, tipo Windy) */}
                {cursor && !isMobile && !open && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-black/55 backdrop-blur border border-white/10 px-2.5 py-1 text-[10px] text-white/65 tabular-nums pointer-events-none">
                    {cursor.lat.toFixed(2)}°, {cursor.lng.toFixed(2)}°
                  </div>
                )}

                {/* Inset do Brasil (rodapé direita), esconde quando chat aberto */}
                <AnimatePresence>
                  {!chatOpenDesktop && (
                    <motion.div
                      key="inset"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-3 right-16 md:bottom-4 md:right-20 w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden border border-white/15 bg-black/50 backdrop-blur p-1.5"
                    >
                      <BrasilInset />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ============ PAINÉIS DE INTERAÇÃO ============ */}
                {/* SpotPanel no canto INFERIOR-ESQUERDO, ChatCard no canto INFERIOR-DIREITO */}
                <AnimatePresence>
                  {open && !isMobile && (
                    <>
                      <motion.div
                        key="spot"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 26, stiffness: 300 }}
                        className="absolute left-16 md:left-20 bottom-4 w-60 z-20"
                      >
                        <SpotPanel spot={open.spot} />
                      </motion.div>
                      <ChatCard
                        key="chat"
                        rider={open}
                        onClose={closeChat}
                        className="absolute right-16 md:right-20 bottom-4 w-[320px] z-20"
                        compactHeight
                        groups={groups}
                        onInvite={inviteToGroup}
                        onCreateGroup={createGroup}
                      />
                    </>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* ============ OVERLAY DO MODO COMPACTO ============ */}
            {isCollapsed && (
              <motion.button
                key="collapsed-cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setExpanded(true)}
                className="absolute inset-0 z-30 flex items-center justify-center group cursor-pointer"
                style={{
                  background: "linear-gradient(180deg, rgba(6,20,30,0.55) 0%, rgba(6,20,30,0.15) 50%, rgba(6,20,30,0.55) 100%)",
                }}
              >
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <div className="flex items-center gap-2.5 rounded-full bg-black/60 backdrop-blur border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/70">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#39e58c] opacity-75" style={{ animation: "wiu-ping 1.8s infinite" }} />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39e58c]" />
                    </span>
                    {DEMO_RIDERS.length} riders no vento agora
                  </div>
                  <div className="inline-flex items-center gap-3 rounded-full bg-[#00b4d8] px-6 py-3 text-sm font-semibold text-white shadow-2xl shadow-[#00b4d8]/40 transition group-hover:brightness-110 group-hover:scale-[1.02]">
                    <MousePointerClick className="h-4 w-4" />
                    Toque pra explorar o mapa
                  </div>
                  <p className="text-[11px] text-white/50">
                    Comunidade WIU, do MA à BA em tempo real
                  </p>
                </div>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Botão "Ver previsão dos picos" (só aparece com o mapa expandido) */}
        <AnimatePresence>
          {!chatOpenDesktop && !isCollapsed && (
            <motion.div
              key="forecast-btn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-6 flex flex-col items-center gap-4"
            >
              <button
                onClick={() => setShowForecast(true)}
                className="group inline-flex items-center gap-3 rounded-full bg-white/[0.06] backdrop-blur border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/[0.12] hover:border-[#3fd0f0]/50 transition-all shadow-lg"
              >
                <CloudSun className="h-4 w-4 text-[#3fd0f0]" />
                Ver previsão dos picos
                <span className="text-white/40 group-hover:text-[#3fd0f0] transition-colors">→</span>
              </button>
              <p className="text-center text-xs text-white/35">
                Arrasta pra explorar, duplo clique dá zoom, pontos verdes = riders conectados agora.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MOBILE: chat rider tela cheia */}
      {isMobile && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex flex-col justify-end"
              style={{ background: "rgba(4,14,18,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
              <motion.div initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }} className="px-4 pt-5">
                <SpotPanel spot={open.spot} compact />
              </motion.div>
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="mt-4 flex-1 flex flex-col rounded-t-3xl overflow-hidden">
                <ChatCard
                  rider={open}
                  onClose={closeChat}
                  full
                  groups={groups}
                  onInvite={inviteToGroup}
                  onCreateGroup={createGroup}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* GRUPOS DE VELEJO */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showGroups && (
            <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[130] flex items-end md:items-center justify-center p-0 md:p-6"
              style={{ background: "rgba(4,14,18,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
              onClick={() => setShowGroups(false)}>
              <motion.div
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full md:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-3xl border border-white/15 bg-[#0c1a20] shadow-2xl">
                <div className="sticky top-0 flex items-center justify-between bg-[#0c1a20]/95 backdrop-blur px-6 py-4 border-b border-white/10">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Comunidade WIU</div>
                    <h3 className="font-semibold text-white text-lg">Grupos de velejo</h3>
                  </div>
                  <button onClick={() => setShowGroups(false)} aria-label="Fechar" className="rounded-full p-2 text-white/50 hover:text-white hover:bg-white/10 transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-3.5">
                  {groups.map((g) => {
                    const eu = joined.has(g.id);
                    const total = g.confirmados.length + (eu ? 1 : 0);
                    return (
                      <div key={g.id} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#3fd0f0]">
                              <MapPin className="h-3 w-3" /> {g.spot}
                            </div>
                            <div className="mt-1.5 font-semibold text-white leading-snug">{g.rota}</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-white/55">
                              <CalendarClock className="h-3.5 w-3.5" /> {g.dia}, {g.horario}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-display text-2xl text-white leading-none tabular-nums">{total}</div>
                            <div className="text-[10px] uppercase tracking-wider text-white/45">confirmados</div>
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between gap-3">
                          <div className="flex -space-x-2">
                            {g.confirmados.slice(0, 4).map((n) => (
                              <span key={n} className="grid h-7 w-7 place-items-center rounded-full bg-[#134] ring-2 ring-[#0c1a20] text-[10px] font-semibold text-white">{n.charAt(0)}</span>
                            ))}
                            {eu && <span className="grid h-7 w-7 place-items-center rounded-full bg-[#00b4d8] ring-2 ring-[#0c1a20] text-[10px] font-semibold text-white">Eu</span>}
                            {g.confirmados.length > 4 && (
                              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 ring-2 ring-[#0c1a20] text-[10px] text-white/70">+{g.confirmados.length - 4}</span>
                            )}
                          </div>
                          <button
                            onClick={() => setJoined((p) => { const n = new Set(p); if (n.has(g.id)) { n.delete(g.id); } else { n.add(g.id); } return n; })}
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                              eu ? "bg-[#39e58c]/15 text-[#39e58c] border border-[#39e58c]/40"
                                 : "bg-[#00b4d8] text-white hover:brightness-110 shadow-lg shadow-[#00b4d8]/25"
                            }`}>
                            {eu ? <><Check className="h-3.5 w-3.5" /> Confirmado</> : "Confirmar presença"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <p className="pt-1 text-center text-[11px] text-white/35">
                    Grupos são combinados pela comunidade. Sem conversa aqui, o papo é no ponto verde de cada rider.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* MODAL PREVISÃO DOS PICOS */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showForecast && <ForecastModal onClose={() => setShowForecast(false)} />}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}

/* MODAL BRANCO — Previsão dos picos: busca + grid de cards */
function ForecastModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SPOTS.map((s) => s.name);
    return SPOTS.map((s) => s.name).filter((n) => n.toLowerCase().includes(q));
  }, [query]);

  return (
    <motion.div
      key="forecast"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[140] flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(12,26,32,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-4xl max-h-[90vh] flex flex-col rounded-t-3xl md:rounded-3xl border border-black/10 bg-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-white px-6 py-5 border-b border-black/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#00b4d8]/10 border border-[#00b4d8]/25">
              <CloudSun className="h-5 w-5 text-[#00b4d8]" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#0c1a20]/50">Previsão em tempo real</div>
              <h3 className="font-semibold text-[#0c1a20] text-lg leading-tight">Picos do Nordeste</h3>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-2 text-[#0c1a20]/45 hover:text-[#0c1a20] hover:bg-black/5 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Busca */}
        <div className="px-6 pt-5 pb-4 shrink-0 bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0c1a20]/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar pico (ex: Jericoacoara, Cumbuco, Natal, Maceió...)"
              className="w-full rounded-full bg-black/[0.04] border border-black/10 pl-11 pr-4 py-3 text-sm text-[#0c1a20] placeholder:text-[#0c1a20]/40 outline-none focus:border-[#00b4d8]/50 focus:bg-black/[0.02] transition"
            />
          </div>
          <div className="mt-3 text-[11px] text-[#0c1a20]/50">
            {filtered.length === 0
              ? "Nenhum pico encontrado com esse nome."
              : `${filtered.length} pico${filtered.length > 1 ? "s" : ""} do Maranhão à Bahia`}
          </div>
        </div>

        {/* Grid de cards */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 bg-[#faf8f3]">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
              {filtered.map((name) => (
                <SpotForecastCard key={name} name={name} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#0c1a20]/40">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Tente outro nome. Nossos picos cobrem toda a costa do NE.</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-[#0c1a20]/35">
            <span className="h-px w-8 bg-black/15" />
            Atualizado agora, dados demonstrativos
            <span className="h-px w-8 bg-black/15" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SpotForecastCard({ name }: { name: string }) {
  const w = SPOT_WIND[name] || { avg: 20, gust: 25, dir: "E", deg: 90 };
  const t = SPOT_TIDES[name] || { level: "—", height: "—", next: "—", waterTemp: 27 };

  const tideColor = t.level === "Alta" ? "#0098c0" : t.level === "Baixa" ? "#e69420" : t.level === "Enchendo" ? "#18b26b" : "#e0664a";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-black/8 bg-white p-4 hover:border-[#00b4d8]/40 hover:shadow-lg hover:shadow-[#00b4d8]/5 transition-all"
    >
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/6">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-3.5 w-3.5 text-[#00b4d8] shrink-0" />
          <span className="font-semibold text-[#0c1a20] text-sm truncate">{name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#0c1a20]/55 shrink-0">
          <Navigation2 className="h-3 w-3" style={{ transform: `rotate(${w.deg}deg)` }} />
          {w.dir}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-[#0c1a20]/50 font-semibold">Vento médio</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#18b26b] tabular-nums">{w.avg}</span>
            <span className="text-[10px] text-[#0c1a20]/50">nós</span>
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-[#0c1a20]/50 font-semibold">Rajada</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#0098c0] tabular-nums">{w.gust}</span>
            <span className="text-[10px] text-[#0c1a20]/50">nós</span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 h-1 rounded-full overflow-hidden bg-black/6">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, (w.avg / 40) * 100)}%`, background: "linear-gradient(90deg,#18b26b,#a5d922,#3fd0f0)" }}
        />
      </div>

      <div className="mt-3 pt-3 border-t border-black/6 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-[#0c1a20]/60">
            <Waves className="h-3 w-3" /> Maré
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: tideColor }} />
            <span className="text-xs font-semibold text-[#0c1a20]">{t.level}</span>
            <span className="text-[10px] text-[#0c1a20]/45 tabular-nums">{t.height}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#0c1a20]/50">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-3 w-3" /> Próxima
          </div>
          <span className="tabular-nums">{t.next}</span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#0c1a20]/50">
          <div className="flex items-center gap-1.5">
            <Droplets className="h-3 w-3" /> Água
          </div>
          <span className="tabular-nums font-semibold text-[#0c1a20]/70">{t.waterTemp}°C</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
 *  Chat estilo WhatsApp + ações de grupo de velejo
 * ============================================================ */

type ChatMsg =
  | { type: "user"; text: string; time: string }
  | { type: "reply"; text: string; time: string }
  | { type: "system"; text: string; time: string; icon?: "sparkles" | "userplus" };

const DIAS_OPCOES = ["Hoje", "Amanhã", "Depois de amanhã", "Sábado", "Domingo"];

function ChatCard({
  rider, onClose, className = "", full, compactHeight,
  groups, onInvite, onCreateGroup,
}: {
  rider: Rider;
  onClose: () => void;
  className?: string;
  full?: boolean;
  compactHeight?: boolean;
  groups: Grupo[];
  onInvite: (groupId: string, riderName: string) => void;
  onCreateGroup: (rota: string, dia: string, horario: string, spot: string, riderName: string) => string;
}) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [mode, setMode] = useState<"chat" | "invite" | "create">("chat");

  // Estado do mini-form de criar grupo
  const [rota, setRota] = useState<string>(`${rider.spot} → `);
  const [dia, setDia] = useState<string>("Hoje");
  const [horario, setHorario] = useState<string>("");

  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => { boxRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [msgs, typing]);

  // Reseta o form quando abre a tela de criar
  useEffect(() => {
    if (mode === "create") {
      setRota(`${rider.spot} → `);
      setDia("Hoje");
      setHorario("");
    }
  }, [mode, rider.spot]);

  function send() {
    const tt = text.trim();
    if (!tt) return;
    setMsgs((m) => [...m, { type: "user", text: tt, time: nowTime() }]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { type: "reply", text: `Opa! Aqui em ${rider.spot} o vento tá firme. Cola aqui! 🤙`, time: nowTime() }]);
    }, 1400);
  }

  function handleInvite(g: Grupo) {
    onInvite(g.id, rider.name);
    setMsgs((m) => [
      ...m,
      {
        type: "system",
        icon: "userplus",
        text: `${rider.name} convidado pro grupo "${g.rota}" (${g.dia}, ${g.horario}).`,
        time: nowTime(),
      },
    ]);
    setMode("chat");
  }

  function handleCreate() {
    const r = rota.trim();
    const h = horario.trim();
    if (!r || r.endsWith("→") || r.endsWith("→ ") || !h) return;
    onCreateGroup(r, dia, h, rider.spot, rider.name);
    setMsgs((m) => [
      ...m,
      {
        type: "system",
        icon: "sparkles",
        text: `Grupo criado, "${r}" ${dia.toLowerCase()}, ${h}. ${rider.name} convidado.`,
        time: nowTime(),
      },
    ]);
    setMode("chat");
  }

  const canCreate = rota.trim().length > 2 && !rota.trim().endsWith("→") && horario.trim().length > 0;

  const bodyHeight = full ? "flex-1" : compactHeight ? "h-40" : "h-64";

  const inner = (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#111] shrink-0">
        <div className="relative">
          <div className="grid h-9 w-9 place-items-center rounded-full text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)" }}>
            {rider.name.charAt(0)}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#39e58c] ring-2 ring-[#111]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white truncate">{rider.name}</div>
          <div className="text-[11px] text-white/50">{rider.spot}, {rider.level}</div>
        </div>
        <button onClick={onClose} aria-label="Fechar conversa" className="rounded-full p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Barra de ações de grupo */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#181818] border-t border-white/5 shrink-0">
        <button
          onClick={() => setMode(mode === "invite" ? "chat" : "invite")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${
            mode === "invite"
              ? "bg-[#00b4d8] text-white"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <UserPlus className="h-3 w-3" />
          Convidar pra grupo
        </button>
        <span className="h-4 w-px bg-white/10" />
        <button
          onClick={() => setMode(mode === "create" ? "chat" : "create")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${
            mode === "create"
              ? "bg-[#00b4d8] text-white"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="h-3 w-3" />
          Criar grupo
        </button>
      </div>

      {/* Corpo */}
      <div
        ref={boxRef}
        className={`${bodyHeight} overflow-y-auto ${mode === "chat" ? "px-3.5 py-3 space-y-2" : "px-3 py-3"}`}
        style={{
          background: "#f7f5f0",
          backgroundImage: mode === "chat" ? "radial-gradient(circle at 1px 1px, rgba(13,13,13,0.05) 1px, transparent 0)" : "none",
          backgroundSize: "14px 14px",
        }}
      >
        {/* Modo CHAT */}
        {mode === "chat" && (
          <>
            {msgs.length === 0 && !typing && (
              <div className="text-center py-4 px-4">
                <p className="text-[11px] text-[#0c1a20]/50 leading-relaxed">
                  Diz um "e aí, como tá o vento em {rider.spot}?"
                </p>
                <p className="text-[10px] text-[#0c1a20]/35 mt-1.5">A conversa some quando fechar.</p>
              </div>
            )}

            {msgs.map((m, i) => {
              if (m.type === "system") {
                const Icon = m.icon === "sparkles" ? Sparkles : UserPlus;
                return (
                  <div key={i} className="flex justify-center py-1">
                    <div className="max-w-[92%] inline-flex items-start gap-2 rounded-xl bg-[#00b4d8]/8 border border-[#00b4d8]/20 px-3 py-2 text-[11px] leading-snug text-[#0c1a20]/75">
                      <Icon className="h-3 w-3 mt-0.5 text-[#0098c0] shrink-0" />
                      <div className="flex-1">
                        <div>{m.text}</div>
                        <div className="mt-0.5 text-[9px] text-[#0c1a20]/40 tabular-nums">{m.time}</div>
                      </div>
                    </div>
                  </div>
                );
              }

              const isMe = m.type === "user";
              return (
                <div key={i} className={`flex items-end gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <div className="grid h-6 w-6 place-items-center rounded-full text-white text-[10px] font-bold shrink-0 mb-0.5"
                      style={{ background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)" }}>
                      {rider.name.charAt(0)}
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-3 py-2 text-[13px] leading-snug ${
                      isMe
                        ? "bg-[#00b4d8] text-white rounded-2xl rounded-br-sm"
                        : "bg-white text-[#0c1a20] rounded-2xl rounded-bl-sm border border-black/5"
                    }`}
                    style={!isMe ? { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" } : undefined}
                  >
                    {!isMe && <div className="text-[10px] font-semibold text-[#00b4d8] mb-0.5">{rider.name}</div>}
                    <div>{m.text}</div>
                    <div className={`mt-1 flex items-center gap-1 text-[9px] ${isMe ? "text-white/75 justify-end" : "text-[#0c1a20]/40 justify-end"}`}>
                      {m.time}
                      {isMe && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex items-end gap-1.5 justify-start">
                <div className="grid h-6 w-6 place-items-center rounded-full text-white text-[10px] font-bold shrink-0 mb-0.5"
                  style={{ background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)" }}>
                  {rider.name.charAt(0)}
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm border border-black/5 px-3.5 py-2.5"
                  style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0c1a20]/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0c1a20]/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0c1a20]/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modo CONVIDAR pra grupo */}
        {mode === "invite" && (
          <div className="space-y-2">
            <div className="px-1 pb-1 text-[10px] uppercase tracking-[0.16em] font-semibold text-[#0c1a20]/45">
              Convidar {rider.name} pra
            </div>
            {groups.length === 0 && (
              <div className="text-center py-6 text-[11px] text-[#0c1a20]/50">
                Nenhum grupo ainda. Crie o primeiro na aba ao lado.
              </div>
            )}
            {groups.map((g) => {
              const jaEsta = g.confirmados.includes(rider.name);
              return (
                <button
                  key={g.id}
                  disabled={jaEsta}
                  onClick={() => handleInvite(g)}
                  className={`w-full text-left rounded-xl border p-3 transition ${
                    jaEsta
                      ? "bg-black/[0.03] border-black/8 opacity-60 cursor-not-allowed"
                      : "bg-white border-black/8 hover:border-[#00b4d8]/50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-[#0098c0] font-semibold">
                    <MapPin className="h-2.5 w-2.5" /> {g.spot}
                  </div>
                  <div className="mt-1 font-semibold text-[#0c1a20] text-[13px] leading-snug">{g.rota}</div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-[#0c1a20]/55">
                      <CalendarClock className="h-2.5 w-2.5" />
                      {g.dia}, {g.horario}
                    </div>
                    <div className="text-[10px] text-[#0c1a20]/50 tabular-nums">
                      {g.confirmados.length} {g.confirmados.length === 1 ? "confirmado" : "confirmados"}
                    </div>
                  </div>
                  {jaEsta && (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-[#18b26b] font-semibold">
                      <Check className="h-3 w-3" /> Já está no grupo
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Modo CRIAR grupo */}
        {mode === "create" && (
          <div className="space-y-2.5">
            <div className="px-1 pb-1 text-[10px] uppercase tracking-[0.16em] font-semibold text-[#0c1a20]/45">
              Novo grupo, {rider.name} entra automático
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-[#0c1a20]/55 mb-1">Rota</label>
              <input
                value={rota}
                onChange={(e) => setRota(e.target.value)}
                placeholder={`${rider.spot} → destino`}
                className="w-full rounded-lg bg-white border border-black/10 px-2.5 py-1.5 text-[12px] text-[#0c1a20] placeholder:text-[#0c1a20]/35 outline-none focus:border-[#00b4d8]/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-[#0c1a20]/55 mb-1">Dia</label>
                <select
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                  className="w-full rounded-lg bg-white border border-black/10 px-2 py-1.5 text-[12px] text-[#0c1a20] outline-none focus:border-[#00b4d8]/60"
                >
                  {DIAS_OPCOES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-[#0c1a20]/55 mb-1">Horário</label>
                <input
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  placeholder="ex: 12h – 15h"
                  className="w-full rounded-lg bg-white border border-black/10 px-2.5 py-1.5 text-[12px] text-[#0c1a20] placeholder:text-[#0c1a20]/35 outline-none focus:border-[#00b4d8]/60"
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#00b4d8] px-3 py-2 text-[12px] font-semibold text-white shadow hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-3 w-3" /> Criar grupo e convidar
            </button>
            <p className="text-center text-[10px] text-[#0c1a20]/40 pt-0.5">
              O grupo aparece na lista "Grupos de velejo" do topo do mapa.
            </p>
          </div>
        )}
      </div>

      {/* Campo de input (só no modo chat) */}
      {mode === "chat" && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-t border-black/8 shrink-0"
          style={full ? { paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" } : undefined}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Digite uma mensagem…"
            className="flex-1 bg-[#f2f0ea] rounded-full px-4 py-2 text-[13px] text-[#0c1a20] placeholder:text-[#0c1a20]/40 outline-none border border-black/5 focus:border-[#00b4d8]/40 transition"
          />
          <button
            onClick={send}
            aria-label="Enviar"
            disabled={!text.trim()}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#00b4d8] text-white hover:brightness-110 transition disabled:opacity-40 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );

  if (full) return <div className="flex h-full flex-col bg-white">{inner}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ type: "spring", damping: 26, stiffness: 300 }}
      className={`overflow-hidden bg-white flex flex-col ${className}`}
      style={{ borderRadius: "18px", boxShadow: "0 25px 70px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)" }}
    >
      {inner}
    </motion.div>
  );
}
