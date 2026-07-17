import { LOGO_URL } from "./shared";

/**
 * Logo completa da marca (sol + pássaros + pipa), usada de forma simples
 * em contextos como Splash, Header e Footer , sem nenhum recorte/clip-path.
 *
 * Nota de manutenção: chegamos a usar uma versão fatiada (clip-path) desta
 * imagem para animar peças soltas no Hero. Essa abordagem foi abandonada
 * porque, ao mover o container com transform, a "janela" de corte se
 * deslocava junto, cortando a imagem de forma incorreta , e em conexões
 * mais lentas a logo (hospedada externamente) podia nem chegar a carregar,
 * deixando a seção em branco. O Hero agora usa elementos SVG vetoriais
 * (ver KiteDecor.tsx), que não dependem de nenhuma imagem externa.
 */
export function LogoFull({ className = "" }: { className?: string }) {
  return <img src={LOGO_URL} alt="Wind Is Up" className={className} draggable={false} />;
}
