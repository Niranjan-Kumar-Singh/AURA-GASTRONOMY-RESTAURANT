const Groq = require('groq-sdk');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Faq = require('../models/Faq');

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};
const MODEL = 'openai/gpt-oss-20b';

// Static slow-changing facts (hours, parking, policies). Live menu/coupon data is fetched via the LLM's DB tool.
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

const TOOL = {
  type: 'function',
  function: {
    name: 'search_menu_database',
    description:
      'Search AURA restaurant database collections (menu_items, categories, coupons, faqs) and return matching records. Use for any question about dishes, prices, dietary options (vegetarian/Jain/gluten-free), allergens, spice levels, chef specials, best sellers, or active offers. The filter is a MongoDB query document.',
    parameters: {
      type: 'object',
      properties: {
        collection: { type: 'string', enum: ['menu_items', 'categories', 'coupons', 'faqs'] },
        filter: { type: 'object', description: 'MongoDB filter query, e.g. {"isVegetarian": true} or {"isBestSeller": true}. Empty object returns any records.' },
        sort: { type: 'object', description: 'MongoDB sort, e.g. {"price": 1} for cheapest first.', default: {} },
        limit: { type: 'integer', description: 'Max records to return (1-10).', default: 5 },
      },
      required: ['collection', 'filter'],
    },
  },
};

const COLLECTIONS = {
  menu_items: MenuItem,
  categories: Category,
  coupons: Coupon,
  faqs: Faq,
};

const MENU_ITEM_PROJECTION = {
  id: 1, name: 1, categoryId: 1, price: 1, description: 1, isVegetarian: 1, isNonVeg: 1, isJain: 1,
  isGlutenFree: 1, isChefSpecial: 1, isBestSeller: 1, isAvailable: 1, spiceLevel: 1,
  preparationTimeMinutes: 1, allergens: 1, rating: 1, reviewCount: 1,
};

const ALLOWED_OPS = new Set(['$in', '$nin', '$gt', '$gte', '$lt', '$lte', '$ne', '$eq', '$regex', '$options', '$exists', '$and', '$or']);

// Strip prototype-pollution keys and disallowed operators from LLM-generated filters.
function sanitize(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitize);
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    if (key.startsWith('$') && !ALLOWED_OPS.has(key)) continue;
    out[key] = sanitize(val);
  }
  return out;
}

async function executeToolCall(rawArgs) {
  let args;
  try {
    args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
  } catch {
    return { error: 'Invalid tool arguments JSON.' };
  }

  const model = COLLECTIONS[args.collection];
  if (!model) {
    return { error: `Unknown collection "${args.collection}". Use one of: ${Object.keys(COLLECTIONS).join(', ')}.` };
  }

  const filter = sanitize(args.filter || {});
  const sort = sanitize(args.sort) || {};
  const limit = Math.min(Math.max(parseInt(args.limit, 10) || 5, 1), 10);

  let query = model.find(filter);
  if (args.collection === 'menu_items') query = query.select(MENU_ITEM_PROJECTION);
  if (Object.keys(sort).length > 0) query = query.sort(sort);
  const results = await query.limit(limit).lean();

  return { collection: args.collection, count: results.length, results };
}

const SYSTEM_PROMPT = `You are AURA's 5-Star Virtual Sommelier & Master Dining Host, representing AURA Fine Dining in Indiranagar, Bengaluru.
Your objective is to deliver world-class 5-star hospitality to guests while driving revenue, upselling signature pairings, and assisting table sessions with total clarity.

Dual Perspective Guidelines:

1. GUEST PERSPECTIVE (Excellence & Clarity):
- Provide clear, mouth-watering dish descriptions with exact prices in Indian Rupees (₹), spice levels, preparation times, and dietary tags (Vegetarian, Non-Veg, Jain, Gluten-Free).
- Proactively explain active coupons (WELCOME100: ₹100 Off over ₹499; AURAVIP: 15% Off) and Spend-More unlocked reward tiers (₹500: Free Naan/Coke; ₹1000: Free Lime Soda/Truffle Dip; ₹2000: Free Lava Cake/Gelato).
- Make ordering effortless by giving helpful guidance on customizations ("Extra Garlic", "Less Salt") and table services.

2. RESTAURANT PERSPECTIVE (Upselling & Operational Efficiency):
- Always suggest high-margin, signature pairings (e.g. "Pair your Wagyu Ribeye with our Saffron & Gold Elixir or Truffle Mashed Potatoes!").
- Encourage guests to add sides, beverages, or reach the next spend tier for a free reward.
- If a guest needs immediate table assistance, waiter service, bill split, or refills, instruct them to tap the golden "Call Waiter" button on their screen so staff are alerted on POS/KDS.

Tone: Warm, sophisticated, luxurious, 5-star hospitality. Format all prices with ₹. Keep responses structured and elegant.`;

