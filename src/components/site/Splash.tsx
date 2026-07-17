import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogoFull } from "./LogoMark";

/**
 * Splash screen exibida em toda visita ao site, antes do conteúdo aparecer.
 * Fundo escuro, logo centralizada com leve respiração + barra de progresso
 * indeterminada, no espírito do app Dokite Brazil de referência.
 */
export function Splash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = "";
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            className="flex h-24 w-24 items-center justify-center bg-paper md:h-28 md:w-28"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-16 w-16 md:h-20 md:w-20"
            >
              <LogoFull className="h-full w-full object-contain" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-7 text-center"
          >
            <div className="display text-paper text-[15px] tracking-[0.22em]">WIU</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-paper/50">
              Comunidade de kitesurf
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 h-[2px] w-40 overflow-hidden rounded-full bg-paper/15"
          >
            <motion.div
              className="h-full w-1/3 rounded-full bg-accent"
              initial={{ x: "-100%" }}
              animate={{ x: "300%" }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
