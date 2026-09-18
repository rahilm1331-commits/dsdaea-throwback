export type EventItem = {
  id: number;
  title: string;
  year: number;
  image: string;
  description: string;
};

export const EVENTS: EventItem[] = [
  { id: 1, title: "Lilienthal Normalsegelapparat", year: 1893, image: "/images/01-lilienthal.png", description: "Otto Lilienthal's Normalsegelapparat glider" },
  { id: 2, title: "First flight of the Wright Flyer", year: 1903, image: "/images/02-wright-flyer.png", description: "Wright Flyer at Kitty Hawk" },
  { id: 3, title: "Spirit of St. Louis transatlantic flight", year: 1927, image: "/images/03-spirit-st-louis.png", description: "Spirit of St. Louis" },
  { id: 4, title: "Bell X-1", year: 1947, image: "/images/04-bell-x1.png", description: "Bell X-1" },
  { id: 5, title: "de Havilland Comet enters commercial service", year: 1952, image: "/images/05-comet.png", description: "de Havilland Comet" },
  { id: 6, title: "Concorde first flight", year: 1969, image: "/images/06-concorde.png", description: "Concorde" },
  { id: 7, title: "Apollo 11 Moon landing", year: 1969, image: "/images/07-apollo-11.png", description: "Apollo 11 commemorative plaque" },
  { id: 8, title: "Mangalyaan launch", year: 2013, image: "/images/08-mangalyaan.png", description: "Mars Orbiter Mission / Mangalyaan" },
  { id: 9, title: "First Falcon 9 successful landing", year: 2015, image: "/images/09-falcon-9.png", description: "Falcon 9 first successful landing" },
  { id: 10, title: "Aryabhata launch", year: 1975, image: "/images/10-aryabhata.png", description: "Aryabhata satellite" }
];