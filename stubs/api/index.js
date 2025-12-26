require('dotenv').config()
const { Router } = require('express')
const path = require('path')
const express = require('express')

const { agentRouter } = require('./agent')

// Eventura API routes
const authRouter = require('./eventura/auth')
const vendorsRouter = require('./eventura/vendors')
const servicesRouter = require('./eventura/services')
const eventsRouter = require('./eventura/events')
const bookingsRouter = require('./eventura/bookings')
const aiSearchRouter = require('./eventura/ai-search')
const favoritesRouter = require('./eventura/favorites')
const messagesRouter = require('./eventura/messages')

const router = Router()

const timer = (time = 300) => (req, res, next) => setTimeout(next, time);

router.use(timer());
router.use('/agent', agentRouter)

// Eventura routes
router.use('/eventura/auth', authRouter)
router.use('/eventura/vendors', vendorsRouter)
router.use('/eventura/services', servicesRouter)
router.use('/eventura/events', eventsRouter)
router.use('/eventura/bookings', bookingsRouter)
router.use('/eventura/ai-search', aiSearchRouter)
router.use('/eventura/favorites', favoritesRouter)
router.use('/eventura/messages', messagesRouter)

// Статика для изображений
router.use('/images', express.static(path.join(__dirname, '../images')))

module.exports = router;