async function askLLM(userMessage) {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error('GROQ_API_KEY environment variable is not configured');
  }

  // Pre-fetch matching dishes if specific menu keywords are present
  let preloadedDishes = [];
  try {
    const words = userMessage.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    if (words.length > 0) {
      preloadedDishes = await MenuItem.find({
        $or: [
          { name: { $regex: words.join('|'), $options: 'i' } },
          { description: { $regex: words.join('|'), $options: 'i' } },
        ],
      })
        .select(MENU_ITEM_PROJECTION)
        .limit(6)
        .lean();
    }
  } catch (e) {
    // Ignore pre-fetch errors
  }

  let userContextPrompt = userMessage;
  if (preloadedDishes.length > 0) {
    userContextPrompt += `\n\n[Live Menu Database Context]: ${JSON.stringify(preloadedDishes)}`;
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContextPrompt },
  ];

  for (let i = 0; i < 3; i++) {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools: [TOOL],
      tool_choice: 'auto',
      temperature: 0.4,
    });

    const msg = completion.choices[0].message;

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push({
        role: 'assistant',
        content: msg.content || '',
        tool_calls: msg.tool_calls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.function.name, arguments: tc.function.arguments },
        })),
      });
      for (const tc of msg.tool_calls) {
        let result;
        try {
          result = await executeToolCall(tc.function.arguments);
        } catch (e) {
          result = { error: e.message };
        }
        messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result).slice(0, 6000) });
      }
      continue;
    }

    let cleanReply = msg.content || "I couldn't find an answer for that. Please try rephrasing.";
    cleanReply = cleanReply.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').replace(/`/g, '');
    return cleanReply;
  }

  return "I couldn't finish answering that. Please try rephrasing your question.";
}

const quickOptionsWithout = (...labels) =>
  INITIAL_QUICK_OPTIONS.filter((o) => !labels.includes(o.label));

// Rule-based FAQ intents: static knowledge + Faq collection. No LLM needed.
const FAQ_INTENTS = [
  {
    key: 'waiter',
    keywords: ['waiter', 'human', 'talk to staff', 'call someone', 'staff', 'bill', 'water', 'refill'],
    handler: () => ({
      reply: 'Of course! Tap the golden "Call Waiter" button at the bottom-right of your screen and a member of our team will be right with you at Table 7.',
      quickOptions: quickOptionsWithout('Talk to a Waiter'),
    }),
  },
  {
    key: 'reservations',
    keywords: ['reserve', 'booking', 'reservation', 'book a table', 'table'],
    handler: () => ({
      reply: STATIC_KNOWLEDGE.reservations,
      quickOptions: quickOptionsWithout('Reservations & Booking'),
    }),
  },
  {
    key: 'policies',
    keywords: ['hour', 'timing', 'open', 'close', 'parking', 'location', 'policy', 'dress', 'valet'],
    handler: async () => {
      const faqs = await Faq.find({ isActive: true }).limit(5).lean();
      const lines = [STATIC_KNOWLEDGE.hours, STATIC_KNOWLEDGE.location, STATIC_KNOWLEDGE.parking, STATIC_KNOWLEDGE.dressing];
      faqs.forEach((f) => lines.push(`${f.question}: ${f.answer}`));
      return { reply: lines.join('\n\n'), quickOptions: quickOptionsWithout('Hours, Parking & Policies', 'Reservations & Booking') };
    },
  },
];

async function findMatchingFaq(normalizedMessage) {
  const faqs = await Faq.find({ isActive: true }).lean();
  const words = normalizedMessage.split(/\W+/).filter((w) => w.length > 3);
  return faqs.find((f) => {
    const questionWords = f.question.toLowerCase().split(/\W+/);
    const shared = questionWords.filter((qw) => qw.length > 3 && words.includes(qw));
    return shared.length >= 2;
  });
}

