// Declaraciones de tipos personalizadas para módulos sin tipos o con problemas de tipos

// Para uuid
declare module 'uuid' {
  export function v4(): string;
}

// Para xml2js
declare module 'xml2js' {
  export class Builder {
    constructor(options?: any);
    buildObject(obj: any): string;
  }
  
  export function parseString(xml: string, options: any, callback: (err: any, result: any) => void): void;
  export function parseStringPromise(xml: string, options?: any): Promise<any>;
}

// Para cualquier otro módulo que pueda causar problemas
declare module '*.json' {
  const value: any;
  export default value;
}

// Para archivos de estilo
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

// Para imágenes
declare module '*.svg' {
  import React from 'react';
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}
