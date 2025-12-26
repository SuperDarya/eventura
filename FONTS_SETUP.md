# 🎨 Инструкция по добавлению шрифтов

## Шаг 1: Распакуй zip-архивы

1. Распакуй все zip-архивы со шрифтами
2. Скопируй файлы шрифтов (`.woff2`, `.woff`, `.ttf`) в папку `src/fonts/`

## Шаг 2: Определи названия шрифтов

Посмотри на имена файлов, например:
- `Inter-Regular.woff2` → название шрифта: `Inter`
- `Roboto-Bold.woff2` → название шрифта: `Roboto`

## Шаг 3: Добавь @font-face в CSS

Открой `src/styles/global.css` и добавь правила для каждого начертания:

```css
@font-face {
  font-family: 'Inter';  /* Название шрифта */
  src: url('../fonts/Inter-Regular.woff2') format('woff2'),
       url('../fonts/Inter-Regular.woff') format('woff');
  font-weight: 400;  /* Regular */
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('../fonts/Inter-Medium.woff2') format('woff2'),
       url('../fonts/Inter-Medium.woff') format('woff');
  font-weight: 500;  /* Medium */
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('../fonts/Inter-Bold.woff2') format('woff2'),
       url('../fonts/Inter-Bold.woff') format('woff');
  font-weight: 700;  /* Bold */
  font-style: normal;
  font-display: swap;
}
```

## Шаг 4: Обнови theme

Открой `src/theme/index.ts` и замени названия шрифтов:

```typescript
fonts: {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
},
```

Замени `'Inter'` на название твоего шрифта.

## Готово! 🎉

После этого перезапусти сервер (`npm start`) и шрифты применятся ко всему сайту.

---

## Примеры font-weight:

- `300` - Light
- `400` - Regular / Normal
- `500` - Medium
- `600` - SemiBold
- `700` - Bold
- `800` - ExtraBold
- `900` - Black

## Форматы (в порядке приоритета):

1. `.woff2` - самый современный, самый маленький размер
2. `.woff` - fallback для старых браузеров
3. `.ttf` - если нет woff форматов

