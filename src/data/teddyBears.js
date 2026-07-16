// src/data/teddyBears.js

// Helper function to generate a dynamically colored SVG teddy bear string
const getBearSVG = (color) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1em" height="1em">
  <circle cx="25" cy="25" r="12" fill="${color}" />
  <circle cx="75" cy="25" r="12" fill="${color}" />
  <circle cx="25" cy="25" r="5" fill="#000000" opacity="0.15" />
  <circle cx="75" cy="25" r="5" fill="#000000" opacity="0.15" />
  
  <circle cx="20" cy="60" r="11" fill="${color}" />
  <circle cx="80" cy="60" r="11" fill="${color}" />
  
  <circle cx="32" cy="82" r="13" fill="${color}" />
  <circle cx="68" cy="82" r="13" fill="${color}" />
  <circle cx="32" cy="82" r="6" fill="#000000" opacity="0.1" />
  <circle cx="68" cy="82" r="6" fill="#000000" opacity="0.1" />
  
  <ellipse cx="50" cy="62" rx="26" ry="28" fill="${color}" />
  <ellipse cx="50" cy="65" rx="16" ry="18" fill="#ffffff" opacity="0.3" />
  
  <circle cx="50" cy="38" r="22" fill="${color}" />
  
  <ellipse cx="50" cy="45" rx="10" ry="7" fill="#ffffff" opacity="0.9" />
  <ellipse cx="50" cy="43" rx="3.5" ry="2.5" fill="#1e293b" />
  <circle cx="41" cy="33" r="2.5" fill="#1e293b" />
  <circle cx="59" cy="33" r="2.5" fill="#1e293b" />
</svg>
`.trim();

// Collectible teddy bears. Prices climb from 10,000 to 1,000,000.
// `id` is the stable key stored in the owned-bears list, so don't rename ids
// once players may have bought them.
const RAW_TEDDY_BEARS = [
  { id: "miel",       name: "Osito Miel",        price: 10000,   color: "#fbbf24", rarity: "Common" },
  { id: "canela",     name: "Osito Canela",      price: 20000,   color: "#d97706", rarity: "Common" },
  { id: "fresa",      name: "Osita Fresa",       price: 35000,   color: "#fb7185", rarity: "Uncommon" },
  { id: "menta",      name: "Osito Menta",       price: 50000,   color: "#34d399", rarity: "Uncommon" },
  { id: "cielo",      name: "Osito Cielo",       price: 75000,   color: "#38bdf8", rarity: "Rare" },
  { id: "lavanda",    name: "Osita Lavanda",     price: 100000,  color: "#a78bfa", rarity: "Rare" },
  { id: "rosa",       name: "Osita Rosa",        price: 150000,  color: "#f472b6", rarity: "Epic" },
  { id: "solar",      name: "Osito Solar",       price: 250000,  color: "#f59e0b", rarity: "Epic" },
  { id: "medianoche", name: "Osito Medianoche",  price: 400000,  color: "#6366f1", rarity: "Legendary" },
  { id: "esmeralda",  name: "Osita Esmeralda",   price: 600000,  color: "#10b981", rarity: "Legendary" },
  { id: "rubi",       name: "Osita Rubí",        price: 800000,  color: "#ef4444", rarity: "Mythic" },
  { id: "dorado",     name: "Osito Dorado Real", price: 1000000, color: "#eab308", rarity: "Mythic" },
];

// Map over the raw data to inject the dynamic SVG into each bear
export const TEDDY_BEARS = RAW_TEDDY_BEARS.map(bear => ({
  ...bear,
  svg: getBearSVG(bear.color)
}));

export default TEDDY_BEARS;