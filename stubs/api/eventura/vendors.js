const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, getNextId } = require('../data-service');

// GET /api/eventura/vendors - Получить всех подрядчиков
router.get('/', (req, res) => {
  try {
    const users = readJSONFile('users_and_vendors.json');
    const vendors = users.filter(u => u.type === 'vendor' || u.type === 'organizer');
    
    // Фильтрация по параметрам
    let filtered = vendors;
    if (req.query.city) {
      filtered = filtered.filter(v => v.city === req.query.city);
    }
    if (req.query.category) {
      // Здесь можно добавить фильтрацию по категории услуг
    }
    if (req.query.minRating) {
      filtered = filtered.filter(v => v.rating >= parseFloat(req.query.minRating));
    }
    
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/eventura/vendors/:id - Получить подрядчика по ID
router.get('/:id', (req, res) => {
  try {
    const users = readJSONFile('users_and_vendors.json');
    const vendor = users.find(u => u.id === parseInt(req.params.id) && (u.type === 'vendor' || u.type === 'organizer'));
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Добавляем информацию о профиле и услугах
    const profiles = readJSONFile('vendor_profiles.json');
    const services = readJSONFile('services.json');
    const reviews = readJSONFile('reviews.json');
    
    const profile = profiles.find(p => p.vendorId === vendor.id);
    const vendorServices = services.filter(s => s.vendorId === vendor.id);
    const vendorReviews = reviews.filter(r => r.vendorId === vendor.id);
    
    res.json({
      ...vendor,
      profile,
      services: vendorServices,
      reviews: vendorReviews,
      calendar: vendor.calendar || [] // Календарь занятых дат
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/eventura/vendors/:id/calendar - Обновить календарь подрядчика
router.put('/:id/calendar', (req, res) => {
  try {
    const users = readJSONFile('users_and_vendors.json');
    const vendorIndex = users.findIndex(u => u.id === parseInt(req.params.id) && (u.type === 'vendor' || u.type === 'organizer'));
    
    if (vendorIndex === -1) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const { calendar } = req.body; // Массив дат в формате YYYY-MM-DD
    
    if (!Array.isArray(calendar)) {
      return res.status(400).json({ error: 'Calendar must be an array of dates' });
    }
    
    // Обновляем календарь
    users[vendorIndex].calendar = calendar.sort();
    writeJSONFile('users_and_vendors.json', users);
    
    res.json({
      success: true,
      calendar: users[vendorIndex].calendar
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

