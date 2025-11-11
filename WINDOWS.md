# ScreenOCR for Windows - Setup Guide

This extension uses the native **Windows.Media.Ocr API** for local, offline text recognition!

## Requirements

### For Users
- Windows 10 version 1809 or later (or Windows 11)
- .NET 8.0 Runtime (automatically installed with Windows updates)

### For Developers
- Windows 10/11
- .NET 8.0 SDK or later
- Windows SDK 10.0.22621.0 or later
- Node.js (for Raycast extension development)

## Installation

### For Users (When Published to Raycast Store)
1. Install the extension from Raycast Store
2. The Windows OCR module should be pre-built and included
3. Grant Screen Recording permission when prompted

### For Developers

1. Clone the repository:
```bash
git clone https://github.com/[your-repo]/ScreenOCR.git
cd ScreenOCR
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Build the Windows OCR native module:
```bash
npm run build:windows-ocr
```

Or manually:
```bash
cd windows-ocr
dotnet restore
dotnet build -c Release
```

4. Run in development mode:
```bash
npm run dev
```

## How It Works

The Windows implementation uses a hybrid architecture:

1. **C# Native Module** (`windows-ocr/WindowsOCR.exe`):
   - Uses Windows.Media.Ocr API for text recognition
   - Captures screenshots using Windows GDI+
   - Outputs results as JSON

2. **TypeScript Wrapper** (`src/utils-windows.ts`):
   - Spawns the native executable
   - Parses JSON results
   - Integrates with Raycast extension

## Language Support

The Windows OCR engine supports many languages. To see which languages are available on your system:

```bash
cd windows-ocr/bin/Release/net8.0-windows10.0.22621.0
WindowsOCR.exe --list-languages
```

Common languages:
- 🇺🇸 English (en-US)
- 🇫🇷 French (fr-FR)
- 🇩🇪 German (de-DE)
- 🇪🇸 Spanish (es-ES)
- 🇨🇳 Chinese Simplified (zh-Hans)
- 🇹🇼 Chinese Traditional (zh-Hant)
- 🇯🇵 Japanese (ja-JP)
- 🇰🇷 Korean (ko-KR)
- 🇷🇺 Russian (ru-RU)
- 🇸🇦 Arabic (ar-SA)

### Adding More Languages

Windows OCR languages are managed through Windows Settings:

1. Open **Settings** → **Time & Language** → **Language & region**
2. Click **Add a language**
3. Select the language you want to add
4. Make sure **Handwriting** or **OCR** is included in the language pack

## Features

### ✅ Supported
- Full screen text recognition
- Multi-language OCR
- Fast/Accurate recognition modes
- Custom words list
- Ignore line breaks option
- Keep image in clipboard option
- Language preferences

### ⏳ Coming Soon
- Interactive area selection (currently captures full screen)
- Barcode/QR code detection
- Better screenshot capture UX

## Current Limitations

1. **Full Screen Only**: Currently captures the entire screen. Interactive area selection will be added in a future update.

2. **No Barcode Detection Yet**: The barcode/QR code detection feature is not yet implemented for Windows.

3. **Language Correction**: The language correction option is accepted but may not have significant impact on Windows.Media.Ocr results.

## Troubleshooting

### "WindowsOCR.exe not found"
**Solution**: Build the Windows OCR module:
```bash
npm run build:windows-ocr
```

### ".NET SDK not found"
**Solution**: Install .NET 8.0 SDK from https://dotnet.microsoft.com/download

### "No OCR engine available"
**Solution**:
1. Check if the language is installed in Windows Settings
2. Try using "en-US" as a fallback language
3. Run `WindowsOCR.exe --list-languages` to see available languages

### Poor OCR Accuracy
**Solutions**:
- Use "Accurate" mode instead of "Fast" mode
- Ensure the correct language is selected
- Add custom words for domain-specific terms
- Install additional language packs from Windows Settings

## Development

### Project Structure

```
ScreenOCR/
├── src/
│   ├── utils.ts              # Main utils wrapper
│   ├── utils-windows.ts      # Windows OCR implementation
│   └── ...                   # Other TypeScript files
├── windows-ocr/              # Windows native module
│   ├── Program.cs           # Main OCR logic
│   ├── WindowsOCR.csproj    # C# project file
│   ├── build.bat            # Build script
│   └── README.md            # Windows module docs
└── package.json
```

### Building for Distribution

When distributing the extension, make sure to include the compiled Windows OCR executable:

```bash
# Build in Release mode
cd windows-ocr
dotnet build -c Release

# The executable will be at:
# windows-ocr/bin/Release/net8.0-windows10.0.22621.0/WindowsOCR.exe
```

### Testing

```bash
# Build the native module
npm run build:windows-ocr

# Run in development mode
npm run dev

# Test OCR functionality
```

## Technical Details

### Windows.Media.Ocr API
- Part of Windows Runtime (WinRT)
- Available since Windows 10 version 1809
- Supports 25+ languages
- Runs completely offline
- Free to use

### Performance
- Fast mode: ~0.5-1 second for full screen
- Accurate mode: ~1-2 seconds for full screen
- Performance depends on screen resolution and text density

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Known Issues

Please check the [GitHub Issues](https://github.com/[your-repo]/ScreenOCR/issues) page for known issues and planned features.

## Credits

- Built for [Raycast for Windows](https://www.raycast.com/windows)
- Uses Windows.Media.Ocr API

## License

MIT License - see LICENSE file for details
