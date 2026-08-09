const express = require('express');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort('displayOrder');
    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

    const items = await MenuItem.find(query);
    res.json({ data: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/menu-items/:id', async (req, res) => {
  try {
    const item = await MenuItem.findOne({ id: Number(req.params.id) });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
