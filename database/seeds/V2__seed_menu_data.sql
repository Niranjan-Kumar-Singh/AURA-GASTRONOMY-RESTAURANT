-- Seed Initial Categories
INSERT INTO categories (name, description, display_order, image_url) VALUES
('Starters & Appetizers', 'Artisanal cold cuts, truffle carpaccio, and woodfired small plates.', 1, 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80'),
('Chef Specialties', 'Signature woodfired steaks, aged wagyu, and wild seafood.', 2, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'),
('Wood-Fired Pizza & Mains', 'Neapolitan sourdough pizza baked in our 900°F stone oven.', 3, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'),
('Desserts & Gelato', 'Handcrafted Italian gelato, chocolate fondant, and tiramisu.', 4, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80'),
('Craft Cocktails & Wine', 'Curated sommelier wines, vintage champagne, and smoked old fashioneds.', 5, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80');

-- Seed Initial Menu Items
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_vegetarian, is_gluten_free, preparation_time_minutes) VALUES
(1, 'Truffle Wagyu Carpaccio', 'Thinly sliced A5 Japanese Wagyu beef, black truffle emulsion, shaved parmesan, capers, micro greens.', 28.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, false, true, 12),
(1, 'Burrata Pugliese', 'Creamy Italian burrata, heirloom tomatoes, basil oil, aged balsamic glaze, grilled sourdough.', 22.00, 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=800&q=80', true, true, false, 10),
(2, 'Pan-Seared Atlantic Salmon', 'Wild caught Atlantic salmon, crispy skin, wild mushroom risotto, asparagus, lemon butter glaze.', 36.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', true, false, true, 20),
(2, 'Dry-Aged Tomahawk Steak (32oz)', '45-day dry-aged Prime Black Angus Tomahawk, roasted garlic compound butter, smoked sea salt.', 120.00, 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80', true, false, true, 30),
(3, 'Truffle & Wild Mushroom Pizza', 'Fior di latte mozzarella, black truffle cream, wild porcini mushrooms, fresh thyme, white truffle oil.', 32.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', true, true, false, 15),
(3, 'Spicy Pepperoni & Hot Honey', 'San Marzano tomato base, artisanal pepperoni, fresh mozzarella, organic chili flakes, hot honey drizzle.', 28.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80', true, false, false, 15),
(4, 'Classic Venetian Tiramisu', 'Savoiardi ladyfingers soaked in espresso & dark rum, whipped mascarpone cream, Valrhona cocoa.', 16.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80', true, true, false, 8),
(5, 'Smoked Maple Old Fashioned', 'Bourbon, Grade A maple syrup, Angostura bitters, applewood smoke dome.', 19.00, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', true, true, true, 5);

-- Seed Restaurant Tables
INSERT INTO restaurant_tables (table_number, capacity, qr_code_token, table_status) VALUES
('Table 01', 2, 'qr_token_table_01', 'VACANT'),
('Table 02', 4, 'qr_token_table_02', 'VACANT'),
('Table 03', 4, 'qr_token_table_03', 'VACANT'),
('Table 04', 6, 'qr_token_table_04', 'VACANT'),
('Table 05', 8, 'qr_token_table_05', 'VACANT');
