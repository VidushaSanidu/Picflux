import type { StaticImageData } from "next/image";
import bengalCat from "../../assets/perturb-bengal-cat.jpg";
import macaw from "../../assets/perturb-macaw.jpg";
import seaTurtle from "../../assets/perturb-sea-turtle.jpg";
import snowLeopard from "../../assets/perturb-snow-leopard.jpg";

export type AnimalImage = {
  id: number;
  title: string;
  category: "wild" | "birds" | "pets" | "marine";
  photographer: string;
  image: StaticImageData;
  downloads: string;
  height: string;
};

export const animalImages: AnimalImage[] = [
  {
    id: 1,
    title: "Alpine Ghost",
    category: "wild",
    photographer: "Mira Chen",
    image: snowLeopard,
    downloads: "12.8k",
    height: "h-[31rem]",
  },
  {
    id: 2,
    title: "Rainforest Signal",
    category: "birds",
    photographer: "Jon Bell",
    image: macaw,
    downloads: "9.4k",
    height: "h-[26rem]",
  },
  {
    id: 3,
    title: "Neon Bengal",
    category: "pets",
    photographer: "Aya Morgan",
    image: bengalCat,
    downloads: "18.2k",
    height: "h-[28rem]",
  },
  {
    id: 4,
    title: "Blue Drift",
    category: "marine",
    photographer: "Kai Silva",
    image: seaTurtle,
    downloads: "7.1k",
    height: "h-[34rem]",
  },
  {
    id: 5,
    title: "Midnight Prowl",
    category: "wild",
    photographer: "Nora Vale",
    image: snowLeopard,
    downloads: "6.6k",
    height: "h-[24rem]",
  },
  {
    id: 6,
    title: "Electric Wings",
    category: "birds",
    photographer: "Theo Park",
    image: macaw,
    downloads: "11.3k",
    height: "h-[32rem]",
  },
];

export const categories = ["all", "birds", "wild", "pets", "marine"] as const;
