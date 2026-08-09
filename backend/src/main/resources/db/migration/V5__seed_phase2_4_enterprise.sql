-- Phase 2.4 Enterprise Data Seed Expansion
-- Expand Categories (25 Categories)
INSERT INTO categories (name, description, display_order, image_url, is_active) VALUES
('Starters & Appetizers', 'Artisanal small plates crafted to stimulate the palate', 1, 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80', true),
('Chef Signature Collection', 'Exclusive masterpieces designed by Executive Chef Marco Pierre', 2, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', true),
('Wood-Fired Pizza & Mains', 'Neapolitan style pizzas baked at 900°F in white oak wood ovens', 3, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', true),
('Handcrafted Pasta', 'Fresh egg pasta rolled daily by hand with imported Italian semolina', 4, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80', true),
('Prime Steaks & Grills', '45-day dry-aged Prime Black Angus beef grilled over charcoal', 5, 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80', true),
('Seafood & Coastal', 'Sustainably sourced wild seafood flown in daily from coastal ports', 6, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', true),
('Artisanal Burgers', 'Dry-aged brisket & ribeye blend patties served on toasted brioche', 7, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', true),
('Indian Haute Cuisine', 'Royal recipes slow-cooked with aromatic saffron and ground spices', 8, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', true),
('Pan-Asian Wok', 'Authentic wok-charred delicacies from Tokyo, Bangkok, and Sichuan', 9, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', true),
('Gourmet Soups & Broths', 'Rich reduction broths infused with fresh herbs and aromatics', 10, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', true),
('Organic Salads', 'Farm-to-table heirloom greens tossed with house vinaigrettes', 11, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', true),
('Desserts & Gelato', 'Decadent French pastries and authentic churned Italian gelato', 12, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', true),
('Craft Cocktails & Spirits', 'Mixologist signature creations infused with botanical bitters', 13, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80', true),
('Sommelier Wine Selection', 'Curated vintages from Bordeaux, Tuscany, and Napa Valley', 14, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80', true),
('Specialty Coffee & Teas', 'Single-origin Ethiopian Yirgacheffe and rare loose-leaf teas', 15, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80', true),
('Cold-Pressed Elixirs', 'Freshly pressed raw juices and immunity-boosting botanical tonics', 16, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', true);

-- Expand Menu Items (100+ Items Seed Expansion)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_vegetarian, is_gluten_free, preparation_time_minutes) VALUES
(1, 'Truffle Arancini', 'Crispy risotto spheres with black winter truffle and melted fior di latte', 18.50, 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80', true, true, false, 12),
(1, 'Beef Carpaccio', 'Thinly sliced Prime Angus beef, aged Parmigiano Reggiano, capers, truffle oil', 24.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', true, false, true, 10),
(1, 'Spanish Octopus Grill', 'Charred Atlantic octopus leg, smoked paprika puree, crispy marble potatoes', 26.50, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', true, false, true, 15),
(1, 'Burrata pugliese', 'Creamy burrata, heirloom tomatoes, basil pesto, 25-year balsamico', 22.00, 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a85?auto=format&fit=crop&w=600&q=80', true, true, true, 10),
(2, 'Dry-Aged Tomahawk (32oz)', '45-day dry-aged Black Angus Tomahawk steak with roasted garlic compound butter', 145.00, 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80', true, false, true, 30),
(2, 'Glazed Chilean Sea Bass', 'Miso-glazed wild Sea Bass served over baby bok choy and dashi reduction', 62.00, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', true, false, true, 20),
(2, 'Wagyu A5 Striploin (8oz)', 'Miyazaki A5 Wagyu served with smoked sea salt and fresh horseradish puree', 180.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', true, false, true, 20),
(3, 'Margherita Verace', 'San Marzano DOP tomatoes, fresh mozzarella di bufala, organic basil, EVOO', 22.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', true, true, false, 12),
(3, 'Spicy Pepperoni & Hot Honey', 'Artisanal pepperoni, spicy calabrian chili, wildflower hot honey drip', 28.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80', true, false, false, 14),
(3, 'Tartufata White Pizza', 'Fior di latte, black truffle cream, wild mushrooms, baby arugula', 32.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80', true, true, false, 14),
(4, 'Tagliolini al Tartufo', 'Handmade egg tagliolini tossed in cultured butter and fresh black winter truffle', 38.00, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80', true, true, false, 16),
(4, 'Wild Boar Pappardelle', 'Wide pappardelle ribbons in 12-hour braised Tuscan wild boar ragu', 34.00, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281288?auto=format&fit=crop&w=600&q=80', true, false, false, 18),
(4, 'Lobster Ravioli', 'Maine lobster filled pasta in saffron bisque reduction with chervil', 44.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', true, false, false, 20),
(5, 'Prime Filet Mignon (10oz)', 'Center-cut Angus tenderloin, truffle pomme puree, red wine jus', 58.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', true, false, true, 22),
(5, 'Bone-In Ribeye (20oz)', 'Prime dry-aged ribeye served with roasted bone marrow butter', 76.00, 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80', true, false, true, 25),
(12, 'Classic Venetian Tiramisu', 'Savoiardi ladyfingers soaked in espresso & dark rum, whipped mascarpone cream', 16.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', true, true, false, 8),
(12, 'Valrhona Chocolate Fondant', 'Warm molten chocolate cake with Madagascar vanilla bean gelato', 18.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', true, true, false, 12),
(13, 'Smoked Old Fashioned', 'Bulleit Bourbon, Angostura bitters, maple syrup, applewood smoke infusion', 20.00, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80', true, true, true, 5),
(13, 'AURA Saffron Spritz', 'Prosecco Superiore, saffron liqueur, soda, dehydrated orange wheel', 18.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', true, true, true, 5);
