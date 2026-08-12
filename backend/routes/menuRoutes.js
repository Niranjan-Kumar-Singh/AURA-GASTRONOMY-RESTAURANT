const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

// Helper to construct query matching numeric id, string id, OR Mongoose _id
const getQueryById = (paramId) => {
  const num = Number(paramId);
  const isValidMongoId = mongoose.isValidObjectId(paramId);

  const conditions = [];
  if (!isNaN(num)) {
    conditions.push({ id: num });
  }
  conditions.push({ id: String(paramId) });
  if (isValidMongoId) {
    conditions.push({ _id: paramId });
  }

  return { $or: conditions };
};

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort('displayOrder');
    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new category
router.post('/categories', async (req, res) => {
  try {
    const { name, icon, displayOrder } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const maxCat = await Category.findOne().sort('-id');
    const newId = maxCat ? maxCat.id + 1 : 1;

    const category = await Category.create({
      id: newId,
      name,
      icon: icon || 'Utensils',
      displayOrder: displayOrder || newId
    });

    res.status(201).json({ data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update category
router.put('/categories/:id', async (req, res) => {
  try {
    const query = getQueryById(req.params.id);
    const category = await Category.findOneAndUpdate(
      query,
      { $set: req.body },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE category
router.delete('/categories/:id', async (req, res) => {
  try {
    const query = getQueryById(req.params.id);
    await Category.findOneAndDelete(query);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all menu items with search/filter
router.get('/menu-items', async (req, res) => {
  try {
    const { categoryId, search } = req.query;
    let query = {};
    
    if (categoryId) query.categoryId = Number(categoryId);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await MenuItem.find(query).sort({ id: 1 });
    res.json({ data: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET menu item by numeric or Mongo _id
router.get('/menu-items/:id', async (req, res) => {
  try {
    const query = getQueryById(req.params.id);
    const item = await MenuItem.findOne(query);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new menu item
router.post('/menu-items', async (req, res) => {
  try {
    const {
      name, description, price, categoryId, imageUrl,
      isVegetarian, isNonVeg, isChefSpecial, isBestSeller,
      isAvailable, spiceLevel, preparationTimeMinutes
    } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'Name, Price and Category are required' });
    }

    const maxItem = await MenuItem.findOne().sort('-id');
    const newId = maxItem ? maxItem.id + 1 : 101;

    const item = await MenuItem.create({
      id: newId,
      name,
      description: description || 'Artisanal dish crafted by AURA culinary masters.',
      price: Number(price),
      categoryId: Number(categoryId),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      isVegetarian: Boolean(isVegetarian),
      isNonVeg: Boolean(isNonVeg),
      isChefSpecial: Boolean(isChefSpecial),
      isBestSeller: Boolean(isBestSeller),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      spiceLevel: Number(spiceLevel || 0),
      preparationTimeMinutes: Number(preparationTimeMinutes || 15),
      customizationGroups: []
    });

    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update menu item
router.put('/menu-items/:id', async (req, res) => {
  try {
    const query = getQueryById(req.params.id);
    const item = await MenuItem.findOneAndUpdate(
      query,
      { $set: req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE menu item
router.delete('/menu-items/:id', async (req, res) => {
  try {
    const query = getQueryById(req.params.id);
    await MenuItem.findOneAndDelete(query);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
