import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, MapPin, X, ChevronLeft, ChevronRight, Trophy, Zap, Users } from "lucide-react";

const WIU_WHATSAPP = "5585999999999";

type Instructor = {
  nome: string;
  apelido: string;
  cert: string;
  local: string;
  rating: number;
  aulas: number;
  bio: string;
  conquistas: string[];
  img: string;
  destaque: string;
  fotos: string[];
};

const INSTRUCTORS: Instructor[] = [
  {
    nome: "Rodrigo Jesus",
    apelido: "Rodrigo",
    cert: "Atleta WIU Fortaleza",
    local: "Fortaleza, CE",
    rating: 5.0,
    aulas: 420,
    bio: "Forte conexão com o mar, dedicação ao esporte e presença ativa na comunidade local. Rodrigo chega para fortalecer ainda mais a equipe dentro e fora da água.",
    conquistas: ["Atleta WIU Fortaleza", "Instrutor certificado", "Referência local em kitesurf"],
    img: "https://res.cloudinary.com/dqridehwu/image/upload/v1781700455/WhatsApp_Image_2026-06-17_at_09.08.43_xv5yxm.jpg",
    destaque: "https://res.cloudinary.com/dqridehwu/image/upload/v1781700403/WhatsApp_Image_2026-06-17_at_09.08.58_lk59qq.jpg",
    fotos: [
      "https://res.cloudinary.com/dqridehwu/image/upload/v1781700455/WhatsApp_Image_2026-06-17_at_09.08.43_xv5yxm.jpg",
      "https://res.cloudinary.com/dqridehwu/image/upload/v1781700448/WhatsApp_Image_2026-06-17_at_09.08.42_1_hyk002.jpg",
      "https://res.cloudinary.com/dqridehwu/image/upload/v1781700443/WhatsApp_Image_2026-06-17_at_09.08.43_1_dd9n1d.jpg",
      "https://res.cloudinary.com/dqridehwu/image/upload/v1781700440/WhatsApp_Image_2026-06-17_at_09.08.43_2_owrbxy.jpg",
    ],
  },
  {
    nome: "Breno Barbosa",
    apelido: "Breno",
    cert: "Strapless Rider · GKA World Tour",
    local: "Cumbuco, CE",
    rating: 5.0,
    aulas: 350,
    bio: "Strapless rider no circuito GKA Kite World Tour. Campeão Brasileiro 2022 e Vice-Campeão 2024. Suporte Duotone Kiteboarding Brasil e Brasil Cap.",
    conquistas: ["Campeão Brasileiro 2022 🏆", "Vice-Campeão Brasileiro 2024 🏆", "GKA Kite World Tour", "Suporte Duotone"],
    img: "https://res.cloudinary.com/dqridehwu/image/upload/v1781700260/breno_kite_1754913484_3696804706479820479_7859217864_mwldug.jpg",
    destaque: "https://res.cloudinary.com/dqridehwu/image/upload/v1781785770/WhatsApp_Image_2026-06-17_at_21.24.56_ygzezi.jpg",
    fotos: [
      "https://res.cloudinary.com/dqridehwu/image/upload/v1781700400/WhatsApp_Image_2026-06-17_at_09.09.47_qq5osh.jpg",
      "https://res.cloudinary.com/dqridehwu/image/upload/v1781700296/p5_kitehouse_1760624046_3744708371606780508_1789004138_fz9jss.jpg",
      "https://res.cloudinary.com/dqridehwu/image/upload/v1781700190/breno_kite_1750708941_3661534443048076167_7859217864_aueisw.jpg",
      "https://res.cloudinary.com/dqridehwu/image/upload/v1781700187/breno_kite_1748513432_3643117181714616940_7859217864_xbmads.jpg",
      "https://res.cloudinary.com/dqridehwu/image/upload/v1781700260/breno_kite_1754913484_3696804706479820479_7859217864_mwldug.jpg",
    ],
  },
];

