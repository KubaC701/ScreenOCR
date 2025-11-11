import { getUserSelectedLanguages, usePreferences } from "./hooks";
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
  } catch (error) {
    console.error(error);
    throw new Error("Failed to recognize text");
  }
};

export const detectBarcode = async () => {
  const preference = usePreferences();

  try {
    const detectedCodes = await detectBarcodeWindows(preference.keepImage);
    return detectedCodes;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to detect barcode");
  }
};
