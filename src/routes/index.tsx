import { createFileRoute } from "@tanstack/react-router";
import { Splash } from "@/components/site/Splash";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { Marquee } from "@/components/site/Marquee";
import { ComunidadeMapa } from "@/components/site/ComunidadeMapa";
import { Sobre } from "@/components/site/Sobre";
import { Plataforma } from "@/components/site/Plataforma";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Splash />
      <main className="bg-paper text-ink overflow-x-clip">
        <Header />
        <Hero />
        <Stats />
        <Marquee />
        <ComunidadeMapa />
        <Sobre />
        <Plataforma />
        <Footer />
      </main>
    </>
  );
}
