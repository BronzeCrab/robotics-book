# Книга по робототехнике

Статический сайт-книга: [Astro](https://astro.build) + MDX, формулы и схемы на [Typst](https://typst.app), подсветка Python через Expressive Code.

## Команды

```sh
pnpm install
pnpm dev
pnpm build
```

`pnpm build` собирает сайт и сразу кладёт в `dist/downloads/` файлы книги:

- **PDF** — A4 из HTML-вёрстки (нужен Chrome или Edge)
- **EPUB 3** — Kindle, Apple Books, Яндекс Книги, Kobo
- **FB2** — читалки в рунете
- **HTML** — одна страница офлайн
- **ZIP** — копия сайта

Страница скачивания: `/downloads/`. Версия для печати: `/print/`.

Главы — `src/content/chapters/`. Формулы — `Eq`, схемы — `.typ` в `src/content/figures/`, примеры Python — `examples/`.

Видео в тексте:

```mdx
import Video from "../../components/Video.astro"

<Video
  src="https://www.youtube.com/watch?v=VIDEO_ID"
  caption="Прямая кинематика 2R."
/>

<Video src="arm.mp4" poster="/videos/arm.jpg" caption="Файл из public/videos/ или с CDN." />
<Video src="https://cdn.example.com/arm.mp4" caption="Прямая ссылка на CDN." />
```

На сайте это плеер. В PDF и EPUB остаётся подпись и ссылка: iframe в печати и большинстве читалок не работает.

Тяжёлые mp4/glb в git не кладём. Пока файлов мало — `public/videos/` и `public/models/`. Когда станет жалко трафик или размер репозитория, в [`src/lib/site.ts`](src/lib/site.ts) задаётся `media.base` (R2, Bunny, S3). На бакете нужен CORS, иначе TresJS не загрузит модель. YouTube/Vimeo — уже чужой CDN, свой не нужен.

Схемы Typst/CeTZ в CDN не уходят: это SVG внутри HTML.

3D — TresJS (Vue-остров, грузится только у сцены). Свою сцену пишете в `src/components/scenes/`. Готовый glTF:

```mdx
import Scene3D from "../../components/Scene3D.astro"
import Model3D from "../../components/scenes/Model3D.vue"

<Scene3D caption="Модель манипулятора.">
  <Model3D client:only="vue" src="/models/arm.glb">
    <p>Загрузка 3D…</p>
  </Model3D>
</Scene3D>
```

Файлы моделей — в `public/models/`. В PDF/EPUB остаётся подпись: WebGL в книге-файле нет.
