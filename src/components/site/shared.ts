export const LOGO_URL =
  "https://res.cloudinary.com/dqridehwu/image/upload/v1781384054/WhatsApp_Image_2026-06-13_at_11.44.11_nccn84.jpg";

export const NAV_LINKS = [
  { href: "#plataforma", label: "Plataforma", tab: "marketplace" },
  { href: "#plataforma", label: "Laudo", tab: "laudo" },
  { href: "#plataforma", label: "Instrutores", tab: "instrutores" },
  { href: "#plataforma", label: "Trips", tab: "comunidade" },
] as const;

// Tabs that organize the platform's services.
export type TabKey = "marketplace" | "instrutores" | "laudo";

export const TABS: {
  key: TabKey;
  label: string;
  index: string;
  tagline: string;
  icon: "store" | "compass" | "shield" | "users";
}[] = [
  { key: "marketplace", label: "Marketplace", index: "01", tagline: "Compre e venda kites", icon: "store" },
  { key: "instrutores", label: "Instrutores", index: "02", tagline: "Aulas com quem voa", icon: "compass" },
  { key: "laudo", label: "Laudo", index: "03", tagline: "Estado real do kite", icon: "shield" },
];

// Real photography (Unsplash) used in grayscale across the site.
export const IMG = {
  hero: "https://images.unsplash.com/photo-1502933691298-84fc14542831?auto=format&fit=crop&w=2000&q=80",
  // Equipment / product photos
  kite: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=900&q=80",
  board: "https://images.unsplash.com/photo-1530870110042-98b2cb110834?auto=format&fit=crop&w=900&q=80",
  gear: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
  beach: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=900&q=80",
  action: "https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=900&q=80",
  // Instructor portraits
  p1: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  p2: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  p3: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  p4: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
  p5: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  p6: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
  // Trip / session spots
  spot1: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=900&q=80",
  spot2: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  spot3: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80",
  spot4: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=80",
  spot5: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80",
  spot6: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=900&q=80",
};
