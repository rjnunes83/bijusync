/**
 * 📦 Tipagem global de assets estáticos para TypeScript (Enterprise-ready)
 *
 * Permite importar CSS, SVG, PNG, JPG, GIF, WebP, JSON, PDF e outros assets em React/Remix/Node.
 * 
 * Exemplo:
 *   import styles from "./styles.module.css";
 *   import logo from "./logo.svg";
 *   import { ReactComponent as Icon } from "./icon.svg";
 *   import imagePng from "./img.png";
 *   import doc from "./manual.pdf";
 *
 * Expanda conforme necessário para outros tipos.
 */

// --- CSS e CSS Modules ---
declare module "*.css" {
  // Se usar CSS Modules, descomente abaixo:
  // const classes: { [key: string]: string };
  // export default classes;
  const content: string;
  export default content;
}

// --- SVG: como ReactComponent ou como URL ---
declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

// --- Imagens: PNG, JPG, JPEG, GIF, WEBP, BMP, ICO, AVIF ---
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
declare module "*.webp" {
  const src: string;
  export default src;
}
declare module "*.bmp" {
  const src: string;
  export default src;
}
declare module "*.ico" {
  const src: string;
  export default src;
}
declare module "*.avif" {
  const src: string;
  export default src;
}

// --- Vídeos ---
declare module "*.mp4" {
  const src: string;
  export default src;
}
declare module "*.webm" {
  const src: string;
  export default src;
}

// --- Documentos ---
declare module "*.pdf" {
  const src: string;
  export default src;
}

// --- Dados ---
declare module "*.json" {
  const value: any;
  export default value;
}

// --- Qualquer novo tipo, basta adicionar aqui! ---