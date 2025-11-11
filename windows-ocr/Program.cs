using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Windows.Globalization;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage;
using Windows.Storage.Streams;

namespace WindowsOCR
{
    class Program
    {
        [DllImport("user32.dll")]
        static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

        [DllImport("user32.dll")]
        static extern int GetSystemMetrics(int nIndex);

        [StructLayout(LayoutKind.Sequential)]
        public struct RECT
        {
            public int Left;
            public int Top;
            public int Right;
            public int Bottom;
        }

        static async Task<int> Main(string[] args)
        {
            try
            {
                var options = ParseArguments(args);

                if (options.ShowHelp)
                {
                    ShowHelp();
                    return 0;
                }

                if (options.ListLanguages)
                {
                    ListAvailableLanguages();
                    return 0;
                }

                // Capture screenshot
                Bitmap screenshot;
                if (options.Fullscreen)
                {
                    screenshot = CaptureFullScreen();
                }
                else
                {
                    // For now, capture full screen (screenshot tool integration will come later)
                    screenshot = CaptureFullScreen();
                }

                if (screenshot == null)
                {
                    var error = new { error = "Failed to capture screenshot" };
                    Console.WriteLine(JsonSerializer.Serialize(error));
                    return 1;
                }

                // Perform OCR
                var recognizedText = await PerformOCR(screenshot, options);

                // Copy to clipboard if requested
                if (options.KeepImage)
                {
                    CopyImageToClipboard(screenshot);
                }

                // Output result as JSON
                var result = new
                {
                    text = recognizedText,
                    success = !string.IsNullOrEmpty(recognizedText)
                };

                Console.WriteLine(JsonSerializer.Serialize(result));
                screenshot.Dispose();
                return 0;
            }
            catch (Exception ex)
            {
                var error = new { error = ex.Message, stackTrace = ex.StackTrace };
                Console.WriteLine(JsonSerializer.Serialize(error));
                return 1;
            }
        }

        static OCROptions ParseArguments(string[] args)
        {
            var options = new OCROptions();

            for (int i = 0; i < args.Length; i++)
            {
                switch (args[i].ToLower())
                {
                    case "--help":
                    case "-h":
                        options.ShowHelp = true;
                        break;
                    case "--list-languages":
                        options.ListLanguages = true;
                        break;
                    case "--fullscreen":
                        options.Fullscreen = true;
                        break;
                    case "--keep-image":
                        options.KeepImage = true;
                        break;
                    case "--fast":
                        options.Fast = true;
                        break;
                    case "--ignore-line-breaks":
                        options.IgnoreLineBreaks = true;
                        break;
                    case "--language":
                    case "-l":
                        if (i + 1 < args.Length)
                        {
                            options.Languages.Add(args[++i]);
                        }
                        break;
                    case "--custom-words":
                        if (i + 1 < args.Length)
                        {
                            options.CustomWords.AddRange(args[++i].Split(','));
                        }
                        break;
                }
            }

            if (options.Languages.Count == 0)
            {
                options.Languages.Add("en-US");
            }

            return options;
        }