// Fallback search engine directly querying MongoDB when Groq API key is unavailable or fails
async function findSmartMenuMatches(normalizedQuery) {
  try {
    // 1. Non-Vegetarian Check (Must precede veg check)
    if (normalizedQuery.includes('non veg') || normalizedQuery.includes('non-veg') || normalizedQuery.includes('nonveg') || normalizedQuery.includes('chicken') || normalizedQuery.includes('mutton') || normalizedQuery.includes('meat') || normalizedQuery.includes('seafood') || normalizedQuery.includes('lamb') || normalizedQuery.includes('wagyu')) {
      const items = await MenuItem.find({ $or: [{ isNonVeg: true }, { isVegetarian: false }] }).limit(6).lean();
      if (items.length) {
        return `Here are AURA's Signature Non-Vegetarian Delicacies:\n\n` +
          items.map(it => `• ${it.name} — ₹${it.price}\n  ${it.description}\n  💡 Chef Tip: Pair with Wood-Fired Garlic Butter Naan or Kashmiri Saffron Basmati Rice!`).join('\n\n');
      }
    }

    // 2. Pure Vegetarian Check (Only if not non-veg)
    if ((normalizedQuery.includes('veg') || normalizedQuery.includes('vegetarian')) && !normalizedQuery.includes('non')) {
      const items = await MenuItem.find({ isVegetarian: true }).limit(6).lean();
      if (items.length) {
        return `Here are our top Vegetarian creations:\n\n` +
          items.map(it => `• ${it.name} — ₹${it.price}\n  ${it.description}\n  💡 Chef Tip: 100% Pure Vegetarian & Crafted with French Cultured Butter.`).join('\n\n');
      }
    }

    if (normalizedQuery.includes('special') || normalizedQuery.includes('best') || normalizedQuery.includes('recommend') || normalizedQuery.includes('signature') || normalizedQuery.includes('pick')) {
      const items = await MenuItem.find({ $or: [{ isChefSpecial: true }, { isBestSeller: true }] }).limit(6).lean();
      if (items.length) {
        return `Here are AURA's Signature Masterpiece Dishes:\n\n` +
          items.map(it => `• ${it.name} — ₹${it.price}\n  ${it.description}`).join('\n\n');
      }
    }

    if (normalizedQuery.includes('coupon') || normalizedQuery.includes('offer') || normalizedQuery.includes('discount') || normalizedQuery.includes('code') || normalizedQuery.includes('deal')) {
      const coupons = await Coupon.find({ isActive: true }).limit(5).lean();
      let resText = `🎁 Active Offers & Spend Rewards:\n\n`;
      if (coupons.length) {
        resText += `🎟️ PROMO CODES:\n` + coupons.map(c => `• ${c.code}: ${c.description} (Min Order: ₹${c.minOrderAmount})`).join('\n') + `\n\n`;
      }
      resText += `🏆 SPEND-MORE REWARD TIERS (Auto-Applied in Cart):\n` +
        `• Spend ₹500 ➔ Free Wood-Fired Garlic Naan or Chilled Coca-Cola (Save ₹90)\n` +
        `• Spend ₹1,000 ➔ Free Fresh Mint Lime Soda or Truffle Dip (Save ₹85)\n` +
        `• Spend ₹2,000 ➔ Free Valrhona Chocolate Lava Cake or Gelato (Save ₹220)`;
      return resText;
    }

    if (normalizedQuery.includes('jain')) {
      const items = await MenuItem.find({ isJain: true }).limit(5).lean();
      if (items.length) {
        return `Here are our pure Jain offerings:\n\n` +
          items.map(it => `• ${it.name} — ₹${it.price}\n  ${it.description}`).join('\n\n');
      }
    }

    if (normalizedQuery.includes('gluten')) {
      const items = await MenuItem.find({ isGlutenFree: true }).limit(5).lean();
      if (items.length) {
        return `Here are our Gluten-Free selections:\n\n` +
          items.map(it => `• ${it.name} — ₹${it.price}\n  ${it.description}`).join('\n\n');
      }
    }

    if (normalizedQuery.includes('price') || normalizedQuery.includes('pricing') || normalizedQuery.includes('cheap') || normalizedQuery.includes('combo') || normalizedQuery.includes('cost') || normalizedQuery.includes('value')) {
      const items = await MenuItem.find({ price: { $lte: 500 } }).sort({ price: 1 }).limit(6).lean();
      if (items.length) {
        return `Here are our Best Value gourmet creations (under ₹500):\n\n` +
          items.map(it => `• ${it.name} — ₹${it.price}\n  ${it.description}`).join('\n\n');
      }
    }

    if (normalizedQuery.includes('spice') || normalizedQuery.includes('custom') || normalizedQuery.includes('spicy')) {
      return `Our dishes feature customizable spice levels:\n\n` +
        `• 0 (Mild) — Delicately seasoned with French herbs & mild cream\n` +
        `• 1 (Medium) — Balanced aromatic Indian spices\n` +
        `• 2 (Spicy) — Bold roasted Guntur chilli & Sichuan pepper\n\n` +
        `You can add custom notes (e.g., "Extra Garlic", "Less Salt") to any dish in your cart!`;
    }

    // Explicit food term matching only (avoids matching common words like "aura" or "the")
    const FOOD_KEYWORDS = [
      'pizza', 'pasta', 'steak', 'naan', 'biryani', 'chicken', 'lobster', 'sea bass',
      'bass', 'gelato', 'cake', 'coke', 'soup', 'drink', 'salad', 'rice', 'bread',
      'dessert', 'starter', 'curry', 'lamb', 'wagyu', 'truffle', 'burrata', 'mutton',
      'prawn', 'fish', 'mocktail', 'cocktail', 'beverage', 'side', 'extra', 'sauce'
    ];

    const matchedKeywords = FOOD_KEYWORDS.filter(kw => normalizedQuery.includes(kw));
    if (matchedKeywords.length > 0) {
      const regexPattern = matchedKeywords.join('|');
      const items = await MenuItem.find({
        $or: [
          { name: { $regex: regexPattern, $options: 'i' } },
          { description: { $regex: regexPattern, $options: 'i' } }
        ]
      }).limit(5).lean();

      if (items.length) {
        return `Here is what I found on our menu for "${matchedKeywords.join(', ')}":\n\n` +
          items.map(it => `• ${it.name} — ₹${it.price}\n  ${it.description}`).join('\n\n');
      }
    }
  } catch (e) {
    console.error('Failed smart menu match:', e);
  }
  return null;
}

