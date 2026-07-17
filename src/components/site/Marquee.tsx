import { KiteShape, BirdsShape } from "./KiteDecor";

const WORDS = [
  "Vento bom",
  "Downwind",
  "Cumbuco",
  "Jericoacoara",
  "Guajirú",
  "Sessão em grupo",
  "Big air",
  "Strapless",
  "Icaraí",
  "Preá",
];

export function Marquee() {
  const items = [...WORDS, ...WORDS];
  return (
    <div className="relative bg-ink overflow-hidden py-7 border-y border-ink">
      <div className="marquee-track flex whitespace-nowrap">
        {items.map((w, i) => (
          <span
            key={i}
            className="display text-4xl md:text-6xl px-8 flex items-center gap-8 text-paper"
          >
            {w}
            <span className="h-6 w-8 md:h-8 md:w-10 shrink-0 text-paper inline-block">
              {i % 2 === 0 ? <KiteShape color="currentColor" /> : <BirdsShape color="currentColor" />}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
