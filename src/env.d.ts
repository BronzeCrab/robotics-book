/// <reference types="astro/client" />

declare module "*.py?raw" {
  const content: string;
  export default content;
}

declare module "*.typ" {
  const component: () => any;
  export default component;
}

declare module "urdf-loader" {
  export default class URDFLoader {
    constructor(manager?: unknown);
    workingPath: string;
    packages: Record<string, string> | string;
    parseVisual: boolean;
    parseCollision: boolean;
    load(
      url: string,
      onComplete: (robot: any) => void,
      onProgress?: (event: unknown) => void,
      onError?: (error: unknown) => void,
    ): void;
    loadAsync(url: string): Promise<any>;
  }
}
