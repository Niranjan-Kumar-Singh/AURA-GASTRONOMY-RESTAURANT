const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Faq = require('../models/Faq');

// Static slow-changing facts (hours, parking, policies). Live menu/coupon data comes from MongoDB.
const STATIC_KNOWLEDGE = {
  hours: 'AURA Fine Dining is open Monday to Sunday, 11:00 AM – 11:30 PM.',
  location: 'We are located at 100 Feet Road, Indiranagar, Bengaluru, Karnataka – 560038.',
  parking: 'Complimentary valet parking is available for all our guests.',
  reservations: 'Reservations can be made through the Reservations option on the menu page, or by speaking to the host. The VIP Lounge requires prior reservation and has a minimum spend.',
  dressing: 'We request smart casual attire. No sportswear or beachwear.',
};

const INITIAL_QUICK_OPTIONS = [
  { label: "Today's Specials & Chef Picks", query: "What are today's specials and chef recommendations?" },
  { label: 'Menu & Cuisine Details', query: 'Tell me about the menu and cuisine' },
  { label: 'Pricing & Best Value', query: 'Show me pricing and best value combos' },
  { label: 'Dietary & Allergen Info', query: 'Do you have vegetarian, Jain and gluten-free options?' },
  { label: 'Spice Levels & Customizations', query: 'Tell me about spice levels and customizations' },
  { label: 'Reservations & Booking', query: 'How do I make a reservation?' },
  { label: 'Hours, Parking & Policies', query: 'What are your hours, parking and policies?' },
  { label: 'Talk to a Waiter', query: 'I want to talk to a human waiter' },
];

const formatItems = (items) => items.map((it) => `• ${it.name} — ₹${it.price}`).join('\n');

const findDishesByWords = async (normalizedMessage) => {
  const words = normalizedMessage.split(/\W+/).filter((w) => w.length > 2);
  if (words.length === 0) return [];

  const items = await MenuItem.find({ isAvailable: true }).lean();
  return items.filter((it) => {
    const nameWords = it.name.toLowerCase().split(/\W+/);
    return nameWords.some((nw) => nw.length > 2 && words.includes(nw));
  }).slice(0, 3);
};

const dishReply = (dishes) => {
  const lines = dishes.map((it) => {
    const tags = [
      it.isVegetarian ? 'Vegetarian' : it.isNonVeg ? 'Non-Vegetarian' : null,
      it.isJain ? 'Jain' : null,
      it.isGlutenFree ? 'Gluten-Free' : null,
      it.spiceLevel > 0 ? `${'🌶'.repeat(Math.min(it.spiceLevel, 3))} Spice level ${it.spiceLevel}` : null,
    ].filter(Boolean);
    const allergenNote = it.allergens && it.allergens.length ? ` Contains: ${it.allergens.join(', ')}.` : '';
    return `• ${it.name} — ₹${it.price}\n  ${it.description}${allergenNote}${tags.length ? ` Tags: ${tags.join(', ')}.` : ''}`;
  });
  return `Here are details for the dish(es) you asked about:\n\n${lines.join('\n\n')}`;
};

