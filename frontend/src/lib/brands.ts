export interface Brand {
  id: string;
  name: string;
  logo: string;
  alt: string;
}

export const brands: Brand[] = [
  {
    id: "1",
    name: "Apple",
    logo: "/apple.svg",
    alt: "Apple logo"
  },
  {
    id: "2",
    name: "Adidas",
    logo: "/adidas.svg",
    alt: "adidas logo"
  },
  {
    id: "3",
    name: "Nike",
    logo: "/nike.svg",
    alt: "Nike logo"
  },
  {
    id: "4",
    name: "Levi's",
    logo: "/levis.svg",
    alt: "Levi's logo"
  },
  {
    id: "5",
    name: "Logitech",
    logo: "/logitech.svg",
    alt: "Logitech logo"
  },
  {
    id: "6",
    name: "Puma",
    logo: "/puma.svg",
    alt: "Puma logo"
  },
  {
    id: "7",
    name: "Samsung",
    logo: "/samsung.svg",
    alt: "Samsung logo"
  },
  {
    id: "8",
    name: "Dell",
    logo: "/dell.svg",
    alt: "Dell logo"
  },
  {
    id: "9",
    name: "Zara",
    logo: "/zara.svg",
    alt: "Zara logo"
  },
  {
    id: "10",
    name: "Under Armour",
    logo: "/under-armour.svg",
    alt: "Under Armour logo"
  },
 
];

// Default/fallback image for failed loads
export const DEFAULT_BRAND_LOGO = "/placeholder-brand.svg";
