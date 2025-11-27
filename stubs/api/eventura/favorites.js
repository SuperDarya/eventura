const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile } = require('../data-service');

// GET /api/eventura/favorites/:userId - Получить избранные подрядчики пользователя
router.get('/:userId', (req, res) => {
  try {
    const users = readJSONFile('users_and_vendors.json');
    const user = users.find(u => u.id === parseInt(req.params.userId) && u.type === 'client');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const favoriteIds = user.favorites || [];
    
    // Получаем данные о подрядчиках
    const vendors = users.filter(u => 
      (u.type === 'vendor' || u.type === 'organizer') && 
      favoriteIds.includes(u.id)
    );
    
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/eventura/favorites/:userId - Добавить подрядчика в избранное
router.post('/:userId', (req, res) => {
  try {
    const { vendorId } = req.body;
    
    if (!vendorId) {
      return res.status(400).json({ error: 'vendorId is required' });
    }
    
    const users = readJSONFile('users_and_vendors.json');
    const user = users.find(u => u.id === parseInt(req.params.userId) && u.type === 'client');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Проверяем, существует ли подрядчик
    const vendor = users.find(u => 
      u.id === vendorId && (u.type === 'vendor' || u.type === 'organizer')
    );
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Инициализируем favorites, если его нет
    if (!user.favorites) {
      user.favorites = [];
    }
    
    // Добавляем, если еще нет
    if (!user.favorites.includes(vendorId)) {
      user.favorites.push(vendorId);
      
      // Обновляем пользователя в массиве
      const userIndex = users.findIndex(u => u.id === user.id);
      users[userIndex] = user;
      
      writeJSONFile('users_and_vendors.json', users);
    }
    
    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/eventura/favorites/:userId/:vendorId - Удалить подрядчика из избранного
router.delete('/:userId/:vendorId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const vendorId = parseInt(req.params.vendorId);
    
    const users = readJSONFile('users_and_vendors.json');
    const user = users.find(u => u.id === userId && u.type === 'client');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.favorites) {
      user.favorites = [];
    }
    
    // Удаляем из избранного
    user.favorites = user.favorites.filter(id => id !== vendorId);
    
    // Обновляем пользователя в массиве
    const userIndex = users.findIndex(u => u.id === user.id);
    users[userIndex] = user;
    
    writeJSONFile('users_and_vendors.json', users);
    
    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

