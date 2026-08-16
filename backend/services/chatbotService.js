const Groq = require('groq-sdk');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Faq = require('../models/Faq');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

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

const SYSTEM_PROMPT = `You are AURA's friendly virtual assistant for AURA Fine Dining, a luxury French-Indian bistro in Indiranagar, Bengaluru.
Rules:
- For ANY question about dishes, menu, pricing, dietary options, allergens, spice levels, chef specials, best sellers, coupons/offers, or anything stored in the database, you MUST call the search_menu_database tool to fetch real data before answering. Never invent prices or dishes.
- Build your answer ONLY from the data the tool returns. If a search returns nothing, say so politely and suggest what is available.
- Answer concisely (3-6 sentences), in a warm, conversational waiter tone. Use plain text with line breaks only; NO markdown symbols (*, #, **).
- If the user asks about hours, parking, reservations, policies or to call a waiter, answer briefly from general knowledge: open 11 AM-11:30 PM daily, complimentary valet parking, reservations via the host or menu page, and suggest tapping the "Call Waiter" button for human help.`;

async function askLLM(userMessage) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ];

  for (let i = 0; i < 3; i++) {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools: [TOOL],
      tool_choice: 'auto',
      temperature: 0.5,
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

    return msg.content || "I couldn't find an answer for that. Please try rephrasing.";
  }

  return "I couldn't finish answering that. Please try rephrasing your question.";
}

const quickOptionsWithout = (...labels) =>
  INITIAL_QUICK_OPTIONS.filter((o) => !labels.includes(o.label));

// Rule-based FAQ intents: static knowledge + Faq collection. No LLM needed.
const FAQ_INTENTS = [
  {
    key: 'waiter',
    keywords: ['waiter', 'human', 'talk to staff', 'call someone'],
    handler: () => ({
      reply: 'Of course! Tap the golden "Call Waiter" button at the bottom-right of your screen and a member of our team will be right with you.',
      quickOptions: quickOptionsWithout('Talk to a Waiter'),
    }),
  },
  {
    key: 'reservations',
    keywords: ['reserve', 'booking', 'reservation', 'book a table'],
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

  // 2. Rule-based FAQ keyword match from the stored Faq collection.
  const faq = await findMatchingFaq(normalized);
  if (faq) {
    return { reply: faq.answer, quickOptions: INITIAL_QUICK_OPTIONS };
  }

  // 3. Everything else: Groq LLM answers, using the DB tool to generate & run the query.
  if (process.env.GROQ_API_KEY) {
    try {
      const reply = await askLLM(message);
      return { reply, quickOptions: INITIAL_QUICK_OPTIONS };
    } catch (error) {
      console.error('Chatbot LLM error:', error.message);
      return {
        reply: "I'm having trouble reaching my assistant right now. Let me check with the chef or manager, or try one of the options below.",
        quickOptions: INITIAL_QUICK_OPTIONS,
      };
    }
  }

  return {
    reply: "I couldn't find an exact answer for that yet. Let me check with the chef or manager. Meanwhile, here's how I can help:",
    quickOptions: INITIAL_QUICK_OPTIONS,
  };
}

module.exports = { handleQuery, INITIAL_QUICK_OPTIONS };