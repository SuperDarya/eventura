# Шрифты

## Как добавить шрифты:

1. **Распакуй zip-архивы** с шрифтами в эту папку (`src/fonts/`)
2. **Структура должна быть такой:**
   ```
   src/fonts/
   ├── FontName-Regular.woff2
   ├── FontName-Regular.woff
   ├── FontName-Bold.woff2
   ├── FontName-Bold.woff
   └── ...
   ```

3. **Форматы шрифтов:**
   - `.woff2` (рекомендуется, самый современный)
   - `.woff` (fallback)
   - `.ttf` (если нет woff)

4. **После добавления файлов** - обнови `src/styles/global.css` с @font-face правилами

## Пример структуры для шрифта "CustomFont":

```
src/fonts/
├── CustomFont-Regular.woff2
├── CustomFont-Regular.woff
├── CustomFont-Bold.woff2
├── CustomFont-Bold.woff
├── CustomFont-Medium.woff2
└── CustomFont-Medium.woff
```

