const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, getNextId } = require('../data-service');

// GET /api/eventura/events - Получить все мероприятия
router.get('/', (req, res) => {
  try {
    let events = readJSONFile('events.json');
    
    // Фильтрация
    if (req.query.clientId) {
      events = events.filter(e => e.clientId === parseInt(req.query.clientId));
    }
    if (req.query.type) {
      events = events.filter(e => e.type === req.query.type);
    }
    if (req.query.status) {
      events = events.filter(e => e.status === req.query.status);
    }
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/eventura/events - Создать новое мероприятие
router.post('/', (req, res) => {
  try {
    const events = readJSONFile('events.json');
    const newEvent = {
      id: getNextId(events),
      ...req.body,
      createdAt: new Date().toISOString(),
      status: req.body.status || 'draft'
    };
    
    events.push(newEvent);
    writeJSONFile('events.json', events);
    
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/eventura/events/:id - Получить мероприятие по ID
router.get('/:id', (req, res) => {
  try {
    const events = readJSONFile('events.json');
    const event = events.find(e => e.id === parseInt(req.params.id));
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/eventura/events/:id - Обновить мероприятие
router.put('/:id', (req, res) => {
  try {
    const events = readJSONFile('events.json');
    const index = events.findIndex(e => e.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    events[index] = { ...events[index], ...req.body };
    writeJSONFile('events.json', events);
    
    res.json(events[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

