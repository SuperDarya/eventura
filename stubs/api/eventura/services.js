const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, getNextId } = require('../data-service');

// GET /api/eventura/services - Получить все услуги
router.get('/', (req, res) => {
  try {
    let services = readJSONFile('services.json');
    
    // Фильтрация
    if (req.query.category) {
      services = services.filter(s => s.category === req.query.category);
    }
    if (req.query.vendorId) {
      services = services.filter(s => s.vendorId === parseInt(req.query.vendorId));
    }
    if (req.query.priceMin) {
      services = services.filter(s => s.priceMin >= parseInt(req.query.priceMin));
    }
    if (req.query.priceMax) {
      services = services.filter(s => s.priceMax <= parseInt(req.query.priceMax));
    }
    
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/eventura/services/:id - Получить услугу по ID
router.get('/:id', (req, res) => {
  try {
    const services = readJSONFile('services.json');
    const service = services.find(s => s.id === parseInt(req.params.id));
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

