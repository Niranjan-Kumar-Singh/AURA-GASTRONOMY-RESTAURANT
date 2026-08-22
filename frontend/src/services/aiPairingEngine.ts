import { MenuItem } from '../types/menu.types';

export interface AIPairingAddon {
  id: string;
  name: string;
  price: number;
  reason?: string;
  isPopular?: boolean;
}

export interface AIPairingItem {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  badge?: string;
}

export interface SpendMoreRewardOption {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

export interface SpendMoreTier {
  target: number;
  reward: string;
  tierLevel: 1 | 2 | 3;
  rewardOptions: SpendMoreRewardOption[];
  percent: number;
  amountNeeded: number;
  isUnlocked: boolean;
  nextTier?: { target: number; reward: string };
  quickBoosters: { id: number; name: string; price: number; imageUrl: string }[];
}

/**
 * Expanded Universal Popular Add-ons added to every dish selection
 */
export const POPULAR_UNIVERSAL_ADDONS: AIPairingAddon[] = [
  { id: 'add-extra-cheese', name: 'Extra Melted Mozzarella Cheese', price: 75, reason: 'Gooey & Rich', isPopular: true },
  { id: 'add-coke-can', name: 'Chilled Coca-Cola Can (330ml)', price: 60, reason: 'Classic Refresher', isPopular: true },
  { id: 'add-fresh-lime', name: 'Fresh Mint Lime Soda', price: 85, reason: 'Zesty Palate Cleanser', isPopular: true },
  { id: 'add-garlic-mayo', name: 'Signature Garlic Mayo Dip', price: 45, reason: 'Dip Enhancer', isPopular: true },
  { id: 'add-garlic-naan', name: 'Wood-Fired Garlic Butter Naan', price: 90, reason: 'Tandoori Favorite', isPopular: true },
  { id: 'add-chilli-crunch', name: 'Sichuan Crispy Chilli Crunch', price: 50, reason: 'Fiery Crunch', isPopular: true },
  { id: 'add-truffle-butter', name: 'French Black Truffle Butter', price: 95, reason: 'Gourmet Spread', isPopular: true },
  { id: 'add-vanilla-gelato', name: 'Scoop of Bourbon Vanilla Gelato', price: 140, reason: 'Sweet Finish', isPopular: true },
];

/**
 * Dynamic Per-Dish AI Add-on Generator
 */
export const getSmartAddonsForDish = (dish: MenuItem): AIPairingAddon[] => {
  const name = (dish.name || '').toLowerCase();
  const category = (dish.categoryName || '').toLowerCase();

  let specificAddons: AIPairingAddon[] = [];

  // 1. Wagyu / Steak / Ribeye / Prime Beef
  if (name.includes('wagyu') || name.includes('ribeye') || name.includes('steak') || name.includes('tenderloin')) {
    specificAddons = [
      { id: `add-${dish.id}-truffle-butter`, name: 'Black Truffle Bone Marrow Butter', price: 180, reason: 'Melt-in-mouth richness' },
      { id: `add-${dish.id}-mash`, name: 'Truffle Mashed Potatoes', price: 220, reason: 'Classic steak pairing' },
      { id: `add-${dish.id}-demi`, name: 'Smoked Pinot Noir Demi-Glace', price: 110, reason: 'Chef signature reduction' },
    ];
  }
  // 2. Butter Chicken / Tikka Masala / Curry / Dal / Korma
  else if (name.includes('butter chicken') || name.includes('tikka') || name.includes('curry') || name.includes('korma') || name.includes('dal') || name.includes('paneer')) {
    specificAddons = [
      { id: `add-${dish.id}-naan`, name: 'Wood-Fired Garlic Butter Naan', price: 90, reason: '100% Gravy Pairing' },
      { id: `add-${dish.id}-rice`, name: 'Kashmiri Saffron Basmati Rice', price: 140, reason: 'Aromatic pilaf' },
      { id: `add-${dish.id}-raita`, name: 'Smoked Burani Garlic Raita', price: 80, reason: 'Cooling garlic yoghurt' },
    ];
  }
  // 3. Prawns / Fish / Lobster / Seafood
  else if (name.includes('prawn') || name.includes('fish') || name.includes('salmon') || name.includes('lobster') || name.includes('seafood')) {
    specificAddons = [
      { id: `add-${dish.id}-lemon-butter`, name: 'Garlic Herb Lemon Butter Dip', price: 95, reason: 'Enhances seafood sweetness' },
      { id: `add-${dish.id}-citrus-rice`, name: 'Steamed Jasmine Rice with Citrus', price: 120, reason: 'Light & fluffy side' },
    ];
  }
  // 4. Pasta / Risotto / Truffle Tagliolini / Gnocchi
  else if (name.includes('pasta') || name.includes('risotto') || name.includes('tagliolini') || name.includes('gnocchi') || category.includes('pasta')) {
    specificAddons = [
      { id: `add-${dish.id}-parm`, name: 'Aged 24-Month Parmigiano Reggiano', price: 110, reason: 'Umami cheese shavings' },
      { id: `add-${dish.id}-truffle-oil`, name: 'White Truffle Oil Drizzle', price: 130, reason: 'Luxury aroma' },
    ];
  }
  // 5. Dim Sum / Bao / Dumpling / Asian Noodles
  else if (name.includes('dim sum') || name.includes('bao') || name.includes('dumpling') || name.includes('ramen') || name.includes('noodle')) {
    specificAddons = [
      { id: `add-${dish.id}-chilli-crunch`, name: 'Sichuan Crispy Chilli Crunch', price: 50, reason: 'Fiery crunch' },
      { id: `add-${dish.id}-edamame-dip`, name: 'Truffle Edamame Dip', price: 110, reason: 'Creamy vegan dip' },
    ];
  }
  // 6. Pizza / Flatbread / Burger / Sandwich / Taco
  else if (name.includes('pizza') || name.includes('flatbread') || name.includes('burger') || name.includes('taco')) {
    specificAddons = [
      { id: `add-${dish.id}-burrata`, name: 'Fresh Italian Burrata Ball', price: 150, reason: 'Creamy cheese center' },
      { id: `add-${dish.id}-truffle-fries`, name: 'Truffle Fries with Smoked Aioli', price: 180, reason: 'Crispy side fries' },
    ];
  }
  // 7. Desserts
  else if (category.includes('dessert') || name.includes('cake') || name.includes('sphere') || name.includes('halwa') || name.includes('brownie')) {
    specificAddons = [
      { id: `add-${dish.id}-gelato`, name: 'Madagascar Bourbon Vanilla Gelato', price: 140, reason: 'Warm-cold dessert contrast' },
      { id: `add-${dish.id}-choc-sauce`, name: 'Hot 70% Dark Valrhona Chocolate', price: 85, reason: 'Rich cocoa drizzle' },
    ];
  }
  // 8. Default
  else {
    const firstWord = dish.name.split(' ')[0] || 'Chef';
    specificAddons = [
      { id: `add-${dish.id}-chef-dip`, name: `${firstWord} Signature Dip Trio`, price: 95, reason: 'Custom house sauce' },
      { id: `add-${dish.id}-herb-butter`, name: 'Artisanal Herb Cultured Butter', price: 70, reason: 'Enhanced richness' },
    ];
  }

  return [...specificAddons, ...POPULAR_UNIVERSAL_ADDONS];
};

/**
 * Spend-More Gamified Tiered Discount & Freebie Calculator
 */
export const getSpendMoreProgress = (subtotal: number): SpendMoreTier => {
  const TIER_1_OPTIONS: SpendMoreRewardOption[] = [
    {
      id: 9902,
      name: 'Wood-Fired Garlic Butter Naan (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80',
      description: 'Clay-oven naan brushed with garlic herb butter (Save ₹90)',
    },
    {
      id: 9903,
      name: 'Chilled Coca-Cola 330ml (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
      description: 'Ice-cold classic Coca-Cola can (Save ₹60)',
    },
  ];

  const TIER_2_OPTIONS: SpendMoreRewardOption[] = [
    {
      id: 9904,
      name: 'Fresh Mint Lime Soda (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
      description: 'Sparkling mint lime mocktail (Save ₹85)',
    },
    {
      id: 9906,
      name: 'Artisanal Truffle Butter Dip (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=400&q=80',
      description: 'Rich French black truffle butter dip (Save ₹65)',
    },
  ];

  const TIER_3_OPTIONS: SpendMoreRewardOption[] = [
    {
      id: 9907,
      name: 'Valrhona Chocolate Lava Cake (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80',
      description: 'Warm molten Belgian chocolate lava cake (Save ₹220)',
    },
    {
      id: 9908,
      name: 'Madagascar Vanilla Gelato (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=80',
      description: 'Slow-churned Bourbon vanilla gelato (Save ₹140)',
    },
  ];

  const QUICK_BOOSTERS = [
    { id: 201, name: 'Chilled Coca-Cola', price: 60, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=200&q=80' },
    { id: 202, name: 'Extra Melted Cheese', price: 75, imageUrl: 'https://images.unsplash.com/photo-1552590635-27c2c2128abf?auto=format&fit=crop&w=200&q=80' },
    { id: 203, name: 'Garlic Butter Naan', price: 90, imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=200&q=80' },
    { id: 204, name: 'Fresh Mint Lime Soda', price: 85, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=200&q=80' },
    { id: 205, name: 'Garlic Mayo Dip', price: 45, imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=200&q=80' },
    { id: 206, name: 'Truffle Fries Side', price: 180, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=200&q=80' },
  ];

  if (subtotal >= 2000) {
    return {
      target: 2000,
      reward: '👑 TIER 3 VIP: Free Valrhona Lava Cake or Gelato (Save ₹220)',
      tierLevel: 3,
      rewardOptions: TIER_3_OPTIONS,
      percent: 100,
      amountNeeded: 0,
      isUnlocked: true,
      quickBoosters: QUICK_BOOSTERS,
    };
  }

  if (subtotal >= 1000) {
    return {
      target: 1000,
      reward: '🍹 TIER 2: Free Mint Lime Soda or Truffle Dip (Save ₹85)',
      tierLevel: 2,
      rewardOptions: TIER_2_OPTIONS,
      percent: 100,
      amountNeeded: 2000 - subtotal,
      isUnlocked: true,
      nextTier: { target: 2000, reward: 'Valrhona Chocolate Lava Cake (₹220)' },
      quickBoosters: QUICK_BOOSTERS,
    };
  }

  if (subtotal >= 500) {
    return {
      target: 500,
      reward: '🫓 TIER 1: Free Garlic Butter Naan or Coca-Cola (Save ₹90)',
      tierLevel: 1,
      rewardOptions: TIER_1_OPTIONS,
      percent: 100,
      amountNeeded: 1000 - subtotal,
      isUnlocked: true,
      nextTier: { target: 1000, reward: 'Fresh Mint Lime Soda (₹85)' },
      quickBoosters: QUICK_BOOSTERS,
    };
  }

  return {
    target: 500,
    reward: 'Free Garlic Naan / Drink (Save ₹90)',
    tierLevel: 1,
    rewardOptions: TIER_1_OPTIONS,
    percent: Math.min(100, Math.round((subtotal / 500) * 100)),
    amountNeeded: 500 - subtotal,
    isUnlocked: false,
    nextTier: { target: 500, reward: 'Free Garlic Naan / Drink (₹90)' },
    quickBoosters: QUICK_BOOSTERS,
  };
};

/**
 * Expanded AI Recommended Pairings for Cart & Menu Detail Modals
 */
export const AI_RECOMMENDED_PAIRINGS: AIPairingItem[] = [
  {
    id: 101,
    name: 'Garlic Butter Naan',
    price: 90,
    description: 'Fresh clay-oven leavened bread brushed with French cultured butter and roasted garlic.',
    category: 'Breads',
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=80',
    badge: '100% Curry Match',
  },
  {
    id: 102,
    name: 'Saffron Basmati Pilaf',
    price: 160,
    description: 'Long-grain aged basmati infused with Kashmiri saffron, green cardamom, and fried shallots.',
    category: 'Rice',
    imageUrl: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=400&q=80',
    badge: 'Chef Favorite',
  },
  {
    id: 103,
    name: 'Saffron & Gold Elixir',
    price: 390,
    description: 'Botanical mocktail with saffron syrup, edible gold glitter, and fresh citrus.',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80',
    badge: 'Best Drink Pairing',
  },
  {
    id: 104,
    name: 'Madagascar Vanilla Gelato',
    price: 140,
    description: 'Artisanal slow-churned gelato made with real Bourbon vanilla pods.',
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=80',
    badge: 'Sweet Finish',
  },
  {
    id: 105,
    name: 'Truffle Fries & Smoked Aioli',
    price: 180,
    description: 'Crispy skin-on french fries tossed in black truffle oil and Aged Parmigiano Reggiano.',
    category: 'Add-ons & Extras',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80',
    badge: 'Crispy Favorite',
  },
  {
    id: 106,
    name: 'Fresh Italian Burrata Ball',
    price: 150,
    description: 'Whole fresh Apulian burrata cheese ball to add creamy richness to any main dish.',
    category: 'Add-ons & Extras',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a28?auto=format&fit=crop&w=400&q=80',
    badge: 'Creamy Extra',
  },
  {
    id: 107,
    name: 'Fresh Mint Lime Soda',
    price: 85,
    description: 'Sparkling mint lime soda crafted with fresh crushed mint and Himalayan pink salt.',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
    badge: 'Zesty Refresher',
  },
  {
    id: 108,
    name: 'French Black Truffle Butter',
    price: 95,
    description: 'Whipped French Normandy cultured butter infused with Black Perigord truffle.',
    category: 'Add-ons & Extras',
    imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=400&q=80',
    badge: 'Luxury Spread',
  },
];
