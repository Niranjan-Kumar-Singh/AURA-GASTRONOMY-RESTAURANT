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
  // Cap total addons to maximum 5 items (specific pairings first, filled with top universal add-ons)
  const remainingSlots = Math.max(0, 5 - specificAddons.length);
  return [...specificAddons, ...POPULAR_UNIVERSAL_ADDONS.slice(0, remainingSlots)];
};

/**
 * Spend-More Gamified Tiered Discount & Freebie Calculator
 */
export const getSpendMoreProgress = (subtotal: number): SpendMoreTier => {
  const TIER_1_OPTIONS: SpendMoreRewardOption[] = [
    {
      id: 9901,
      name: 'Garlic Bread (2 pcs) (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=400&q=80',
      description: 'Toasted artisanal garlic herb bread (Save ₹59)',
    },
    {
      id: 1101,
      name: 'Coke / Sprite 300ml (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
      description: 'Chilled refreshing soft drink (Save ₹50)',
    },
  ];

  const TIER_2_OPTIONS: SpendMoreRewardOption[] = [
    {
      id: 1103,
      name: 'Fresh Lime Soda (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
      description: 'Sparkling mint lime soda (Save ₹60)',
    },
    {
      id: 704,
      name: 'Salted French Fries (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80',
      description: 'Golden crispy salted fries (Save ₹100)',
    },
  ];

  const TIER_3_OPTIONS: SpendMoreRewardOption[] = [
    {
      id: 1309,
      name: 'Vanilla Ice Cream (3 scoops) (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=80',
      description: 'Creamy Bourbon vanilla ice cream trio (Save ₹120)',
    },
    {
      id: 1106,
      name: 'Virgin Mojito (Free)',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80',
      description: 'Crushed fresh mint & lime cooler (Save ₹120)',
    },
  ];

  const QUICK_BOOSTERS = [
    { id: 9901, name: 'Garlic Bread (2 pcs)', price: 59, imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=200&q=80' },
    { id: 9902, name: 'Extra Cheese Topping', price: 49, imageUrl: 'https://images.unsplash.com/photo-1552590635-27c2c2128abf?auto=format&fit=crop&w=200&q=80' },
    { id: 1101, name: 'Coke / Sprite', price: 50, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=200&q=80' },
    { id: 1103, name: 'Fresh Lime Soda', price: 60, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=200&q=80' },
    { id: 704, name: 'Classic French Fries', price: 100, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=200&q=80' },
    { id: 705, name: 'Peri Peri Fries', price: 120, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=200&q=80' },
  ];

  if (subtotal >= 2000) {
    return {
      target: 2000,
      reward: '👑 TIER 3 VIP: Free Vanilla Ice Cream or Mojito (Save ₹120)',
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
      reward: '🍹 TIER 2: Free Lime Soda or Salted Fries (Save ₹100)',
      tierLevel: 2,
      rewardOptions: TIER_2_OPTIONS,
      percent: 100,
      amountNeeded: 2000 - subtotal,
      isUnlocked: true,
      nextTier: { target: 2000, reward: 'Vanilla Ice Cream / Mojito (₹120)' },
      quickBoosters: QUICK_BOOSTERS,
    };
  }

  if (subtotal >= 500) {
    return {
      target: 500,
      reward: '🥖 TIER 1: Free Garlic Bread or Soft Drink (Save ₹59)',
      tierLevel: 1,
      rewardOptions: TIER_1_OPTIONS,
      percent: 100,
      amountNeeded: 1000 - subtotal,
      isUnlocked: true,
      nextTier: { target: 1000, reward: 'Fresh Lime Soda / Fries (₹100)' },
      quickBoosters: QUICK_BOOSTERS,
    };
  }

  return {
    target: 500,
    reward: 'Free Garlic Bread / Drink (Save ₹59)',
    tierLevel: 1,
    rewardOptions: TIER_1_OPTIONS,
    percent: Math.min(100, Math.round((subtotal / 500) * 100)),
    amountNeeded: 500 - subtotal,
    isUnlocked: false,
    nextTier: { target: 500, reward: 'Free Garlic Bread / Drink (₹59)' },
    quickBoosters: QUICK_BOOSTERS,
  };
};

/**
 * Expanded AI Recommended Pairings for Cart & Menu Detail Modals
 */
export const AI_RECOMMENDED_PAIRINGS: AIPairingItem[] = [
  {
    id: 9901,
    name: 'Garlic Bread (2 pcs)',
    price: 59,
    description: 'Fresh toasted artisanal garlic bread brushed with herb butter.',
    category: 'Add-ons & Extras',
    imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=400&q=80',
    badge: '100% Dish Match',
  },
  {
    id: 705,
    name: 'Peri Peri Fries',
    price: 120,
    description: 'Crispy skin-on french fries tossed in fiery African bird\'s eye seasoning.',
    category: 'Burgers & Fries',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=80',
    badge: 'Crispy Favorite',
  },
  {
    id: 1106,
    name: 'Virgin Mojito',
    price: 120,
    description: 'Refreshing sparkling lime and crushed mint leaf mocktail.',
    category: 'Cold Drinks & Coolers',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80',
    badge: 'Best Drink Pairing',
  },
  {
    id: 1309,
    name: 'Vanilla Ice Cream (3 scoops)',
    price: 120,
    description: 'Rich and creamy slow-churned Bourbon vanilla ice cream trio.',
    category: 'Frappes & Ice Cream',
    imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=80',
    badge: 'Sweet Finish',
  },
  {
    id: 801,
    name: 'Veg Cheese Corn Nuggets (8 pcs)',
    price: 150,
    description: 'Golden crunchy corn & melted cheddar bites with dipping sauce.',
    category: 'Crispy Appetisers',
    imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80',
    badge: 'Chef Favorite',
  },
  {
    id: 1103,
    name: 'Fresh Lime Soda',
    price: 60,
    description: 'Crisp sparkling lime soda crafted with fresh mint and rock salt.',
    category: 'Cold Drinks & Coolers',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
    badge: 'Palate Cleanser',
  },
  {
    id: 307,
    name: 'Chocolate Overload Shake',
    price: 130,
    description: 'Dense rich chocolate thickshake with fudge drizzle and choco chips.',
    category: 'Thick Milkshakes',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80',
    badge: 'Top Rated Shake',
  },
  {
    id: 808,
    name: 'Chicken Wings (5 pcs)',
    price: 250,
    description: 'Tender chicken wings glazed in house smoky BBQ glaze.',
    category: 'Crispy Appetisers',
    imageUrl: 'https://images.unsplash.com/photo-1527477378698-4797604be71a?auto=format&fit=crop&w=400&q=80',
    badge: 'Crispy Non-Veg',
  },
];
