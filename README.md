# UI Sample Project

Проект для генерации каталогов товаров с использованием AI.

## Предварительные требования

- Node.js (версия 22 или выше)
- npm

## Установка зависимостей

```bash
npm ci
```

## Настройка переменных окружения

Создайте файл `.env` в корне проекта (если используете GigaChat API):

```env
GIGA_AUTH=your_gigachat_auth_token_here
```

**Примечание:** Если вы не планируете использовать функциональность, требующую GigaChat API, проект может работать и без этого файла.

## Запуск проекта

### Режим разработки

Запускает frontend и backend API вместе:

```bash
npm start
```

Сервер запустится на порту **8099** и автоматически откроет браузер.

- Frontend: http://localhost:8099
- API endpoints: http://localhost:8099/api/*

### Дополнительные команды

**Сборка для разработки:**
```bash
npm run build
```

**Сборка для продакшена:**
```bash
npm run build:prod
```

**Запуск LangGraph сервера** (для AI агентов):
```bash
npm run langgraph
```

**Проверка кода линтером:**
```bash
npm run eslint
```

**Автоисправление ошибок линтера:**
```bash
npm run eslint:fix
```

**Очистка папки dist:**
```bash
npm run clean
```

## Структура проекта

- `src/` - Исходный код React приложения
- `stubs/api/` - Backend API (Express.js роутеры)
- `bro.config.js` - Конфигурация BroJS сборщика

## Доступные страницы

После запуска доступны следующие маршруты:

- `/ui-sample-project` - Главная страница (генерация каталога)
- `/ui-sample-project/chat` - Чат с AI
- `/ui-sample-project/catalog` - Каталог товаров
- `/ui-sample-project/orders` - Заказы
- `/ui-sample-project/analytics` - Аналитика

## Как это работает

1. **BroJS** автоматически подхватывает API из папки `stubs/api/` и запускает их вместе с frontend
2. Frontend работает на React с Chakra UI
3. State управляется через Redux Toolkit
4. API endpoints доступны через `/api/*`

## Примечания

- Основная логика генерации каталога находится в закомментированном виде в `stubs/api/index.js`
- Для полной функциональности может потребоваться настройка GigaChat API
- LangGraph agent настроен для работы с погодой (см. `stubs/api/agent.js`)