const INTENTS = [
  {
    key: 'waiter',
    keywords: ['waiter', 'human', 'talk to staff', 'call someone'],
    handler: () => ({
      reply: 'Of course! Tap the golden "Call Waiter" button at the bottom-right of your screen and a member of our team will be right with you.',
      quickOptions: INITIAL_QUICK_OPTIONS,
    }),
  },
  {
    key: 'specials',
    keywords: ['special', 'chef recommend', 'chef\'s', 'recommend', 'bestseller', 'best seller', 'popular', 'today'],
    handler: async () => {
      const [chefSpecials, popular] = await Promise.all([
        MenuItem.find({ isChefSpecial: true, isAvailable: true }).limit(5).lean(),
        MenuItem.find({ isBestSeller: true, isAvailable: true }).limit(5).lean(),
      ]);
      const sections = [];
      if (chefSpecials.length) sections.push(`*Chef's Signature Recommendations*\n${formatItems(chefSpecials)}`);
      if (popular.length) sections.push(`*Most Popular with Guests*\n${formatItems(popular)}`);
      return {
        reply: sections.length
          ? sections.join('\n\n')
          : "I couldn't find any featured specials right now. Please check the menu page for the latest dishes.",
        quickOptions: INITIAL_QUICK_OPTIONS,
      };
    },
  },
  {
    key: 'coupons',
    keywords: ['coupon', 'discount', 'offer', 'promo', 'deal'],
    handler: async () => {
      const coupons = await Coupon.find({ isActive: true }).lean();
      if (!coupons.length) {
        return { reply: 'There are no active offers right now, but please check back soon!', quickOptions: INITIAL_QUICK_OPTIONS };
      }
      const lines = coupons.map((c) => `• ${c.title} (Code: ${c.code}) — ${c.description}`);
      return {
        reply: `Here are our active offers:\n\n${lines.join('\n')}`,
        quickOptions: [{ label: 'Best Value Dishes', query: 'Show me affordable dishes' }],
      };
    },
  },
  {
    key: 'dietary',
    keywords: ['vegetarian', 'veg', 'jain', 'gluten', 'vegan', 'allergen', 'diet'],
    handler: async () => {
      const [veg, jain, glutenFree] = await Promise.all([
        MenuItem.find({ isVegetarian: true, isAvailable: true }).limit(6).lean(),
        MenuItem.find({ isJain: true, isAvailable: true }).limit(6).lean(),
        MenuItem.find({ isGlutenFree: true, isAvailable: true }).limit(6).lean(),
      ]);
      const sections = [];
      if (veg.length) sections.push(`*Vegetarian*\n${formatItems(veg)}`);
      if (jain.length) sections.push(`*Jain Options*\n${formatItems(jain)}`);
      if (glutenFree.length) sections.push(`*Gluten-Free*\n${formatItems(glutenFree)}`);
      return {
        reply: `We have options across all dietary preferences:\n\n${sections.join('\n\n')}\n\nFor specific allergens, let the kitchen know in the order notes and our chefs will accommodate you.`,
        quickOptions: INITIAL_QUICK_OPTIONS,
      };
    },
  },
  {
    key: 'spice',
    keywords: ['spicy', 'spice', 'mild', 'customiz', 'modification', 'less spicy'],
    handler: () => ({
      reply: 'Spice levels range from 0 (Mild) to 3 (Very Spicy) and are shown on each dish. Most dishes can be customized — e.g. extra butter, cooking preference, or spice adjustment — right from the dish detail page when you tap an item in the menu.',
      quickOptions: [{ label: 'See Spiciest Dishes', query: 'Which dishes are spicy?' }],
    }),
  },
  {
    key: 'pricing',
    keywords: ['price', 'pricing', 'cost', 'cheap', 'budget', 'afford', 'value', 'combo', 'under'],
    handler: async () => {
      const [budget, pricey] = await Promise.all([
        MenuItem.find({ isAvailable: true }).sort({ price: 1 }).limit(5).lean(),
        MenuItem.find({ isAvailable: true }).sort({ price: -1 }).limit(5).lean(),
      ]);
      const reply = [
        budget.length ? `*Best Value Dishes (under ₹${budget[budget.length - 1].price + 1})\n${formatItems(budget)}` : null,
        pricey.length ? `*Signature Premium Dishes*\n${formatItems(pricey)}` : null,
      ].filter(Boolean).join('\n\n');
      return {
        reply: `${reply}\n\nPrices include all taxes as per restaurant policy. Ask me about offers for extra savings!`,
        quickOptions: [{ label: 'Active Offers & Coupons', query: 'Show me coupons and discounts' }],
      };
    },
  },
  {
    key: 'reservations',
    keywords: ['reserve', 'booking', 'reservation', 'book a table'],
    handler: () => ({
      reply: STATIC_KNOWLEDGE.reservations,
      quickOptions: INITIAL_QUICK_OPTIONS,
    }),
  },
  {
    key: 'policies',
    keywords: ['hour', 'timing', 'open', 'close', 'parking', 'location', 'policy', 'dress', 'wallet', 'valet'],
    handler: async () => {
      const faqs = await Faq.find({ isActive: true }).limit(5).lean();
      const lines = [STATIC_KNOWLEDGE.hours, STATIC_KNOWLEDGE.location, STATIC_KNOWLEDGE.parking, STATIC_KNOWLEDGE.dressing];
      faqs.forEach((f) => lines.push(`${f.question}: ${f.answer}`));
      return {
        reply: lines.join('\n\n'),
        quickOptions: [{ label: 'Make a Reservation', query: 'How do I make a reservation?' }],
      };
    },
  },
  {
    key: 'menu',
    keywords: ['menu', 'cuisine', 'categories', 'what do you serve', 'food', 'dish', 'beverage', 'dessert'],
    handler: async () => {
      const categories = await Category.find().sort('displayOrder').lean();
      const names = categories.map((c) => c.name);
      return {
        reply: `Our menu covers: ${names.join(', ')}.\n\nBrowse the menu page to see every dish with photos, prices, and customizations. Ask me about any specific dish and I'll share the details.`,
        quickOptions: [{ label: "Today's Specials", query: "What are today's specials?" }],
      };
    },
  },
];

async function findMatchingFaq(normalizedMessage) {
  const faqs = await Faq.find({ isActive: true }).lean();
  const words = normalizedMessage.split(/\W+/).filter((w) => w.length > 3);
  return faqs.find((f) => {
    const questionWords = f.question.toLowerCase().split(/\W+/);
    return questionWords.some((qw) => qw.length > 3 && words.includes(qw));
  });
}

async function handleQuery(message) {
  const normalized = String(message || '').toLowerCase().trim();
  if (!normalized) {
    return { reply: 'Please ask me a question or pick an option below.', quickOptions: INITIAL_QUICK_OPTIONS };
  }

  const matchedDishes = await findDishesByWords(normalized);
  if (matchedDishes.length > 0) {
    return { reply: dishReply(matchedDishes), quickOptions: [{ label: 'Best Value Dishes', query: 'Show me affordable dishes' }] };
  }

  for (const intent of INTENTS) {
    if (intent.keywords.some((k) => normalized.includes(k))) {
      return intent.handler();
    }
  }

  const faq = await findMatchingFaq(normalized);
  if (faq) {
    return { reply: faq.answer, quickOptions: INITIAL_QUICK_OPTIONS };
  }

  // ponytail: rule-based fallback; upgrade to LLM (Groq/LangChain) with this DB data as grounding if free-text coverage needs to grow.
  return {
    reply: "I couldn't find an exact answer for that yet. Let me check with the chef or manager. Meanwhile, here's how I can help:",
    quickOptions: INITIAL_QUICK_OPTIONS,
  };
}

module.exports = { handleQuery, INITIAL_QUICK_OPTIONS };
