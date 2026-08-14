/// <reference types="astro/client" />

declare module "*.py?raw" {
  const content: string;
  export default content;
}

declare module "*.typ" {
  const component: () => any;
  export default component;
}
