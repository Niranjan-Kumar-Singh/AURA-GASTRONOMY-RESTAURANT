require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Coupon = require('./models/Coupon');
const Faq = require('./models/Faq');
const Gallery = require('./models/Gallery');
const connectDB = require('./config/db');

const MOCK_CATEGORIES = [
  { id: 1, name: "Chef's Specials", icon: 'Sparkles', displayOrder: 1 },
  { id: 2, name: "Today's Special", icon: 'Flame', displayOrder: 2 },
  { id: 3, name: 'North Indian', icon: 'Utensils', displayOrder: 3 },
  { id: 4, name: 'Tandoor & Charcoal Grills', icon: 'Flame', displayOrder: 4 },
  { id: 5, name: 'Rice & Biryani', icon: 'Soup', displayOrder: 5 },
  { id: 6, name: 'Italian & Truffles', icon: 'Pizza', displayOrder: 6 },
  { id: 7, name: 'Asian & Dim Sum', icon: 'Bowl', displayOrder: 7 },
  { id: 8, name: 'Desserts & Sweets', icon: 'Cake', displayOrder: 8 },
  { id: 9, name: 'Fine Beverages', icon: 'Glass', displayOrder: 9 },
];

const MOCK_MENU_ITEMS = [
  {
    id: 101, categoryId: 1, name: 'Dal AURA 36-Hour Charcoal Dum',
    description: 'Signature black lentils slow-simmered over applewood charcoal for 36 hours with white butter, Kasuri Methi, and organic cream.',
    price: 450, imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
    isVegetarian: true, isGlutenFree: true, isChefSpecial: true, isBestSeller: true, spiceLevel: 1,
    calories: 420, rating: 4.9, reviewCount: 384, preparationTimeMinutes: 12,
    ingredients: ['Black Urad Dal', 'White Butter', 'Kasuri Methi', 'Kashmiri Red Chilli', 'Fresh Cream'], allergens: ['Dairy'],
    customizationGroups: [
      { id: 'cg-butter', title: 'Butter Preference', required: false, options: [{ id: 'opt-white-butter', name: 'Extra White Butter', price: 40 }, { id: 'opt-less-butter', name: 'Less Butter', price: 0 }] },
      { id: 'cg-naan', title: 'Recommended Bread Pairing', required: false, options: [{ id: 'opt-garlic-naan', name: 'Add Truffle Garlic Naan', price: 120 }, { id: 'opt-butter-naan', name: 'Add Butter Naan', price: 80 }] },
    ],
  },
  {
    id: 102, categoryId: 1, name: 'Japanese Wagyu Ribeye with Marrow Butter',
    description: 'Grade A5 Japanese Wagyu Ribeye seared over white oak charcoal, served with smoked bone marrow butter and black truffle reduction.',
    price: 2400, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isNonVeg: true, isGlutenFree: true, isChefSpecial: true, spiceLevel: 1,
    calories: 780, rating: 4.95, reviewCount: 210, preparationTimeMinutes: 18,
    ingredients: ['A5 Wagyu Ribeye', 'Bone Marrow Butter', 'Norcia Black Truffle', 'Sea Salt Flakes'], allergens: ['Dairy'],
    customizationGroups: [
      { id: 'cg-doneness', title: 'Cooking Preference', required: true, options: [{ id: 'opt-med-rare', name: 'Medium Rare (Recommended)', price: 0 }, { id: 'opt-medium', name: 'Medium', price: 0 }, { id: 'opt-well-done', name: 'Well Done', price: 0 }] },
    ],
  },
  {
    id: 201, categoryId: 2, name: 'Kashmiri Saffron Zafrani Murgh Tikka',
    description: 'Free-range boneless chicken thighs marinated overnight in Pampore saffron, Greek yogurt, and mace, roasted in clay tandoor.',
    price: 650, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',
    isNonVeg: true, isGlutenFree: true, isBestSeller: true, spiceLevel: 2,
    calories: 520, rating: 4.88, reviewCount: 165, preparationTimeMinutes: 15,
    ingredients: ['Chicken Thighs', 'Pampore Saffron', 'Hung Curd', 'Mace', 'Cardamom'], allergens: ['Dairy'],
  },
  {
    id: 202, categoryId: 2, name: 'Avocado & Truffle Edamame Galette',
    description: 'Crispy pan-seared edamame and hass avocado galettes served with mint cilantro chutney and black garlic mousse.',
    price: 490, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    isVegetarian: true, isGlutenFree: true, isJain: true, spiceLevel: 1,
    calories: 310, rating: 4.75, reviewCount: 94, preparationTimeMinutes: 12,
    ingredients: ['Hass Avocado', 'Edamame', 'Mint', 'Black Garlic', 'Rock Salt'],
  },
  {
    id: 301, categoryId: 3, name: 'Old Delhi Velvet Butter Chicken',
    description: 'Charcoal-grilled tandoori chicken cooked in a rich tomato, cashew nut, and fenugreek gravy with unclarified butter.',
    price: 680, imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    isNonVeg: true, isGlutenFree: true, isBestSeller: true, spiceLevel: 2,
    calories: 640, rating: 4.92, reviewCount: 512, preparationTimeMinutes: 16,
    ingredients: ['Tandoori Chicken', 'San Marzano Tomatoes', 'Cashew Paste', 'Amul Butter', 'Kasuri Methi'], allergens: ['Dairy', 'Nuts'],
  },
  {
    id: 302, categoryId: 3, name: 'Paneer Lababdar Saffron Korma',
    description: 'Fresh cottage cheese cubes folded into a velvety onion-tomato and saffron gravy laced with roasted bell peppers.',
    price: 480, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
    isVegetarian: true, isGlutenFree: true, spiceLevel: 1,
    calories: 480, rating: 4.82, reviewCount: 230, preparationTimeMinutes: 14,
    ingredients: ['Fresh Malai Paneer', 'Tomatoes', 'Bell Peppers', 'Cream', 'Spices'], allergens: ['Dairy'],
  },
  {
    id: 501, categoryId: 5, name: 'Awadhi Dum Gosht Lamb Biryani',
    description: 'Aromatic long-grain aged Basmati rice layered with tender lamb shanks, saffron, kewra water, cooked under dough seal.',
    price: 750, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    isNonVeg: true, isGlutenFree: true, isChefSpecial: true, spiceLevel: 2,
    calories: 720, rating: 4.94, reviewCount: 420, preparationTimeMinutes: 22,
    ingredients: ['Aged Basmati Rice', 'Baby Lamb Shanks', 'Kashmiri Saffron', 'Kewra Water', 'Fried Onions'], allergens: ['Dairy'],
  },
  {
    id: 601, categoryId: 6, name: 'Norcia Black Truffle Tagliolini',
    description: 'Fresh hand-cut egg tagliolini tossed in 36-month Parmigiano Reggiano wheel with shaved Italian black truffle.',
    price: 1200, imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    isVegetarian: true, isChefSpecial: true, spiceLevel: 0,
    calories: 540, rating: 4.89, reviewCount: 188, preparationTimeMinutes: 14,
    ingredients: ['Egg Tagliolini', 'Parmigiano Reggiano', 'Norcia Black Truffle', 'Cultured Butter'], allergens: ['Dairy', 'Gluten', 'Egg'],
  },
  {
    id: 801, categoryId: 8, name: '24K Gold Leaf Valrhona Chocolate Sphere',
    description: 'Dark Valrhona chocolate dome encrusted with edible 24K gold leaf, melted table-side with warm salted caramel sauce.',
    price: 850, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    isVegetarian: true, isChefSpecial: true, spiceLevel: 0,
    calories: 490, rating: 4.98, reviewCount: 310, preparationTimeMinutes: 10,
    ingredients: ['Valrhona 70% Dark Chocolate', '24K Gold Leaf', 'Salted Caramel', 'Madagascar Vanilla Mousse'], allergens: ['Dairy'],
  },
  {
    id: 802, categoryId: 8, name: 'Shahi Kesari Gulab Jamun with Rabri',
    description: 'Hot saffron-stuffed cottage cheese dumplings served over chilled pistachio rabri and silver leaf.',
    price: 280, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    isVegetarian: true, spiceLevel: 0,
    calories: 380, rating: 4.85, reviewCount: 240, preparationTimeMinutes: 8,
    ingredients: ['Mawa Khoya', 'Pampore Saffron', 'Condensed Milk', 'Pistachios', 'Silver Leaf'], allergens: ['Dairy', 'Nuts'],
  },
  {
    id: 901, categoryId: 9, name: 'AURA Gold Smoked Botanical Elixir',
    description: 'Artisanal non-alcoholic elixir with wild elderflower, gold flakes, smoked cinnamon bark, and fresh Japanese yuzu.',
    price: 350, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    isVegetarian: true, isGlutenFree: true, spiceLevel: 0,
    calories: 120, rating: 4.91, reviewCount: 175, preparationTimeMinutes: 5,
    ingredients: ['Wild Elderflower', 'Edible Gold Flakes', 'Cinnamon Bark', 'Yuzu Juice', 'Sparkling Water'],
  },
];