function PhotoGallery({ fotos }: { fotos: string[] }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i === 0 ? fotos.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === fotos.length - 1 ? 0 : i + 1));

  return (
    <div className="relative">
      <div className="aspect-[4/3] overflow-hidden bg-ink/5">
        <AnimatePresence mode="wait">
          <motion.img
            key={fotos[idx]}
            src={fotos[idx]}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>
      {fotos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-ink/50 backdrop-blur-sm text-paper flex items-center justify-center rounded-full hover:bg-ink/80 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-ink/50 backdrop-blur-sm text-paper flex items-center justify-center rounded-full hover:bg-ink/80 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {fotos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-5 bg-paper" : "w-1.5 bg-paper/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function InstructorModal({ p, onClose }: { p: Instructor; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center"
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%", opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto bg-paper md:my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 h-10 w-10 bg-ink/50 backdrop-blur-sm text-paper flex items-center justify-center rounded-full hover:bg-ink/80 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <PhotoGallery fotos={p.fotos} />

        <div className="p-6 md:p-8">
          <div className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold">
            {p.cert}
          </div>
          <h3 className="display text-4xl md:text-5xl mt-2">{p.nome}</h3>

          <div className="mt-4 flex items-center gap-4 text-sm text-ink/70">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {p.local}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-ink stroke-ink" /> {p.rating}
            </span>
            <span className="text-ink/50">{p.aulas}+ aulas</span>
          </div>

          <p className="mt-5 text-[15px] text-ink/70 leading-relaxed">{p.bio}</p>

          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-ink/50 mb-3">Conquistas</div>
            <div className="flex flex-col gap-2">
              {p.conquistas.map((c) => (
                <div key={c} className="flex items-center gap-2.5 text-sm text-ink/80">
                  <Trophy className="h-4 w-4 text-accent shrink-0" />
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Imagem de destaque (post oficial / divulgação) */}
          <div className="mt-6 overflow-hidden">
            <img src={p.destaque} alt={`Destaque ${p.nome}`} loading="lazy" className="w-full h-auto object-cover" />
          </div>

          {/* Duas opções de aula */}
          <div className="mt-8">
            <div className="text-[11px] uppercase tracking-[0.22em] text-ink/50 mb-4">Escolha como começar</div>
            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/${WIU_WHATSAPP}?text=${encodeURIComponent(`Quero agendar uma aula imediata com ${p.apelido}!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group border-2 border-accent p-5 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-accent group-hover:text-paper transition-colors" />
                    <span className="display text-lg group-hover:text-paper transition-colors">Aula Imediata</span>
                  </div>
                  <span className="text-accent group-hover:text-paper transition-colors">→</span>
                </div>
                <p className="mt-1.5 text-[13px] text-ink/60 group-hover:text-paper/80 transition-colors pl-8">
                  Aula particular, você agenda e vai pra água.
                </p>
              </a>

              <a
                href={`https://wa.me/${WIU_WHATSAPP}?text=${encodeURIComponent(`Quero entrar na próxima turma com ${p.apelido}!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group border-2 border-ink/15 p-5 hover:bg-ink transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-ink/70 group-hover:text-paper transition-colors" />
                    <span className="display text-lg group-hover:text-paper transition-colors">Turma</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold border border-accent px-2 py-0.5">Mais em conta</span>
                </div>
                <p className="mt-1.5 text-[13px] text-ink/60 group-hover:text-paper/80 transition-colors pl-8">
                  Espere a próxima turma e comece com outros iniciantes como você.
                </p>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Instrutores() {
  const [selected, setSelected] = useState<Instructor | null>(null);

  return (
    <div id="instrutores" className="bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="max-w-3xl">
          <h2 className="display text-5xl md:text-7xl lg:text-8xl gust-5">
            Nossos <span className="serif italic normal-case tracking-normal">riders</span>.
          </h2>
          <p className="mt-6 text-xl text-ink/70 leading-relaxed">
            Conheça quem faz parte da equipe WIU. Toque pra saber mais.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 max-w-3xl">
          {INSTRUCTORS.map((p, i) => (
            <motion.button
              key={p.nome}
              onClick={() => setSelected(p)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group text-left bg-paper overflow-hidden card-lift card-lift-hover"
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <img
                  src={p.img}
                  alt={p.nome}
                  loading="lazy"
                  className="h-full w-full object-cover transition-[filter,transform] duration-500 group-hover:scale-105"
                  style={{ filter: "saturate(1.1)" }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent pt-20 pb-5 px-5">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold">
                    {p.cert}
                  </div>
                  <h3 className="display text-3xl md:text-4xl text-paper mt-1">{p.nome}</h3>
                  <div className="mt-2 flex items-center gap-3 text-sm text-paper/75">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {p.local}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-paper stroke-paper" /> {p.rating}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <span className="text-[12px] uppercase tracking-[0.2em] font-semibold text-accent">
                  Ver perfil
                </span>
                <span className="text-accent transition-transform group-hover:translate-x-1">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <InstructorModal p={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
