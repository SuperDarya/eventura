const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, getNextId } = require('../data-service');

// GET /api/eventura/bookings - Получить все бронирования
router.get('/', (req, res) => {
  try {
    let bookings = readJSONFile('bookings.json');
    
    // Фильтрация
    if (req.query.clientId) {
      bookings = bookings.filter(b => b.clientId === parseInt(req.query.clientId));
    }
    if (req.query.vendorId) {
      bookings = bookings.filter(b => b.vendorId === parseInt(req.query.vendorId));
    }
    if (req.query.eventId) {
      bookings = bookings.filter(b => b.eventId === parseInt(req.query.eventId));
    }
    if (req.query.status) {
      bookings = bookings.filter(b => b.status === req.query.status);
    }
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/eventura/bookings - Создать новое бронирование
router.post('/', (req, res) => {
  try {
    const bookings = readJSONFile('bookings.json');
    const newBooking = {
      id: getNextId(bookings),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    writeJSONFile('bookings.json', bookings);
    
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/eventura/bookings/:id - Получить бронирование по ID
router.get('/:id', (req, res) => {
  try {
    const bookings = readJSONFile('bookings.json');
    const booking = bookings.find(b => b.id === parseInt(req.params.id));
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Добавляем информацию о подрядчиках и мероприятии
    const users = readJSONFile('users_and_vendors.json');
    const events = readJSONFile('events.json');
    const services = readJSONFile('services.json');
    
    const vendor = users.find(u => u.id === booking.vendorId);
    const event = events.find(e => e.id === booking.eventId);
    const service = services.find(s => s.id === booking.serviceId);
    
    res.json({
      ...booking,
      vendor,
      event,
      service
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/eventura/bookings/:id - Обновить бронирование (например, статус оплаты)
router.put('/:id', (req, res) => {
  try {
    const bookings = readJSONFile('bookings.json');
    const index = bookings.findIndex(b => b.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    bookings[index] = { ...bookings[index], ...req.body };
    writeJSONFile('bookings.json', bookings);
    
    res.json(bookings[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

