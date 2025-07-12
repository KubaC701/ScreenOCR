/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Primary Language - Primary language for text recognition */
  "primaryLanguage": "en-US" | "fr-FR" | "it-IT" | "de-DE" | "es-ES" | "pt-BR" | "zh-Hans" | "zh-Hant" | "yue-Hans" | "yue-Hant" | "ko-KR" | "ja-JP" | "ru-RU" | "uk-UA" | "th-TH" | "vi-VT" | "ar-SA" | "ars-SA",
  /** Recognition Level - Affects performance and accuracy of the text recognition */
  "ocrMode": "accurate" | "fast",
  /** Options - Disabling this property returns the raw recognition results, which provides performance benefits but less accurate results */
  "languageCorrection": boolean,
  /** undefined - Ignores Line Breaks */
  "ignoreLineBreaks": boolean,
  /** undefined - Keep the image in the clipboard after text recognition */
  "keepImage": boolean,
  /** Custom Words List - You can improve text recognition by providing a list of words that are special to your text */
  "customWordsList"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `preferences` command */
  export type Preferences = ExtensionPreferences & {}
  /** Preferences accessible in the `recognize-text` command */
  export type RecognizeText = ExtensionPreferences & {}
  /** Preferences accessible in the `recognize-text-fullscreen` command */
  export type RecognizeTextFullscreen = ExtensionPreferences & {}
  /** Preferences accessible in the `detect-barcode` command */
  export type DetectBarcode = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `preferences` command */
  export type Preferences = {}
  /** Arguments passed to the `recognize-text` command */
  export type RecognizeText = {}
  /** Arguments passed to the `recognize-text-fullscreen` command */
  export type RecognizeTextFullscreen = {}
  /** Arguments passed to the `detect-barcode` command */
  export type DetectBarcode = {}
}

declare module "swift:*/swift" {
  export function recognizeText(fullscreen: boolean, keepImage: boolean, fast: boolean, languageCorrection: boolean, ignoreLineBreaks: boolean, customWordsList: string[], languages: string[]): Promise<string>;
  export function detectBarcode(keepImage: boolean): Promise<string>;

  export class SwiftError extends Error {
    stderr: string;
    stdout: string;
  }
}