const MOCK_COUPONS = [
  { code: 'WELCOME100', title: 'Flat ₹100 Off', discountAmount: 100, minOrderAmount: 500, description: 'Get ₹100 off on your first AURA dining session order above ₹500.' },
  { code: 'AURA200', title: 'Luxury Dining ₹200 Off', discountAmount: 200, minOrderAmount: 1200, description: 'Get ₹200 off on orders above ₹1,200.' },
  { code: 'CHEF500', title: 'Chef Special ₹500 Discount', discountAmount: 500, minOrderAmount: 2500, description: 'Exclusive ₹500 discount for orders featuring Chef Specials above ₹2,500.' }
];

const MOCK_FAQS = [
  { question: 'What is the dress code?', answer: 'We request smart casual attire. No sportswear or beachwear.', category: 'Dining' },
  { question: 'Do you cater to dietary requirements?', answer: 'Yes, we offer Jain, gluten-free, and vegan options. Please inform us in advance or add notes to your order.', category: 'Food' },
  { question: 'Is parking available?', answer: 'We provide complimentary valet parking for all our guests.', category: 'General' },
  { question: 'Can I book the VIP Lounge?', answer: 'The VIP Lounge requires prior reservation and has a minimum spend. Contact our concierge.', category: 'Reservations' }
];

const MOCK_GALLERY = [
  { title: 'The Grand Dining Hall', description: 'Experience luxury in our main hall.', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80', category: 'Ambiance' },
  { title: 'Wagyu Signature', description: 'Grade A5 Japanese Wagyu.', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', category: 'Food' },
  { title: 'VIP Lounge', description: 'Exclusive private dining experience.', imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80', category: 'VIP Lounge' }
];

const seedDB = async () => {
  try {
    await connectDB();
    await Category.deleteMany();
    await MenuItem.deleteMany();
    await Coupon.deleteMany();
    await Faq.deleteMany();
    await Gallery.deleteMany();

    await Category.insertMany(MOCK_CATEGORIES);
    await MenuItem.insertMany(MOCK_MENU_ITEMS);
    await Coupon.insertMany(MOCK_COUPONS);
    await Faq.insertMany(MOCK_FAQS);
    await Gallery.insertMany(MOCK_GALLERY);

    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
