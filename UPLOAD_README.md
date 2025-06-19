# Supabase Video Upload Script

A bash script for easily uploading video files to Supabase Storage from the command line.

## Features

- 🚀 Fast and reliable video uploads to Supabase Storage
- 📁 Automatic organization into folders
- 🔄 Timestamp-based file naming to prevent conflicts
- 🔗 Generates public URLs for easy sharing
- 📋 Clipboard integration for quick access to upload links
- 🎨 Colorful terminal output for better readability
- 🔍 Verbose mode for debugging

## Prerequisites

- Bash shell environment
- `curl` command-line tool
- `bc` command-line calculator
- Supabase project with storage bucket

## Installation

1. Download the script:
   ```bash
   curl -O https://raw.githubusercontent.com/justicemindsdev/supabase-file-upload/main/upload_video.sh
   ```

2. Make it executable:
   ```bash
   chmod +x upload_video.sh
   ```

3. (Optional) Move to a directory in your PATH for system-wide access:
   ```bash
   sudo mv upload_video.sh /usr/local/bin/upload_video
   ```

## Usage

```bash
./upload_video.sh [options] <file_path>
```

### Options

- `-h, --help`: Show help message
- `-f, --folder <folder>`: Specify target folder (default: video)
- `-n, --name <name>`: Specify custom filename (default: timestamp-originalname)
- `-p, --public`: Make the file publicly accessible
- `-v, --verbose`: Enable verbose output for debugging

### Examples

Basic usage:
```bash
./upload_video.sh my_video.mp4
```

Upload to a specific folder with a custom name:
```bash
./upload_video.sh -f marketing -n promo2025 my_video.mp4
```

Upload with public access and verbose output:
```bash
./upload_video.sh -p -v my_video.mp4
```

## Configuration

The script uses the following Supabase configuration:

```bash
SUPABASE_URL="https://tvecnfdqakrevzaeifpk.supabase.co"
SUPABASE_KEY="your-anon-key"
BUCKET_NAME="sites"
STORAGE_URL="https://tvecnfdqakrevzaeifpk.supabase.co/storage/v1/s3"
```

You can edit these values directly in the script if needed.

## Supported File Types

The script automatically detects and sets the appropriate content type for:
- MP4 (.mp4)
- QuickTime (.mov)
- AVI (.avi)
- WebM (.webm)
- Other file types will use "application/octet-stream"

## Troubleshooting

If you encounter issues:

1. Run with the `-v` (verbose) flag to see detailed output
2. Ensure your Supabase bucket exists and is properly configured
3. Check that your API key has the necessary permissions
4. Verify that the file exists and is readable

## License

MIT
