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

## 3D-модели

TresJS (Vue-остров, грузится только у сцены). Свою сцену пишете в `src/components/scenes/`. Файлы — в `public/models/`.

### Сборка из SolidCraft с суставами

`RobotViewer` грузит URDF и строит ползунки по подвижным суставам (`revolute`, `continuous`, `prismatic`). В SolidCraft: **File → Export URDF…** — рядом с `robot.urdf` появятся STL-меши.

```mdx
import Scene3D from "../../components/Scene3D.astro"
import RobotViewer from "../../components/scenes/RobotViewer.vue"

<Scene3D caption="Двухзвенный манипулятор.">
  <RobotViewer
    client:only="vue"
    src="/models/arm2r/robot.urdf"
    pose={{ base_to_link_1: 35, link_1_to_link_2: 55 }}
    labels={{ base_link: "основание", link_1: "звено 1", link_2: "звено 2" }}
  />
</Scene3D>
```

- `pose` — стартовая поза: градусы для вращательных, метры для поступательных.
- `labels` — подписи ссылок; без него подчёркивания заменяются пробелами.
- `show-labels={false}` — выключить подписи.
- Если в сборке нет подвижных суставов, ползунков не будет — модель просто отобразится.

В MDX props передаются как `labels={{ ... }}`. Синтаксис `:labels` работает только в шаблонах `.vue`, в MDX/Astro он не сработает.

### Статичная модель: 3MF, OBJ, STL, GLB

`ModelViewer` поддерживает `.3mf`, `.obj`, `.stl`, `.glb`, `.gltf` и умеет разносить части.

```mdx
import ModelViewer from "../../components/scenes/ModelViewer.vue"

<Scene3D caption="Сборка схвата.">
  <ModelViewer client:only="vue" src="/models/gripper/gripper.3mf" />
</Scene3D>
```

- Для SolidCraft лучше **3MF**: один файл, несколько тел и цвета.
- `auto-rotate` — медленное вращение, `background` — цвет фона.
- `up="z"` / `up="y"` — если автоопределение оси не подходит (CAD — Z-up, glTF — Y-up).
- Для старых сцен с `.glb` и Draco остаётся `Model3D.vue`.

Демо-файлы: `public/models/test-arm/robot.urdf` и `public/models/test-assembly/assembly.obj`.

Ограничения: URDF — дерево, замкнутые кинематические цепи SolidCraft при экспорте теряет; цвет в URDF берётся от первого тела ссылки, PBR-материалов нет. В PDF/EPUB остаётся подпись: WebGL в книге-файле нет.
