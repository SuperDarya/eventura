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

// POST /api/eventura/services - Создать услугу
router.post('/', (req, res) => {
  try {
    const { vendorId, name, category, description, priceMin, priceMax, unit, duration } = req.body;

    if (!vendorId || !name || !category) {
      return res.status(400).json({ error: 'vendorId, name и category обязательны' });
    }

    const services = readJSONFile('services.json');
    
    const newService = {
      id: getNextId(services),
      vendorId: parseInt(vendorId),
      name,
      category,
      description: description || '',
      priceMin: priceMin || 0,
      priceMax: priceMax || 0,
      unit: unit || 'шт',
      duration: duration || 0
    };

    services.push(newService);
    writeJSONFile('services.json', services);

    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/eventura/services/:id - Обновить услугу
router.put('/:id', (req, res) => {
  try {
    const services = readJSONFile('services.json');
    const serviceIndex = services.findIndex(s => s.id === parseInt(req.params.id));
    
    if (serviceIndex === -1) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const { name, category, description, priceMin, priceMax, unit, duration } = req.body;
    
    services[serviceIndex] = {
      ...services[serviceIndex],
      ...(name && { name }),
      ...(category && { category }),
      ...(description !== undefined && { description }),
      ...(priceMin !== undefined && { priceMin }),
      ...(priceMax !== undefined && { priceMax }),
      ...(unit && { unit }),
      ...(duration !== undefined && { duration })
    };

    writeJSONFile('services.json', services);

    res.json(services[serviceIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/eventura/services/:id - Удалить услугу
router.delete('/:id', (req, res) => {
  try {
    const services = readJSONFile('services.json');
    const serviceIndex = services.findIndex(s => s.id === parseInt(req.params.id));
    
    if (serviceIndex === -1) {
      return res.status(404).json({ error: 'Service not found' });
    }

    services.splice(serviceIndex, 1);
    writeJSONFile('services.json', services);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