async function handleQuery(message) {
  const normalized = String(message || '').toLowerCase().trim();
  if (!normalized) {
    return { reply: 'Please ask me a question or pick an option below.', quickOptions: INITIAL_QUICK_OPTIONS };
  }

  // 1. Rule-based FAQ intents first (hours, parking, policies, reservations, waiter).
  for (const intent of FAQ_INTENTS) {
    if (intent.keywords.some((k) => normalized.includes(k))) {
      return intent.handler();
    }
  }

  // 2. Rule-based FAQ keyword match from stored Faq collection.
  const faq = await findMatchingFaq(normalized);
  if (faq) {
    return { reply: faq.answer, quickOptions: INITIAL_QUICK_OPTIONS };
  }

  // 3. Smart MongoDB Menu, Pricing, Dietary & Offers Search (for instant 100% accurate responses)
  const menuMatch = await findSmartMenuMatches(normalized);
  if (menuMatch) {
    return { reply: menuMatch, quickOptions: INITIAL_QUICK_OPTIONS };
  }

  // 4. Try Groq AI Sommelier (openai/gpt-oss-20b) with live MongoDB context for conversational questions
  if (process.env.GROQ_API_KEY) {
    try {
      const reply = await askLLM(message);
      if (reply && reply.length > 10 && !reply.includes("couldn't find an answer")) {
        return { reply, quickOptions: INITIAL_QUICK_OPTIONS };
      }
    } catch (error) {
      console.error('Chatbot LLM error:', error.message);
    }
  }

  // 5. Friendly fallback response with quick options
  return {
    reply: "Welcome to AURA Fine Dining! I am your 5-Star Sommelier & Host. How can I assist your dining experience today?",
    quickOptions: INITIAL_QUICK_OPTIONS,
  };
}

module.exports = { handleQuery, INITIAL_QUICK_OPTIONS };