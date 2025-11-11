import { getUserSelectedLanguages, usePreferences } from "./hooks";
import { environment } from "@raycast/api";

// Platform detection
const isMacOS = environment.appearance !== undefined && process.platform === "darwin";
const isWindows = process.platform === "win32";

// Import platform-specific implementations
let recognizeTextSwift: any;
let detectBarcodeSwift: any;

if (isMacOS) {
  // Dynamically import Swift bindings on macOS
  const swiftModule = await import("swift:../swift");
  recognizeTextSwift = swiftModule.recognizeText;
  detectBarcodeSwift = swiftModule.detectBarcode;
}

// Import Windows implementation
import {
  recognizeTextWindows,
  detectBarcodeWindows,
} from "./utils-windows";

export const recognizeText = async (isFullScreen = false) => {
  const preference = usePreferences();

  try {
    const languages = await getUserSelectedLanguages();
    const customWordsList = preference.customWordsList ? preference.customWordsList.split(",") : [];
    const languageValues = languages.map((lang) => lang.value);

    if (isMacOS && recognizeTextSwift) {
      // Use Swift implementation on macOS
      const recognizedText = await recognizeTextSwift(
        isFullScreen,
        preference.keepImage,
        preference.ocrMode === "fast",
        preference.languageCorrection,
        preference.ignoreLineBreaks,
        customWordsList,
        languageValues,
      );
      return recognizedText;
    } else if (isWindows) {
      // Use Windows implementation
      const recognizedText = await recognizeTextWindows(
        isFullScreen,
        preference.keepImage,
        preference.ocrMode === "fast",
        preference.languageCorrection,
        preference.ignoreLineBreaks,
        customWordsList,
        languageValues,
      );
      return recognizedText;
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to recognize text");
  }
};

export const detectBarcode = async () => {
  const preference = usePreferences();

  try {
    if (isMacOS && detectBarcodeSwift) {
      // Use Swift implementation on macOS
      const detectedCodes = await detectBarcodeSwift(preference.keepImage);
      return detectedCodes;
    } else if (isWindows) {
      // Use Windows implementation
      const detectedCodes = await detectBarcodeWindows(preference.keepImage);
      return detectedCodes;
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to detect barcode");
  }
};
