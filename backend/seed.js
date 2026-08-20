require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Coupon = require('./models/Coupon');
const Faq = require('./models/Faq');
const Gallery = require('./models/Gallery');
const connectDB = require('./config/db');

const MOCK_CATEGORIES = [
  {
    "id": 1,
    "name": "Chef's Signature Specials",
    "icon": "Sparkles",
    "displayOrder": 1
  },
  {
    "id": 2,
    "name": "Today's Popular Specials",
    "icon": "Flame",
    "displayOrder": 2
  },
  {
    "id": 3,
    "name": "North Indian Mughlai",
    "icon": "Utensils",
    "displayOrder": 3
  },
  {
    "id": 4,
    "name": "Tandoor & Charcoal Grills",
    "icon": "Flame",
    "displayOrder": 4
  },
  {
    "id": 5,
    "name": "Royal Dum Biryani & Pulao",
    "icon": "Soup",
    "displayOrder": 5
  },
  {
    "id": 6,
    "name": "Artisanal Breads & Naan",
    "icon": "Utensils",
    "displayOrder": 6
  },
  {
    "id": 7,
    "name": "Italian Pastas & Truffles",
    "icon": "Pizza",
    "displayOrder": 7
  },
  {
    "id": 8,
    "name": "Wood-Fired Neapolitan Pizza",
    "icon": "Pizza",
    "displayOrder": 8
  },
  {
    "id": 9,
    "name": "Pan-Asian Dim Sum & Bao",
    "icon": "Bowl",
    "displayOrder": 9
  },
  {
    "id": 10,
    "name": "Wok Specialties & Noodles",
    "icon": "Bowl",
    "displayOrder": 10
  },
  {
    "id": 11,
    "name": "Japanese Sushi & Sashimi",
    "icon": "Fish",
    "displayOrder": 11
  },
  {
    "id": 12,
    "name": "Soups & Artisanal Broths",
    "icon": "Soup",
    "displayOrder": 12
  },
  {
    "id": 13,
    "name": "Gourmet Salads & Bowls",
    "icon": "Leaf",
    "displayOrder": 13
  },
  {
    "id": 14,
    "name": "Sizzlers & Continental Mains",
    "icon": "Flame",
    "displayOrder": 14
  },
  {
    "id": 15,
    "name": "South Indian Artisanal",
    "icon": "Utensils",
    "displayOrder": 15
  },
  {
    "id": 16,
    "name": "Gourmet Desserts & Sweets",
    "icon": "Cake",
    "displayOrder": 16
  },
  {
    "id": 17,
    "name": "Artisanal Ice Cream & Gelato",
    "icon": "Cake",
    "displayOrder": 17
  },
  {
    "id": 18,
    "name": "Craft Mocktails & Elixirs",
    "icon": "Glass",
    "displayOrder": 18
  },
  {
    "id": 19,
    "name": "Fine Teas & Specialty Coffee",
    "icon": "Coffee",
    "displayOrder": 19
  },
  {
    "id": 20,
    "name": "Luxury Wine & Beverages",
    "icon": "Glass",
    "displayOrder": 20
  }
];
const MOCK_MENU_ITEMS = [
  {
    "id": 101,
    "categoryId": 1,
    "name": "Dal AURA 36-Hour Charcoal Dum",
    "description": "Signature black lentils slow-simmered over applewood charcoal for 36 hours with white butter, Kasuri Methi, and organic cream.",
    "price": 450,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": true,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 102,
    "categoryId": 1,
    "name": "Japanese Wagyu Ribeye with Marrow Butter",
    "description": "Grade A5 Japanese Wagyu Ribeye seared over white oak charcoal, served with smoked bone marrow butter and black truffle reduction.",
    "price": 2400,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 103,
    "categoryId": 1,
    "name": "Raan-e-AURA Royal Braised Lamb Leg",
    "description": "Whole leg of baby lamb marinated for 48 hours in royal spices, slow-cooked for 12 hours in almond saffron jus.",
    "price": 1850,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 104,
    "categoryId": 1,
    "name": "Smoked Chilean Sea Bass Saffron Glaze",
    "description": "Pan-roasted wild Chilean sea bass served over saffron smoked fennel risotto with lemon verbena emulsion.",
    "price": 2100,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 105,
    "categoryId": 1,
    "name": "24K Gold Foil Lobster Thermidor",
    "description": "Canadian lobster tail poached in cognac cream, topped with Gruyère cheese and 24K gold foil.",
    "price": 2800,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 106,
    "categoryId": 1,
    "name": "Black Truffle Burrata Spheres",
    "description": "Fresh Apulian burrata stuffed with black truffle caviar, served over heirloom tomato carpaccio.",
    "price": 890,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 107,
    "categoryId": 1,
    "name": "Wild Morel Mushroom & Saffron Korma",
    "description": "Himalayan wild Gucchi morels simmered in cashew-saffron gravy with gold leaf garnish.",
    "price": 920,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 108,
    "categoryId": 1,
    "name": "Smoked Duck Breast with Cherry Reduction",
    "description": "Sous-vide duck breast finished over applewood charcoal, served with dark cherry reduction.",
    "price": 1450,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 109,
    "categoryId": 1,
    "name": "Royal Caviar Blinis with Cultured Cream",
    "description": "Warm buckwheat blinis served with Imperial Beluga caviar, chives, and cultured French cream.",
    "price": 1950,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 110,
    "categoryId": 2,
    "name": "Kashmiri Saffron Zafrani Murgh Tikka",
    "description": "Free-range boneless chicken thighs marinated overnight in Pampore saffron, Greek yogurt, and mace, roasted in clay tandoor.",
    "price": 650,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": true,
    "spiceLevel": 2,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 111,
    "categoryId": 2,
    "name": "Avocado & Truffle Edamame Galette",
    "description": "Crispy pan-seared edamame and hass avocado galettes served with mint cilantro chutney and black garlic mousse.",
    "price": 490,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": true,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 112,
    "categoryId": 2,
    "name": "Tandoori Tiger Prawns Zafrani",
    "description": "Jumbo tiger prawns infused with crushed yellow chilli, lemon zest, and ajwain, seared over charcoal embers.",
    "price": 950,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": true,
    "spiceLevel": 2,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 113,
    "categoryId": 2,
    "name": "Charcoal Roasted Burrata Caprese Skewers",
    "description": "Fresh Pugliese burrata balls with charred heirloom cherry tomatoes and basil pesto balsamic glaze.",
    "price": 520,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 114,
    "categoryId": 2,
    "name": "Stuffed Morel Mushroom Galouti",
    "description": "Smoked Himalayan Morel mushroom galouti served over warm mini saffron parathas.",
    "price": 580,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 115,
    "categoryId": 2,
    "name": "Crispy Soft Shell Crab Soft Buns",
    "description": "Tempura soft shell crab inside charcoal steamed buns with spicy kimchi mayo.",
    "price": 780,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 116,
    "categoryId": 2,
    "name": "Smoked Salmon & Cream Cheese Pinwheels",
    "description": "Cured Atlantic salmon rolled with dill cream cheese, capers, and cucumber.",
    "price": 690,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 117,
    "categoryId": 2,
    "name": "Roasted Garlic Herb Lamb Chop Lollipops",
    "description": "French-trimmed lamb chops marinated in rosemary, garlic, and Dijon mustard.",
    "price": 1150,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 118,
    "categoryId": 2,
    "name": "Crispy Portobello Truffle Bites",
    "description": "Golden panko-crusted Portobello mushroom bites with black truffle dip.",
    "price": 510,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 119,
    "categoryId": 3,
    "name": "Old Delhi Velvet Butter Chicken",
    "description": "Charcoal-grilled tandoori chicken cooked in a rich tomato, cashew nut, and fenugreek gravy with unclarified butter.",
    "price": 680,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": true,
    "spiceLevel": 2,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 120,
    "categoryId": 3,
    "name": "Paneer Lababdar Saffron Korma",
    "description": "Fresh cottage cheese cubes folded into a velvety onion-tomato and saffron gravy laced with roasted bell peppers.",
    "price": 480,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 121,
    "categoryId": 3,
    "name": "Awadhi Korma Shahi Dumpukht",
    "description": "Slow-braised mutton shoulder in a rich golden onion and brown cashew sauce, finished with kewra and green cardamom.",
    "price": 720,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 122,
    "categoryId": 3,
    "name": "Jain Paneer Saffron Makhanwala",
    "description": "No onion no garlic velvety paneer in slow-cooked tomato saffron reduction with fresh churned butter.",
    "price": 490,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": true,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 123,
    "categoryId": 3,
    "name": "Nawabi Bhuna Gosht Masala",
    "description": "Tender baby goat slow-cooked in iron handi with caramelized onions, roasted coriander seeds, and whole garam masala.",
    "price": 740,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 124,
    "categoryId": 3,
    "name": "Murgh Musallam Royal Roast",
    "description": "Whole tandoori chicken stuffed with minced lamb and eggs, simmered in rich saffron almond gravy.",
    "price": 890,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 125,
    "categoryId": 3,
    "name": "Subz Handi Dum Diwani",
    "description": "Garden fresh vegetables cooked in spinach cashew gravy with fried garlic.",
    "price": 440,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 126,
    "categoryId": 3,
    "name": "Malai Kofta Kesari",
    "description": "Cottage cheese and dry fruit dumplings cooked in sweet saffron cashew cream.",
    "price": 460,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 127,
    "categoryId": 3,
    "name": "Methi Chaman Malai Silk",
    "description": "Fresh Kashmiri spinach and cottage cheese simmered with fresh fenugreek leaves.",
    "price": 470,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 128,
    "categoryId": 4,
    "name": "Galouti Kebab on Warqi Paratha",
    "description": "Melt-in-mouth smoked lamb patties blended with 160 aromatic spices, served over miniature Warqi Parathas.",
    "price": 620,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 129,
    "categoryId": 4,
    "name": "Subz Seekh Kebab Gold Leaf",
    "description": "Charcoal-grilled skewers of roasted sweet corn, green peas, and lotus seeds wrapped in edible gold foil.",
    "price": 420,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": true,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 130,
    "categoryId": 4,
    "name": "Afghani Malai Murgh Tangdi",
    "description": "Chicken drumsticks marinated in cashew cream, green cardamom, and white pepper, charred over embers.",
    "price": 580,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 131,
    "categoryId": 4,
    "name": "Bhatti Ka Paneer Tikka Supreme",
    "description": "Thick paneer slabs marinated in crushed black pepper, hung curd, and yellow chilli.",
    "price": 460,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 132,
    "categoryId": 4,
    "name": "Charcoal Smoked Lamb Kakori Kebab",
    "description": "Silky smooth lamb mince skewered and roasted over open coal flames.",
    "price": 680,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 133,
    "categoryId": 4,
    "name": "Tandoori Pomfret Fish Whole",
    "description": "Whole silver pomfret fish marinated in yellow mustard, carom, and red chilli.",
    "price": 980,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 134,
    "categoryId": 4,
    "name": "Achari Soya Chaap Tandoori",
    "description": "Juicy soya chaap marinated in pickle spices and roasted in clay oven.",
    "price": 390,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 135,
    "categoryId": 4,
    "name": "Dahi ke Kebab Velvet Crisp",
    "description": "Crispy fried kebabs made from hung yogurt, cardamom, and roasted coriander.",
    "price": 410,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 136,
    "categoryId": 4,
    "name": "Kasturi Murgh Malai Tikka",
    "description": "Boneless chicken marinated in Kasuri Methi, cream cheese, and cardamom.",
    "price": 590,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 137,
    "categoryId": 5,
    "name": "Awadhi Dum Gosht Lamb Biryani",
    "description": "Aromatic long-grain aged Basmati rice layered with tender lamb shanks, saffron, kewra water, cooked under dough seal.",
    "price": 750,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": true,
    "spiceLevel": 2,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 138,
    "categoryId": 5,
    "name": "Kolkata Subz Dum Biryani",
    "description": "Fragrant saffron rice dum-cooked with baby potatoes, fresh vegetables, plum, and rose water.",
    "price": 490,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 139,
    "categoryId": 5,
    "name": "Wild Mushroom & Truffle Pulao",
    "description": "Steamed aged Basmati rice tossed with sauteed porcini, chanterelles, and aromatic black truffle oil.",
    "price": 540,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": true,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 140,
    "categoryId": 5,
    "name": "Hyderabadi Zafrani Murgh Dum Biryani",
    "description": "Authentic spicy chicken dum biryani with fried onions, mint, coriander, and double-distilled saffron water.",
    "price": 640,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 141,
    "categoryId": 5,
    "name": "Royal Jhinga Zaffrani Biryani",
    "description": "Jumbo tiger prawns layered with aromatic Basmati rice, mint, and saffron steam.",
    "price": 890,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 142,
    "categoryId": 5,
    "name": "Tarkari Kesari Dum Biryani",
    "description": "Seasonal winter vegetables cooked with long-grain rice, mace, and rose petals.",
    "price": 460,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 143,
    "categoryId": 5,
    "name": "Jackfruit Raw Rawal Dum Biryani",
    "description": "Tender raw jackfruit chunks marinated in biryani spices and dum-cooked.",
    "price": 480,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 144,
    "categoryId": 5,
    "name": "Kashmiri Chilgoza Pine Nut Pulao",
    "description": "Fragrant saffron rice tossed with toasted pine nuts, raisins, and ghee.",
    "price": 510,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 145,
    "categoryId": 5,
    "name": "Egg Dum Biryani Awadhi Style",
    "description": "Boiled golden eggs marinated in biryani masala and dum-baked with Basmati rice.",
    "price": 420,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 146,
    "categoryId": 6,
    "name": "Truffle Garlic Butter Naan",
    "description": "Refined flour naan baked in clay tandoor, brushed with black truffle butter and roasted garlic flakes.",
    "price": 140,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 147,
    "categoryId": 6,
    "name": "Amritsari Chur Chur Stuffed Naan",
    "description": "Flaky layered bread stuffed with spiced paneer, potato, and carom seeds, crushed with desi ghee.",
    "price": 120,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 148,
    "categoryId": 6,
    "name": "Warqi Saffron Lacha Paratha",
    "description": "Multi-layered saffron infused wheat bread cooked on inverted iron tawa with clarified butter.",
    "price": 110,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 149,
    "categoryId": 6,
    "name": "Blue Cheese Stuffed Naan",
    "description": "Tandoori naan stuffed with Danish blue cheese, brushed with honey butter.",
    "price": 160,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 150,
    "categoryId": 6,
    "name": "Olive & Rosemary Tandoori Roti",
    "description": "Whole wheat roti topped with black olives, fresh rosemary, and olive oil.",
    "price": 90,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 151,
    "categoryId": 6,
    "name": "Peshawari Sweet Dry Fruit Naan",
    "description": "Leavened bread stuffed with crushed almonds, pistachios, coconut, and raisins.",
    "price": 150,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 152,
    "categoryId": 6,
    "name": "Bakarkhani Kashmiri Bread",
    "description": "Thick sweet multi-layered bread baked in tandoor with poppy seeds.",
    "price": 130,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 153,
    "categoryId": 6,
    "name": "Roomali Roti Silk Thin",
    "description": "Paper-thin delicate bread stretched by hand and cooked on inverted kadhai.",
    "price": 70,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 154,
    "categoryId": 6,
    "name": "Missi Roti Ajwain Flaked",
    "description": "Gram flour bread flavored with carom seeds, green chillies, and ghee.",
    "price": 80,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 155,
    "categoryId": 7,
    "name": "Norcia Black Truffle Tagliolini",
    "description": "Fresh hand-cut egg tagliolini tossed in 36-month Parmigiano Reggiano wheel with shaved Italian black truffle.",
    "price": 1200,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 156,
    "categoryId": 7,
    "name": "Smoked Duck Ragù Pappardelle",
    "description": "Broad ribbon pasta served with 8-hour braised smoked duck ragù, juniper berries, and aged pecorino.",
    "price": 980,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 157,
    "categoryId": 7,
    "name": "Wild Mushroom & Porcini Risotto",
    "description": "Acquerello carnaroli rice simmered in porcini broth, finished with mascarpone, thyme, and white truffle oil.",
    "price": 850,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 158,
    "categoryId": 7,
    "name": "Lobster & Saffron Ravioli",
    "description": "Handmade ravioli stuffed with lobster meat, served in saffron butter bisque.",
    "price": 1350,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 159,
    "categoryId": 7,
    "name": "Gnocchi di Patate Gorgonzola Cream",
    "description": "Pillow-soft potato gnocchi in velvety gorgonzola cream sauce with roasted walnuts.",
    "price": 740,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 160,
    "categoryId": 7,
    "name": "Classic Penne All’Arrabbiata",
    "description": "Penne pasta tossed in spicy San Marzano tomato sauce, garlic, and fresh parsley.",
    "price": 580,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 161,
    "categoryId": 7,
    "name": "Spinach & Ricotta Cannelloni",
    "description": "Baked pasta tubes filled with ricotta and spinach, baked under mozzarella.",
    "price": 680,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 162,
    "categoryId": 7,
    "name": "Truffle Mac & 5-Cheese Bake",
    "description": "Elbow macaroni baked with 5 artisan cheeses and white truffle cream.",
    "price": 650,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 163,
    "categoryId": 7,
    "name": "Seafood Linguine al Cartoccio",
    "description": "Linguine pasta cooked with tiger prawns, calamari, and clams in white wine tomato sauce.",
    "price": 1100,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 164,
    "categoryId": 8,
    "name": "Wood-Fired Burrata Margherita Pizza",
    "description": "Hand-stretched sourdough pizza topped with San Marzano tomato sauce, fresh Apulian Burrata, and basil oil.",
    "price": 780,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": true,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 165,
    "categoryId": 8,
    "name": "Truffle Mushroom & Goat Cheese Pizza",
    "description": "White base pizza with fontina cheese, wild roasted mushrooms, goat cheese curd, and black truffle drizzle.",
    "price": 890,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 166,
    "categoryId": 8,
    "name": "Prosciutto di Parma & Arugula Pizza",
    "description": "Thin sourdough base topped with tomato sauce, mozzarella, 24-month Parma ham, and fresh arugula.",
    "price": 950,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 167,
    "categoryId": 8,
    "name": "Spicy Calabrian Pepperoni Supreme",
    "description": "Artisanal pepperoni slices, spicy Calabrian chilli oil, mozzarella, and honey drizzled crust.",
    "price": 850,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 168,
    "categoryId": 8,
    "name": "Quattro Formaggi 4-Cheese Honey",
    "description": "Gorgonzola, Mozzarella, Parmigiano, and Fontina finished with truffle honey.",
    "price": 820,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 169,
    "categoryId": 8,
    "name": "Tuscan Grilled Veggie Pesto Pizza",
    "description": "Genovese pesto base with grilled zucchini, bell peppers, artichokes, and pine nuts.",
    "price": 720,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 170,
    "categoryId": 8,
    "name": "Smoked BBQ Chicken Jalapeño Pizza",
    "description": "Hickory smoked chicken, red onions, pickled jalapeños, and smoky BBQ drizzle.",
    "price": 790,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 171,
    "categoryId": 8,
    "name": "Bianca Truffle Ricotta White Pizza",
    "description": "No tomato white pizza with whipped ricotta, garlic oil, black truffle flakes, and rosemary.",
    "price": 880,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 172,
    "categoryId": 8,
    "name": "Frutti di Mare Seafood Pizza",
    "description": "Seafood pizza with grilled prawns, squid, garlic, parsley, and mozzarella.",
    "price": 1150,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 173,
    "categoryId": 9,
    "name": "Steamed Truffle Edamame Dim Sum",
    "description": "Translucent crystal dumplings stuffed with mashed edamame, wild mushrooms, and truffle essence (4 pcs).",
    "price": 480,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": true,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 174,
    "categoryId": 9,
    "name": "Peking Duck & Plum Charcoal Bao",
    "description": "Fluffy black charcoal bao buns filled with crispy roasted duck, scallions, cucumber, and hoisin plum glaze (3 pcs).",
    "price": 580,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 175,
    "categoryId": 9,
    "name": "Prawn Har Gow Gold Leaf Dumpling",
    "description": "Classic Cantonese steamed shrimp dumplings topped with edible 24K gold foil (4 pcs).",
    "price": 620,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 176,
    "categoryId": 9,
    "name": "Shanghai Pork Soup Dumplings (Xiao Long Bao)",
    "description": "Steamed soup dumplings filled with seasoned pork and savory collagen broth (6 pcs).",
    "price": 540,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 177,
    "categoryId": 9,
    "name": "Wild Mushroom Crisp Crystal Dumplings",
    "description": "Translucent dumplings stuffed with wood ear, shiitake, and chestnut mushrooms.",
    "price": 460,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 178,
    "categoryId": 9,
    "name": "Spicy Korean Chicken Bulgogi Bao",
    "description": "Soft bao bun stuffed with spicy gochujang chicken bulgogi and pickled daikon.",
    "price": 520,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 179,
    "categoryId": 9,
    "name": "Crispy Tofu & Shiitake Mushroom Bao",
    "description": "Crispy panko tofu, glazed shiitake, cilantro, and spicy mayo in steamed bao.",
    "price": 440,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 180,
    "categoryId": 9,
    "name": "Chilean Sea Bass Steamed Dumplings",
    "description": "Delicate dumplings filled with minced Chilean sea bass, ginger, and scallions.",
    "price": 680,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 181,
    "categoryId": 9,
    "name": "Spinach & Cream Cheese Open Suimai",
    "description": "Open-faced Suimai dumplings filled with spinach, cream cheese, and sweet corn.",
    "price": 450,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 182,
    "categoryId": 10,
    "name": "Crispy Lotus Stem Honey Chilli",
    "description": "Thinly sliced lotus root tossed in spicy honey-chilli glaze with toasted sesame and scallions.",
    "price": 420,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 183,
    "categoryId": 10,
    "name": "Thai Green Curry Lotus Root & Tofu",
    "description": "Aromatic coconut green curry with kaffir lime, Thai eggplant, lotus root, and silky pressed tofu.",
    "price": 580,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 184,
    "categoryId": 10,
    "name": "Black Garlic Udon Noodles with Pork Belly",
    "description": "Wok-tossed Japanese udon noodles in fermented black garlic sauce with slow-braised pork belly.",
    "price": 680,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 185,
    "categoryId": 10,
    "name": "Pad Thai Noodles Tiger Prawns",
    "description": "Stir-fried rice flat noodles with tiger prawns, bean sprouts, crushed peanuts, and tamarind sauce.",
    "price": 650,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 186,
    "categoryId": 10,
    "name": "Kung Pao Chicken Cashew Crunch",
    "description": "Wok-fried chicken cubes with dry red chillies, Sichuan peppercorns, and roasted cashews.",
    "price": 590,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 187,
    "categoryId": 10,
    "name": "Sichuan Crispy Chilli Tofu Wok",
    "description": "Silken tofu fried crispy and tossed in numbingly spicy Sichuan chilli bean sauce.",
    "price": 460,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 188,
    "categoryId": 10,
    "name": "Singapore Curry Vermicelli Noodles",
    "description": "Thin rice vermicelli tossed with Madras curry powder, bell peppers, and scallions.",
    "price": 520,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 189,
    "categoryId": 10,
    "name": "Mongolian Black Pepper Lamb Wok",
    "description": "Sliced tender lamb wok-fried with crushed black pepper, spring onions, and garlic.",
    "price": 720,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 190,
    "categoryId": 10,
    "name": "Cantonese Crisp Hakka Noodles",
    "description": "Classic stir-fried Hakka noodles with crunchy shredded vegetables and dark soy.",
    "price": 440,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 191,
    "categoryId": 11,
    "name": "Salmon Aburi Nigiri with Truffle Mayo",
    "description": "Seared Norwegian salmon nigiri topped with smoked truffle mayonnaise and caviar (4 pcs).",
    "price": 750,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 192,
    "categoryId": 11,
    "name": "Avocado & Cream Cheese Dragon Roll",
    "description": "Crispy cucumber and cream cheese roll wrapped in sliced Hass avocado and unagi glaze (8 pcs).",
    "price": 620,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 193,
    "categoryId": 11,
    "name": "Bluefin Tuna Sashimi Supreme (5 pcs)",
    "description": "Fresh slices of premium grade Akami Bluefin Tuna served over crushed ice.",
    "price": 1250,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 194,
    "categoryId": 11,
    "name": "Spicy Crunchy Hamachi Yellowtail Roll",
    "description": "Yellowtail tuna, spicy mayo, cucumber, topped with tempura flakes and sriracha.",
    "price": 820,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 195,
    "categoryId": 11,
    "name": "Tempura Prawn Dynamite Roll",
    "description": "Crispy jumbo tempura prawn roll topped with spicy tobiko mayo and sweet soy.",
    "price": 780,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 196,
    "categoryId": 11,
    "name": "Soft Shell Crab Spider Roll",
    "description": "Deep-fried soft shell crab, avocado, tobiko, and spicy sesame oil.",
    "price": 890,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 197,
    "categoryId": 11,
    "name": "Truffle Veggie Caterpillar Roll",
    "description": "Cucumber, asparagus, sweet potato tempura wrapped in avocado and truffle drizzle.",
    "price": 580,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 198,
    "categoryId": 11,
    "name": "Unagi Freshwater Eel Nigiri (4 pcs)",
    "description": "Grilled freshwater eel glazed with sweet unagi reduction over seasoned rice.",
    "price": 850,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 199,
    "categoryId": 11,
    "name": "Rainbow Deluxe Sashimi Platter (12 pcs)",
    "description": "Chef choice selection of Salmon, Tuna, Hamachi, and Scallop sashimi.",
    "price": 1850,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 200,
    "categoryId": 12,
    "name": "AURA Royal Shorba Saffron Almond",
    "description": "Silky soup prepared with crushed blanched almonds, cardamom, and Pampore saffron infusion.",
    "price": 320,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": true,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 201,
    "categoryId": 12,
    "name": "Wild Truffle Porcini Mushroom Soup",
    "description": "Velvety cream soup made from roasted French porcini and button mushrooms with garlic crostini.",
    "price": 380,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 202,
    "categoryId": 12,
    "name": "Classic French Onion Soup Gruyere",
    "description": "Caramelized onion broth topped with sourdough crostini and melted Gruyère cheese.",
    "price": 410,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 203,
    "categoryId": 12,
    "name": "Tom Yum Goong Tiger Prawn Soup",
    "description": "Spicy lemongrass and galangal Thai broth with tiger prawns, mushrooms, and chilli oil.",
    "price": 450,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 204,
    "categoryId": 12,
    "name": "Japanese Tonkotsu Pork Ramen Broth",
    "description": "Rich 16-hour simmered pork bone broth served with ramen noodles and soft boiled egg.",
    "price": 580,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 205,
    "categoryId": 12,
    "name": "Roasted Pumpkin Nutmeg Velouté",
    "description": "Creamy butternut squash soup seasoned with nutmeg, toasted pumpkin seeds, and cream.",
    "price": 340,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 206,
    "categoryId": 12,
    "name": "Sweet Corn Asparagus Silk Broth",
    "description": "Clear sweet corn broth with tender asparagus tips and white pepper.",
    "price": 290,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": true,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 207,
    "categoryId": 12,
    "name": "Cream of Roasted Heirloom Tomato Basil",
    "description": "Oven roasted Roma tomatoes simmered with fresh basil leaves and cream.",
    "price": 310,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 208,
    "categoryId": 12,
    "name": "Lamb Trotter Paya Shorba",
    "description": "Traditional slow-cooked lamb trotters broth infused with cloves, cinnamon, and ginger.",
    "price": 420,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 209,
    "categoryId": 13,
    "name": "Burrata Heirloom Tomato & Peach Salad",
    "description": "Creamy Apulian burrata served over grilled peaches, heirloom tomatoes, and aged balsamic glaze.",
    "price": 520,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 210,
    "categoryId": 13,
    "name": "Warm Quinoa Avocado Poke Bowl",
    "description": "Organic red quinoa topped with sliced Hass avocado, edamame, roasted beetroot, and sesame tahini dressing.",
    "price": 460,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": true,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 211,
    "categoryId": 13,
    "name": "Classic Caesar Salad Truffle Croutons",
    "description": "Crisp Romaine hearts, Parmigiano shavings, house garlic dressing, and sourdough croutons.",
    "price": 440,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 212,
    "categoryId": 13,
    "name": "Roasted Beetroot & Goat Cheese Walnut Salad",
    "description": "Oven roasted red beets, French goat cheese curd, candied walnuts, and orange reduction.",
    "price": 480,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 213,
    "categoryId": 13,
    "name": "Smoked Salmon Citrus Fennel Salad",
    "description": "Smoked Norwegian salmon, sliced grapefruit, fennel bulb, arugula, and dill vinaigrette.",
    "price": 680,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 214,
    "categoryId": 13,
    "name": "Thai Raw Mango Peanut Salad",
    "description": "Shredded raw green mango, toasted crushed peanuts, chilli lime dressing, and mint.",
    "price": 380,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 215,
    "categoryId": 13,
    "name": "Greek Feta Watermelon Mint Salad",
    "description": "Chilled watermelon cubes, barrel-aged Greek feta, black olives, and mint glaze.",
    "price": 420,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 216,
    "categoryId": 13,
    "name": "Asian Sesame Chicken Edamame Bowl",
    "description": "Grilled chicken breast, edamame beans, purple cabbage, and toasted sesame dressing.",
    "price": 510,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 217,
    "categoryId": 13,
    "name": "Grilled Halloumi Pomegranate Bowl",
    "description": "Charred Cypriot Halloumi cheese, wild rocket, fresh pomegranate seeds, and lemon oil.",
    "price": 490,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 218,
    "categoryId": 14,
    "name": "Grilled Norwegian Salmon Sizzler",
    "description": "Sizzling wild salmon fillet served over garlic butter rice, grilled asparagus, and lemon caper emulsion.",
    "price": 1450,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 219,
    "categoryId": 14,
    "name": "Charcoal Grilled Cottage Cheese Steak Sizzler",
    "description": "Herb-marinated paneer steak sizzled with pepper sauce, herb potato wedges, and sautéed greens.",
    "price": 680,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 220,
    "categoryId": 14,
    "name": "Sizzling Mixed Seafood Platter",
    "description": "Sizzling platter of tiger prawns, squid, white fish, garlic butter rice, and spicy tomato sauce.",
    "price": 1650,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 221,
    "categoryId": 14,
    "name": "Classic Chicken Stroganoff Butter Rice",
    "description": "Sautéed chicken strips in gherkin mushroom cream sauce served over steaming buttered rice.",
    "price": 690,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 222,
    "categoryId": 14,
    "name": "Herb Roasted Half Chicken Mushroom Jus",
    "description": "Farm raised half chicken roasted with thyme and rosemary, served with truffle mash.",
    "price": 750,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 223,
    "categoryId": 14,
    "name": "Filet Mignon Red Wine Reduction",
    "description": "Center-cut tenderloin steak seared over cast iron, served with bordelaise wine sauce.",
    "price": 1850,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 224,
    "categoryId": 14,
    "name": "Sizzling Veg Pepper Steak Mash",
    "description": "Soya and mushroom patty sizzled with black pepper sauce and mashed potatoes.",
    "price": 620,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 225,
    "categoryId": 14,
    "name": "Pan Seared Duck Breast Sizzler",
    "description": "Sizzling duck breast served over braised red cabbage and plum reduction.",
    "price": 1250,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 226,
    "categoryId": 14,
    "name": "Lamb Chop Rosemary Sizzler",
    "description": "Grilled Australian lamb chops on sizzling skillet with mint garlic demi-glace.",
    "price": 1350,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 227,
    "categoryId": 15,
    "name": "Truffle Ghee Podi Mini Idlis",
    "description": "Steamed button idlis tossed in gun powder spices, cold-pressed white ghee, and black truffle oil (12 pcs).",
    "price": 360,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 228,
    "categoryId": 15,
    "name": "Mysore Cheese Paper Dosa Supreme",
    "description": "Ultra-thin gold crispy rice crepe brushed with spicy red garlic chutney and aged cheddar cheese.",
    "price": 320,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 229,
    "categoryId": 15,
    "name": "Chettinad Pepper Chicken Fry",
    "description": "Dry spicy chicken tossed with freshly ground Karaikudi black pepper, curry leaves, and fennel.",
    "price": 540,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 230,
    "categoryId": 15,
    "name": "Kerala Malabar Mutton Curry",
    "description": "Slow-cooked lamb chunks in roasted coconut gravy with shallots and mustard seeds.",
    "price": 680,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 231,
    "categoryId": 15,
    "name": "Alleppey Fish Curry Coconut Milk",
    "description": "Fresh sea bass cooked in tangy raw mango coconut milk gravy with curry leaves.",
    "price": 620,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 232,
    "categoryId": 15,
    "name": "Avial Seasonal Vegetables Coconut",
    "description": "Traditional Kerala stew of mixed garden vegetables cooked in ground coconut and curd.",
    "price": 410,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": true,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 233,
    "categoryId": 15,
    "name": "Coorg Pork Belly Roast",
    "description": "Succulent pork belly slow roasted with authentic dark Coorg black vinegar (Kachampuli).",
    "price": 650,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": false,
    "isNonVeg": true,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 2,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Gluten"
    ]
  },
  {
    "id": 234,
    "categoryId": 15,
    "name": "Appam with Stew (Veg / Chicken)",
    "description": "Soft bowl-shaped lace pancakes served with fragrant cardamom coconut stew.",
    "price": 420,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 235,
    "categoryId": 15,
    "name": "Malabar Parotta Tender Flaky",
    "description": "Multi-layered flaky unleavened flatbread crushed hot with ghee.",
    "price": 90,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 236,
    "categoryId": 16,
    "name": "24K Gold Leaf Valrhona Chocolate Sphere",
    "description": "Dark Valrhona chocolate dome encrusted with edible 24K gold leaf, melted table-side with warm salted caramel sauce.",
    "price": 850,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": true,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 237,
    "categoryId": 16,
    "name": "Shahi Kesari Gulab Jamun with Rabri",
    "description": "Hot saffron-stuffed cottage cheese dumplings served over chilled pistachio rabri and silver leaf.",
    "price": 280,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 238,
    "categoryId": 16,
    "name": "Deconstructed Classic Tiramisu",
    "description": "Savoiardi ladyfingers soaked in single-origin espresso and dark rum with whipped mascarpone cream.",
    "price": 490,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 239,
    "categoryId": 16,
    "name": "Warm Molten Lava Chocolate Cake",
    "description": "Warm dark chocolate cake with oozy liquid center, served with vanilla bean ice cream.",
    "price": 420,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 240,
    "categoryId": 16,
    "name": "New York Baked Cheesecake Berry Compote",
    "description": "Dense cream cheese cake baked over graham cracker crust with wild blueberry sauce.",
    "price": 460,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 241,
    "categoryId": 16,
    "name": "Classic French Crème Brûlée Vanilla",
    "description": "Rich vanilla bean custard with hard crack torch-caramelized sugar top.",
    "price": 390,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 242,
    "categoryId": 16,
    "name": "Rasmalai Tres Leches Cake Fusion",
    "description": "Saffron sponge cake soaked in 3 milks topped with cardamom cottage cheese discs.",
    "price": 350,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 243,
    "categoryId": 16,
    "name": "Churros with Spanish Hot Chocolate",
    "description": "Golden crispy Spanish dough flutes dusted with cinnamon sugar, served with thick dark dipping chocolate.",
    "price": 380,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 244,
    "categoryId": 16,
    "name": "Pistachio Kunafa Crispy Nest",
    "description": "Crispy shredded kataifi pastry filled with mozzarella cheese and crushed pistachios, soaked in orange blossom syrup.",
    "price": 520,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 245,
    "categoryId": 17,
    "name": "Sicilian Pistachio Artisanal Gelato",
    "description": "Handcrafted slow-churned gelato made with 100% Bronte Sicilian pistachios and organic whole milk.",
    "price": 320,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 246,
    "categoryId": 17,
    "name": "Madagascar Vanilla Bean & Honeycomb",
    "description": "Rich vanilla bean ice cream folded with crunchy homemade golden honeycomb shards.",
    "price": 290,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 247,
    "categoryId": 17,
    "name": "Belgian Dark Chocolate 70% Sorbet",
    "description": "Dairy-free intense dark chocolate sorbet made from single origin Belgian cocoa.",
    "price": 310,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 248,
    "categoryId": 17,
    "name": "Fresh Alphonsos Mango Sorbet",
    "description": "Refreshing tropical sorbet made from pureed Ratnagiri Alphonso mangoes.",
    "price": 280,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 249,
    "categoryId": 17,
    "name": "Salted Caramel Macadamia Gelato",
    "description": "Creamy gelato swirled with sea salt caramel and roasted macadamia nuts.",
    "price": 330,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 250,
    "categoryId": 17,
    "name": "Roasted Hazelnut Rocher Gelato",
    "description": "Piedmont hazelnut gelato blended with chocolate fudge and crispy wafer crunch.",
    "price": 340,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 251,
    "categoryId": 17,
    "name": "Wild Berry Mascarpone Gelato",
    "description": "Swirled raspberry and blackberry gelato made with sweet Italian mascarpone.",
    "price": 310,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 252,
    "categoryId": 17,
    "name": "Japanese Matcha Green Tea Ice Cream",
    "description": "Authentic Kyoto ceremonial grade matcha green tea ice cream.",
    "price": 320,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 253,
    "categoryId": 17,
    "name": "Espresso Affogato Vanilla Gelato",
    "description": "Scoop of Madagascar vanilla gelato drowned in hot shot of fresh espresso.",
    "price": 350,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 254,
    "categoryId": 18,
    "name": "AURA Gold Smoked Botanical Elixir",
    "description": "Artisanal non-alcoholic elixir with wild elderflower, gold flakes, smoked cinnamon bark, and fresh Japanese yuzu.",
    "price": 350,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 255,
    "categoryId": 18,
    "name": "Smoked Cinnamon Old Fashioned Mocktail",
    "description": "Cold-pressed apple, orange bitter, clove reduction smoked in applewood dome.",
    "price": 380,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 256,
    "categoryId": 18,
    "name": "Passionfruit Lavender Sparkling Spritz",
    "description": "Fresh passionfruit pulp muddled with organic lavender syrup, lemon, and sparkling tonic water.",
    "price": 340,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 257,
    "categoryId": 18,
    "name": "Cucumber Rosemary Tonic Spritzer",
    "description": "English cucumber, muddled rosemary sprig, lime, and elderflower tonic.",
    "price": 290,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 258,
    "categoryId": 18,
    "name": "Spiced Mango Chili Margarita Mocktail",
    "description": "Alphonso mango nectar, lime juice, rimmed with Tajín chilli salt and jalapeño.",
    "price": 310,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 259,
    "categoryId": 18,
    "name": "Wild Berry Hibiscus Iced Elixir",
    "description": "Brewed Egyptian hibiscus tea shaken with muddled raspberries and blackberry puree.",
    "price": 320,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 260,
    "categoryId": 18,
    "name": "Watermelon Basil Coconut Crush",
    "description": "Fresh watermelon juice blended with coconut water, sweet basil, and crushed ice.",
    "price": 330,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 261,
    "categoryId": 18,
    "name": "Yuzu Elderflower Sparkler",
    "description": "Japanese yuzu juice, French elderflower syrup, sparkling water, and edible orchid.",
    "price": 360,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 262,
    "categoryId": 18,
    "name": "Smoked Pineapple Jalapeño Sour",
    "description": "Charred pineapple juice, lime juice, agave nectar, and smoked chilli salt.",
    "price": 350,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 263,
    "categoryId": 19,
    "name": "Kashmiri Saffron Kahwa Tea",
    "description": "Traditional green tea infused with Kashmiri saffron strands, green cardamom, cinnamon, and slivered almonds.",
    "price": 240,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 264,
    "categoryId": 19,
    "name": "Single Origin Ethiopian Nitro Cold Brew",
    "description": "18-hour cold steeped Arabica coffee infused with nitrogen for a velvety stout-like texture.",
    "price": 280,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 265,
    "categoryId": 19,
    "name": "Japanese Ceremonial Matcha Latte",
    "description": "Kyoto matcha whisked with warm oat milk and organic agave.",
    "price": 290,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 266,
    "categoryId": 19,
    "name": "Spanish Cortado Double Espresso",
    "description": "Equal parts dark espresso roast and warm steamed milk.",
    "price": 220,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 267,
    "categoryId": 19,
    "name": "Artisanal Truffle Dark Hot Chocolate",
    "description": "Thick Valrhona dark hot chocolate infused with a drop of white truffle oil.",
    "price": 320,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 268,
    "categoryId": 19,
    "name": "Darjeeling First Flush Whole Leaf Tea",
    "description": "Muscatel floral notes from the champagne of teas brewed in glass pot.",
    "price": 210,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 269,
    "categoryId": 19,
    "name": "Chamomile Lavender Blossom Tea",
    "description": "Calming caffeine-free infusion of whole chamomile flowers and French lavender.",
    "price": 230,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 270,
    "categoryId": 19,
    "name": "Hazelnut Praline Iced Latte",
    "description": "Double espresso over ice with house-made hazelnut praline paste and milk.",
    "price": 260,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 271,
    "categoryId": 19,
    "name": "Iced Americano Orange Tonic",
    "description": "Espresso shot poured over sparkling tonic water and fresh orange slice.",
    "price": 250,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 272,
    "categoryId": 20,
    "name": "San Pellegrino Sparkling Water (750ml)",
    "description": "Naturally carbonated Italian mineral water bottled at the source in San Pellegrino Terme.",
    "price": 320,
    "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 250,
    "rating": 4.75,
    "reviewCount": 100,
    "preparationTimeMinutes": 8,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 273,
    "categoryId": 20,
    "name": "Fresh Sparkling Tender Coconut Elixir",
    "description": "Chilled tender coconut water charged with fine bubbles and a touch of Himalayan pink salt.",
    "price": 260,
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 290,
    "rating": 4.83,
    "reviewCount": 125,
    "preparationTimeMinutes": 10,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 274,
    "categoryId": 20,
    "name": "Perrier Sparkling Natural Mineral Water",
    "description": "French sparkling natural mineral water with bold burst of bubbles.",
    "price": 310,
    "imageUrl": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 330,
    "rating": 4.91,
    "reviewCount": 150,
    "preparationTimeMinutes": 12,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 275,
    "categoryId": 20,
    "name": "Freshly Squeezed Valencia Orange Juice",
    "description": "100% pure cold-pressed Valencia orange juice with pulp.",
    "price": 240,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 370,
    "rating": 4.75,
    "reviewCount": 175,
    "preparationTimeMinutes": 14,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 276,
    "categoryId": 20,
    "name": "Artisanal Ginger Beer Botanical",
    "description": "Naturally fermented spicy ginger brew with fresh lime and cane sugar.",
    "price": 250,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 410,
    "rating": 4.83,
    "reviewCount": 200,
    "preparationTimeMinutes": 16,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 277,
    "categoryId": 20,
    "name": "Sparkling Apple Cider Non-Alcoholic",
    "description": "Crisp sparkling apple cider made from Washington Red Delicious apples.",
    "price": 290,
    "imageUrl": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 450,
    "rating": 4.91,
    "reviewCount": 225,
    "preparationTimeMinutes": 18,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 278,
    "categoryId": 20,
    "name": "Cold Pressed Green Detox Juice",
    "description": "Green apple, celery, cucumber, kale, lemon, and ginger cold press.",
    "price": 270,
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 490,
    "rating": 4.75,
    "reviewCount": 250,
    "preparationTimeMinutes": 20,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 279,
    "categoryId": 20,
    "name": "Himalayan Pink Salt Lemonade",
    "description": "Fresh squeezed lemon juice, mint leaves, and Himalayan pink rock salt.",
    "price": 210,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 530,
    "rating": 4.83,
    "reviewCount": 275,
    "preparationTimeMinutes": 22,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  },
  {
    "id": 280,
    "categoryId": 20,
    "name": "Fresh Pomegranate Mint Refresher",
    "description": "Pure pomegranate juice muddled with fresh mint sprigs and soda.",
    "price": 250,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    "isVegetarian": true,
    "isNonVeg": false,
    "isJain": false,
    "isGlutenFree": true,
    "isChefSpecial": false,
    "isBestSeller": false,
    "spiceLevel": 1,
    "calories": 570,
    "rating": 4.91,
    "reviewCount": 300,
    "preparationTimeMinutes": 24,
    "ingredients": [
      "Fresh Spices",
      "Organic Butter",
      "Chef Special Sauce",
      "Himalayan Pink Salt"
    ],
    "allergens": [
      "Dairy"
    ]
  }
];
const MOCK_COUPONS = [
  { code: 'WELCOME100', title: 'Flat ₹100 Off', discountAmount: 100, minOrderAmount: 500, description: 'Get ₹100 off on your first AURA dining session order above ₹500.' },
  { code: 'AURA200', title: 'Luxury Dining ₹200 Off', discountAmount: 200, minOrderAmount: 1200, description: 'Get ₹200 off on orders above ₹1,200.' },
  { code: 'CHEF500', title: 'Chef Special ₹500 Discount', discountAmount: 500, minOrderAmount: 2500, description: 'Exclusive ₹500 discount for orders featuring Chef Specials above ₹2,500.' },
  { code: 'FEAST300', title: 'Grand Feast ₹300 Off', discountAmount: 300, minOrderAmount: 1800, description: 'Get ₹300 off on orders above ₹1,800 across any dining categories.' }
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

    console.log(`Database Seeded Successfully! Added ${MOCK_CATEGORIES.length} Categories & ${MOCK_MENU_ITEMS.length} Culinary Items.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
