const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile, getNextId } = require('../data-service');

router.get('/chats', (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const messages = readJSONFile('messages.json');
    const users = readJSONFile('users_and_vendors.json');

    const chatMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const chatKey = `${Math.min(userId, otherUserId)}-${Math.max(userId, otherUserId)}`;

      if (!chatMap.has(chatKey)) {
        const otherUser = users.find(u => u.id === otherUserId);
        if (!otherUser) return;

        const lastMessage = messages
          .filter(m => 
            (m.senderId === userId && m.receiverId === otherUserId) ||
            (m.senderId === otherUserId && m.receiverId === userId)
          )
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        const unreadCount = messages.filter(m => 
          m.receiverId === userId && 
          m.senderId === otherUserId && 
          !m.read
        ).length;

        chatMap.set(chatKey, {
          id: chatKey,
          otherUser: {
            id: otherUser.id,
            name: otherUser.companyName || `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email,
            avatar: otherUser.avatar,
            type: otherUser.type
          },
          lastMessage: lastMessage ? {
            text: lastMessage.text,
            createdAt: lastMessage.createdAt
          } : null,
          unreadCount,
          updatedAt: lastMessage ? lastMessage.createdAt : new Date().toISOString()
        });
      }
    });

    const chats = Array.from(chatMap.values()).sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId1/:userId2', (req, res) => {
  try {
    const userId1 = parseInt(req.params.userId1);
    const userId2 = parseInt(req.params.userId2);

    const messages = readJSONFile('messages.json');
    const filteredMessages = messages.filter(msg =>
      (msg.senderId === userId1 && msg.receiverId === userId2) ||
      (msg.senderId === userId2 && msg.receiverId === userId1)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json(filteredMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ error: 'senderId, receiverId and text are required' });
    }

    const messages = readJSONFile('messages.json');
    const newMessage = {
      id: getNextId(messages),
      senderId: parseInt(senderId),
      receiverId: parseInt(receiverId),
      text: text.trim(),
      read: false,
      createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    writeJSONFile('messages.json', messages);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:messageId/read', (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const messages = readJSONFile('messages.json');
    const messageIndex = messages.findIndex(m => m.id === messageId);

    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    messages[messageIndex].read = true;
    writeJSONFile('messages.json', messages);

    res.json(messages[messageIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/chats/:userId1/:userId2/read', (req, res) => {
  try {
    const userId1 = parseInt(req.params.userId1);
    const userId2 = parseInt(req.params.userId2);

    const messages = readJSONFile('messages.json');
    let updated = 0;

    messages.forEach(msg => {
      if (msg.receiverId === userId1 && msg.senderId === userId2 && !msg.read) {
        msg.read = true;
        updated++;
      }
    });

    if (updated > 0) {
      writeJSONFile('messages.json', messages);
    }

    res.json({ updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

