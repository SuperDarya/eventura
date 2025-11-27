const fs = require('fs');
const path = require('path');

// Генерация данных для Eventura

const cities = ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань', 'Нижний Новгород'];
const eventTypes = ['Свадьба', 'День рождения', 'Корпоратив', 'Гендер-пати', 'Выпускной', 'Юбилей', 'Детский праздник', 'Сватовство'];
const serviceCategories = ['Кейтеринг', 'Фото и видео', 'Декор', 'Развлечения', 'Площадки', 'Транспорт'];
const firstNames = ['Иван', 'Мария', 'Алексей', 'Анна', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Андрей', 'Наталья'];
const lastNames = ['Петров', 'Иванов', 'Смирнов', 'Козлов', 'Волков', 'Соколов', 'Лебедев', 'Новиков', 'Федоров', 'Морозов'];
const companyNames = [
  'Delicious', 'Memories', 'Bloom', 'SoundWaves', 'Palace', 'Luxury', 'Perfect', 'Dreams', 'Elite', 'Premium',
  'Royal', 'Golden', 'Crystal', 'Diamond', 'Star', 'Moon', 'Sun', 'Rainbow', 'Ocean', 'Mountain'
];

function generateUsersAndVendors() {
  const data = [];
  let id = 1;
  
  // Генерируем клиентов (30 записей)
  for (let i = 0; i < 30; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    data.push({
      id: id++,
      type: 'client',
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      password: '$2b$10$hashedpassword',
      firstName,
      lastName,
      phone: `+7 (${900 + Math.floor(Math.random() * 100)}) ${100 + Math.floor(Math.random() * 900)}-${10 + Math.floor(Math.random() * 90)}-${10 + Math.floor(Math.random() * 90)}`,
      city: cities[Math.floor(Math.random() * cities.length)],
      createdAt: new Date(2023 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
    });
  }
  
  // Генерируем подрядчиков (60 записей)
  for (let i = 0; i < 60; i++) {
    const companyPrefix = companyNames[Math.floor(Math.random() * companyNames.length)];
    const category = serviceCategories[Math.floor(Math.random() * serviceCategories.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const isOrganizer = Math.random() < 0.15; // 15% организаторов
    
    // Генерируем занятые даты (календарь подрядчика)
    const calendar = [];
    const currentYear = new Date().getFullYear();
    const occupiedDays = Math.floor(Math.random() * 30) + 5; // 5-35 занятых дней
    
    for (let j = 0; j < occupiedDays; j++) {
      const month = Math.floor(Math.random() * 12);
      const day = Math.floor(Math.random() * 28) + 1;
      const dateStr = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (!calendar.includes(dateStr)) {
        calendar.push(dateStr);
      }
    }
    
    data.push({
      id: id++,
      type: isOrganizer ? 'organizer' : 'vendor',
      email: `${category.toLowerCase().replace(/\s+/g, '')}@${companyPrefix.toLowerCase()}.ru`,
      password: '$2b$10$hashedpassword',
      companyName: `${companyPrefix} ${category}`,
      contactPerson: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      calendar: calendar.sort(), // Массив дат в формате YYYY-MM-DD
      phone: `+7 (${495 + Math.floor(Math.random() * 10)}) ${100 + Math.floor(Math.random() * 900)}-${10 + Math.floor(Math.random() * 90)}-${10 + Math.floor(Math.random() * 90)}`,
      city,
      rating: Number((4.0 + Math.random() * 1.0).toFixed(1)),
      reviewsCount: Math.floor(Math.random() * 300) + 10,
      isOrganizer,
      calendar: calendar.sort(), // Массив дат в формате YYYY-MM-DD
      createdAt: new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
    });
  }
  
  // Генерируем организаторов (10 записей)
  for (let i = 0; i < 10; i++) {
    const companyPrefix = companyNames[Math.floor(Math.random() * companyNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    data.push({
      id: id++,
      type: 'organizer',
      email: `events@${companyPrefix.toLowerCase()}events.ru`,
      password: '$2b$10$hashedpassword',
      companyName: `${companyPrefix} Events`,
      contactPerson: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      phone: `+7 (${495 + Math.floor(Math.random() * 10)}) ${100 + Math.floor(Math.random() * 900)}-${10 + Math.floor(Math.random() * 90)}-${10 + Math.floor(Math.random() * 90)}`,
      city,
      rating: Number((4.5 + Math.random() * 0.5).toFixed(1)),
      reviewsCount: Math.floor(Math.random() * 200) + 50,
      isOrganizer: true,
      createdAt: new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
    });
  }
  
  return data;
}

function generateServices(vendorIds) {
  const data = [];
  const serviceNames = {
    'Кейтеринг': ['Фуршет на 50 человек', 'Банкет на 100 человек', 'Канapé-сервис', 'Барбекю', 'Кофе-брейк', 'Шведский стол', 'Свадебный банкет', 'Корпоративный обед'],
    'Фото и видео': ['Свадебная съемка', 'Love Story', 'Корпоративная съемка', 'Детская съемка', 'Портретная съемка', 'Репортажная съемка', 'Видеоклип', 'Промо-ролик'],
    'Декор': ['Оформление зала', 'Цветочная арка', 'Фотозона', 'Свадебная арка', 'Освещение', 'Баннеры', 'Текстиль', 'Свечи'],
    'Развлечения': ['DJ', 'Живая музыка', 'Ведущий', 'Аниматоры', 'Шоу-программа', 'Квест', 'Фото-видео зона', 'Караоке'],
    'Площадки': ['Ресторан', 'Банкетный зал', 'Лофт', 'Загородный дом', 'Терраса', 'Бар', 'Кафе', 'Дворец культуры'],
    'Транспорт': ['Свадебный кортеж', 'Лимузин', 'Автобус', 'Микроавтобус', 'Экскурсионный автобус', 'VIP транспорт']
  };
  
  let id = 1;
  vendorIds.forEach(vendorId => {
    const category = serviceCategories[Math.floor(Math.random() * serviceCategories.length)];
    const names = serviceNames[category];
    const serviceCount = Math.floor(Math.random() * 3) + 2; // 2-4 услуги на подрядчика
    
    for (let i = 0; i < serviceCount; i++) {
      data.push({
        id: id++,
        vendorId,
        name: names[Math.floor(Math.random() * names.length)],
        category,
        description: `Профессиональная услуга "${names[Math.floor(Math.random() * names.length)]}" от опытных специалистов`,
        priceMin: Math.floor(Math.random() * 50000) + 5000,
        priceMax: Math.floor(Math.random() * 200000) + 50000,
        unit: ['за услугу', 'за час', 'за мероприятие', 'за человека'][Math.floor(Math.random() * 4)],
        duration: Math.floor(Math.random() * 8) + 2,
        createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
      });
    }
  });
  
  return data;
}

function generateVendorProfiles(vendorIds) {
  const data = [];
  
  vendorIds.forEach(vendorId => {
    data.push({
      id: vendorId,
      vendorId,
      bio: 'Профессиональная команда с многолетним опытом организации мероприятий. Мы создаем незабываемые моменты для наших клиентов.',
      portfolio: Array.from({ length: 5 }, () => `/images/portfolio/${vendorId}_${Math.floor(Math.random() * 10)}.jpg`),
      specialties: serviceCategories.filter(() => Math.random() > 0.6).slice(0, 3),
      yearsExperience: Math.floor(Math.random() * 15) + 1,
      languages: ['Русский', ...(Math.random() > 0.5 ? ['English'] : [])],
      updatedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
    });
  });
  
  return data;
}

function generateBookings(clientIds, vendorIds, serviceIds, eventIds) {
  const data = [];
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  
  let id = 1;
  for (let i = 0; i < 100; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const service = serviceIds[Math.floor(Math.random() * serviceIds.length)];
    
    data.push({
      id: id++,
      clientId: clientIds[Math.floor(Math.random() * clientIds.length)],
      vendorId: vendorIds[Math.floor(Math.random() * vendorIds.length)],
      serviceId: service,
      eventId: eventIds[Math.floor(Math.random() * eventIds.length)],
      status,
      totalPrice: Math.floor(Math.random() * 200000) + 10000,
      date: new Date(2024 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
    });
  }
  
  return data;
}

function generateEvents(clientIds) {
  const data = [];
  
  let id = 1;
  for (let i = 0; i < 100; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    data.push({
      id: id++,
      clientId: clientIds[Math.floor(Math.random() * clientIds.length)],
      type: eventType,
      title: `${eventType} - ${Math.floor(Math.random() * 1000) + 1}`,
      budget: Math.floor(Math.random() * 500000) + 50000,
      guestsCount: Math.floor(Math.random() * 200) + 10,
      date: new Date(2024 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      city: cities[Math.floor(Math.random() * cities.length)],
      description: `Организация ${eventType.toLowerCase()} для ${Math.floor(Math.random() * 200) + 10} гостей`,
      status: ['draft', 'planning', 'confirmed', 'completed'][Math.floor(Math.random() * 4)],
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
    });
  }
  
  return data;
}

function generateReviews(clientIds, vendorIds, bookingIds) {
  const data = [];
  
  let id = 1;
  for (let i = 0; i < 100; i++) {
    data.push({
      id: id++,
      clientId: clientIds[Math.floor(Math.random() * clientIds.length)],
      vendorId: vendorIds[Math.floor(Math.random() * vendorIds.length)],
      bookingId: bookingIds[Math.floor(Math.random() * bookingIds.length)],
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 звезд
      comment: ['Отличная работа!', 'Все прошло замечательно', 'Рекомендую', 'Профессионалы своего дела', 'Остались довольны'][Math.floor(Math.random() * 5)],
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
    });
  }
  
  return data;
}

// Генерация всех файлов
const usersAndVendors = generateUsersAndVendors();
const vendorIds = usersAndVendors.filter(u => u.type === 'vendor' || u.type === 'organizer').map(u => u.id);
const clientIds = usersAndVendors.filter(u => u.type === 'client').map(u => u.id);

const services = generateServices(vendorIds);
const serviceIds = services.map(s => s.id);

const vendorProfiles = generateVendorProfiles(vendorIds);

const events = generateEvents(clientIds);
const eventIds = events.map(e => e.id);

const bookings = generateBookings(clientIds, vendorIds, serviceIds, eventIds);
const bookingIds = bookings.map(b => b.id);

const reviews = generateReviews(clientIds, vendorIds, bookingIds);

// Сохранение файлов
const dataDir = path.join(__dirname, '..', 'stubs', 'data');

fs.writeFileSync(path.join(dataDir, 'users_and_vendors.json'), JSON.stringify(usersAndVendors, null, 2));
fs.writeFileSync(path.join(dataDir, 'services.json'), JSON.stringify(services, null, 2));
fs.writeFileSync(path.join(dataDir, 'vendor_profiles.json'), JSON.stringify(vendorProfiles, null, 2));
fs.writeFileSync(path.join(dataDir, 'events.json'), JSON.stringify(events, null, 2));
fs.writeFileSync(path.join(dataDir, 'bookings.json'), JSON.stringify(bookings, null, 2));
fs.writeFileSync(path.join(dataDir, 'reviews.json'), JSON.stringify(reviews, null, 2));
fs.writeFileSync(path.join(dataDir, 'event_types.json'), JSON.stringify(eventTypes.map((et, i) => ({ id: i + 1, name: et, description: `Организация ${et.toLowerCase()}` })), null, 2));

console.log('✅ Данные сгенерированы успешно!');
console.log(`- Пользователей и подрядчиков: ${usersAndVendors.length}`);
console.log(`- Услуг: ${services.length}`);
console.log(`- Профилей подрядчиков: ${vendorProfiles.length}`);
console.log(`- Мероприятий: ${events.length}`);
console.log(`- Бронирований: ${bookings.length}`);
console.log(`- Отзывов: ${reviews.length}`);

