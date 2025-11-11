# Windows OCR Native Module

This is the native Windows OCR implementation for the ScreenOCR Raycast extension. It uses Windows.Media.Ocr API for text recognition.

## Requirements

- .NET 8.0 SDK or later
- Windows 10/11
- Windows SDK 10.0.22621.0 or later

## Building

```bash
# Restore dependencies and build
dotnet restore
dotnet build -c Release

# Publish self-contained executable (optional)
dotnet publish -c Release -r win-x64 --self-contained false
```

## Usage

The executable is called by the TypeScript code and accepts command-line arguments:

```bash
# Basic usage (full screen capture)
WindowsOCR.exe --fullscreen --language en-US

# Multiple languages
WindowsOCR.exe -l en-US -l ja-JP

# Fast mode with custom words
WindowsOCR.exe --fast --custom-words "Raycast,TypeScript,Node.js"

# List available languages
WindowsOCR.exe --list-languages

# Keep image in clipboard
WindowsOCR.exe --keep-image
```

## Output Format

The executable outputs JSON to stdout:

```json
{
  "text": "Recognized text here",
  "success": true
}
```

In case of error:

```json
{
  "error": "Error message",
  "stackTrace": "..."
}
```

## Language Support

The OCR engine supports many languages. To see available languages on your system:

```bash
WindowsOCR.exe --list-languages
```

Common language codes:
- `en-US` - English (United States)
- `fr-FR` - French (France)
- `de-DE` - German (Germany)
- `es-ES` - Spanish (Spain)
- `zh-Hans` - Chinese (Simplified)
- `zh-Hant` - Chinese (Traditional)
- `ja-JP` - Japanese
- `ko-KR` - Korean

## Notes

- Currently captures full screen only
- Interactive area selection will be added in a future update
- Requires Windows 10 version 1809 or later
