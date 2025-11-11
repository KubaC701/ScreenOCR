import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

interface WindowsOCRResult {
  text?: string;
  success?: boolean;
  error?: string;
  stackTrace?: string;
}

/**
 * Find the Windows OCR executable
 * Looks in: extension directory, development directory, and PATH
 */
function findWindowsOCRExecutable(): string | null {
  const possiblePaths = [
    // Production: bundled with extension
    path.join(__dirname, "..", "windows-ocr", "bin", "Release", "net8.0-windows10.0.22621.0", "WindowsOCR.exe"),
    path.join(__dirname, "..", "windows-ocr", "WindowsOCR.exe"),
    // Development
    path.join(
      process.cwd(),
      "windows-ocr",
      "bin",
      "Release",
      "net8.0-windows10.0.22621.0",
      "WindowsOCR.exe",
    ),
    path.join(process.cwd(), "windows-ocr", "bin", "Debug", "net8.0-windows10.0.22621.0", "WindowsOCR.exe"),
  ];

  for (const exePath of possiblePaths) {
    if (fs.existsSync(exePath)) {
      return exePath;
    }
  }

  // Try PATH
  return "WindowsOCR.exe";
}

/**
 * Execute Windows OCR with the given options
 */
async function executeWindowsOCR(args: string[]): Promise<WindowsOCRResult> {
  const exePath = findWindowsOCRExecutable();

  if (!exePath) {
    throw new Error("WindowsOCR.exe not found. Please build the Windows OCR module first.");
  }

  try {
    // Build command with proper escaping
    const command = `"${exePath}" ${args.join(" ")}`;

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large OCR results
      windowsHide: true,
    });

    if (stderr) {
      console.error("WindowsOCR stderr:", stderr);
    }

    // Parse JSON output
    const result: WindowsOCRResult = JSON.parse(stdout.trim());
    return result;
  } catch (error) {
    if (error instanceof Error) {
      // Try to parse error output as JSON
      try {
        const errorOutput = (error as any).stdout || (error as any).message;
        const parsedError: WindowsOCRResult = JSON.parse(errorOutput);
        return parsedError;
      } catch {
        throw new Error(`Failed to execute WindowsOCR: ${error.message}`);
      }
    }
    throw error;
  }
}

/**
 * Recognize text from screen using Windows OCR
 */
export async function recognizeTextWindows(
  isFullScreen: boolean,
  keepImage: boolean,
  fast: boolean,
  languageCorrection: boolean, // Note: Windows.Media.Ocr doesn't have this option
  ignoreLineBreaks: boolean,
  customWordsList: string[],
  languages: string[],
): Promise<string> {
  const args: string[] = [];

  if (isFullScreen) {
    args.push("--fullscreen");
  }

  if (keepImage) {
    args.push("--keep-image");
  }

  if (fast) {
    args.push("--fast");
  }

  if (ignoreLineBreaks) {
    args.push("--ignore-line-breaks");
  }

  // Add languages
  for (const lang of languages) {
    args.push("--language", `"${lang}"`);
  }

  // Add custom words
  if (customWordsList.length > 0) {
    const wordsString = customWordsList.join(",");
    args.push("--custom-words", `"${wordsString}"`);
  }

  const result = await executeWindowsOCR(args);

  if (result.error) {
    throw new Error(result.error);
  }

  return result.text || "";
}

/**
 * List available OCR languages on Windows
 */
export async function listAvailableLanguagesWindows(): Promise<Array<{ languageTag: string; displayName: string }>> {
  const result = await executeWindowsOCR(["--list-languages"]);

  if (result.error) {
    throw new Error(result.error);
  }

  // The list-languages command returns the language array directly
  return result as any;
}

/**
 * Detect barcode/QR code (not yet implemented for Windows)
 */
export async function detectBarcodeWindows(keepImage: boolean): Promise<string> {
  // TODO: Implement barcode detection for Windows
  // For now, return a placeholder message
  throw new Error("Barcode detection is not yet implemented for Windows");
}
