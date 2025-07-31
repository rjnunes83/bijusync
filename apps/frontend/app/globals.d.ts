/**
 * Declaração global de módulos para o TypeScript.
 * Permite importar arquivos estáticos como CSS, SVG, PNG, etc.
 * Enterprise-ready: seguro, documentado e preparado para expansão de assets.
 *
 * Exemplo de uso:
 *   import styles from "./component.module.css";
 *   import logo from "./logo.svg";
 */

// CSS padrão e CSS Modules
declare module "*.css" {
  // Se usar CSS Modules, descomente abaixo:
  // const classes: { [key: string]: string };
  // export default classes;
  const content: string;
  export default content;
}

// SVG para importar como ReactComponent ou URL
declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  const src: string;
  export default src;
}

// PNG, JPG, outros assets
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.jpg" {
  const src: string;
  export default src;
}
declare module "*.jpeg" {
  const src: string;
  export default src;
}
declare module "*.gif" {
  const src: string;
  export default src;
}