        static void ShowHelp()
        {
            Console.WriteLine(@"WindowsOCR - Text Recognition Tool

Usage: WindowsOCR.exe [options]

Options:
  --help, -h              Show this help message
  --list-languages        List available OCR languages
  --fullscreen            Capture entire screen (default)
  --keep-image            Keep image in clipboard after OCR
  --fast                  Use fast recognition mode
  --ignore-line-breaks    Replace line breaks with spaces
  --language, -l <lang>   Set language (can be used multiple times)
                          Example: -l en-US -l fr-FR
  --custom-words <words>  Comma-separated list of custom words

Examples:
  WindowsOCR.exe --fullscreen --language en-US
  WindowsOCR.exe --fast --ignore-line-breaks
  WindowsOCR.exe -l en-US -l ja-JP --custom-words ""foo,bar""
");
        }

        static void ListAvailableLanguages()
        {
            var languages = OcrEngine.AvailableRecognizerLanguages;
            var languageList = languages.Select(lang => new
            {
                languageTag = lang.LanguageTag,
                displayName = lang.DisplayName
            }).ToList();

            Console.WriteLine(JsonSerializer.Serialize(languageList, new JsonSerializerOptions
            {
                WriteIndented = true
            }));
        }

        static Bitmap CaptureFullScreen()
        {
            try
            {
                int screenWidth = GetSystemMetrics(0);  // SM_CXSCREEN
                int screenHeight = GetSystemMetrics(1); // SM_CYSCREEN

                Bitmap bitmap = new Bitmap(screenWidth, screenHeight);
                using (Graphics g = Graphics.FromImage(bitmap))
                {
                    g.CopyFromScreen(0, 0, 0, 0, bitmap.Size);
                }

                return bitmap;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error capturing screen: {ex.Message}");
                return null;
            }
        }

        static void CopyImageToClipboard(Bitmap image)
        {
            try
            {
                System.Windows.Forms.Clipboard.SetImage(image);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error copying to clipboard: {ex.Message}");
            }
        }

        static async Task<string> PerformOCR(Bitmap bitmap, OCROptions options)
        {
            // Convert Bitmap to SoftwareBitmap for Windows.Media.Ocr
            SoftwareBitmap softwareBitmap = await ConvertToSoftwareBitmap(bitmap);

            if (softwareBitmap == null)
            {
                return "Error: Failed to convert image for OCR";
            }

            // Try to get OCR engine for requested language
            OcrEngine? ocrEngine = null;
            foreach (var langTag in options.Languages)
            {
                try
                {
                    var language = new Language(langTag);
                    if (OcrEngine.IsLanguageSupported(language))
                    {
                        ocrEngine = OcrEngine.TryCreateFromLanguage(language);
                        if (ocrEngine != null)
                            break;
                    }
                }
                catch
                {
                    // Try next language
                    continue;
                }
            }

            // Fallback to system default language
            if (ocrEngine == null)
            {
                ocrEngine = OcrEngine.TryCreateFromUserProfileLanguages();
            }

            if (ocrEngine == null)
            {
                return "Error: No OCR engine available for requested languages";
            }

            // Perform OCR
            var result = await ocrEngine.RecognizeAsync(softwareBitmap);

            if (result == null || result.Lines.Count == 0)
            {
                return "";
            }

            // Build recognized text
            var textBuilder = new StringBuilder();
            foreach (var line in result.Lines)
            {
                if (textBuilder.Length > 0)
                {
                    textBuilder.Append(options.IgnoreLineBreaks ? " " : "\n");
                }
                textBuilder.Append(line.Text);
            }

            return textBuilder.ToString();
        }

        static async Task<SoftwareBitmap?> ConvertToSoftwareBitmap(Bitmap bitmap)
        {
            try
            {
                // Save bitmap to memory stream
                using var memoryStream = new MemoryStream();
                bitmap.Save(memoryStream, ImageFormat.Bmp);
                memoryStream.Position = 0;

                // Create random access stream
                var randomAccessStream = new InMemoryRandomAccessStream();
                await memoryStream.CopyToAsync(randomAccessStream.AsStreamForWrite());
                randomAccessStream.Seek(0);

                // Decode image
                var decoder = await BitmapDecoder.CreateAsync(randomAccessStream);
                var softwareBitmap = await decoder.GetSoftwareBitmapAsync();

                // Convert to BGRA8 format if needed (required by OCR)
                if (softwareBitmap.BitmapPixelFormat != BitmapPixelFormat.Bgra8)
                {
                    softwareBitmap = SoftwareBitmap.Convert(softwareBitmap, BitmapPixelFormat.Bgra8);
                }

                return softwareBitmap;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error converting bitmap: {ex.Message}");
                return null;
            }
        }

        class OCROptions
        {
            public bool ShowHelp { get; set; }
            public bool ListLanguages { get; set; }
            public bool Fullscreen { get; set; } = true;
            public bool KeepImage { get; set; }
            public bool Fast { get; set; }
            public bool IgnoreLineBreaks { get; set; }
            public List<string> Languages { get; set; } = new List<string>();
            public List<string> CustomWords { get; set; } = new List<string>();
        }
    }
}
