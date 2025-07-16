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
    logo: "https://cdn.worldvectorlogo.com/logos/apple-14.svg",
    alt: "Apple logo"
  },
  {
    id: "2",
    name: "Tesla",
    logo: "https://cdn.worldvectorlogo.com/logos/tesla-9.svg",
    alt: "Tesla logo"
  },
  {
    id: "3",
    name: "Nike",
    logo: "https://cdn.worldvectorlogo.com/logos/nike-4.svg",
    alt: "Nike logo"
  },
  {
    id: "4",
    name: "Supreme",
    logo: "https://cdn.worldvectorlogo.com/logos/supreme-2.svg",
    alt: "Supreme logo"
  },
  {
    id: "5",
    name: "Netflix",
    logo: "https://cdn.worldvectorlogo.com/logos/netflix-3.svg",
    alt: "Netflix logo"
  },
  {
    id: "6",
    name: "Spotify",
    logo: "https://cdn.worldvectorlogo.com/logos/spotify-2.svg",
    alt: "Spotify logo"
  },
  {
    id: "7",
    name: "Discord",
    logo: "https://cdn.worldvectorlogo.com/logos/discord-6.svg",
    alt: "Discord logo"
  },
  {
    id: "8",
    name: "Twitch",
    logo: "https://cdn.worldvectorlogo.com/logos/twitch-4.svg",
    alt: "Twitch logo"
  },
  {
    id: "9",
    name: "TikTok",
    logo: "https://cdn.worldvectorlogo.com/logos/tiktok-icon-2.svg",
    alt: "TikTok logo"
  },
  {
    id: "10",
    name: "Instagram",
    logo: "https://cdn.worldvectorlogo.com/logos/instagram-2016-5.svg",
    alt: "Instagram logo"
  },
  {
    id: "11",
    name: "YouTube",
    logo: "https://cdn.worldvectorlogo.com/logos/youtube-icon.svg",
    alt: "YouTube logo"
  },
  {
    id: "12",
    name: "Airbnb",
    logo: "https://cdn.worldvectorlogo.com/logos/airbnb-2.svg",
    alt: "Airbnb logo"
  },
  {
    id: "13",
    name: "Uber",
    logo: "https://cdn.worldvectorlogo.com/logos/uber-11.svg",
    alt: "Uber logo"
  },
  {
    id: "14",
    name: "Slack",
    logo: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
    alt: "Slack logo"
  },
  {
    id: "15",
    name: "Figma",
    logo: "https://cdn.worldvectorlogo.com/logos/figma-1.svg",
    alt: "Figma logo"
  }
];

// Default/fallback image for failed loads
export const DEFAULT_BRAND_LOGO = "/placeholder-brand.svg";
