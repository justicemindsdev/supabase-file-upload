# Supabase File Upload System

A modern file upload system built with Next.js and Supabase Storage, featuring a sleek UI with Tailwind CSS.

## Features

- 🚀 Fast file uploads to Supabase Storage
- 📁 Automatic file organization by type
- 📊 Upload history tracking
- 🔍 Search and filter uploaded files
- 🎨 Modern UI with Tailwind CSS
- 🌙 Dark mode design with grid background
- 📱 Responsive layout for all devices

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Supabase CLI (for bucket management)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/supabase-file-upload.git
cd supabase-file-upload
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Create the storage bucket using Supabase CLI

Install the Supabase CLI if you haven't already:

```bash
npm install -g supabase
```

Login to your Supabase account:

```bash
supabase login
```

Link your project:

```bash
supabase link --project-ref your-project-reference-id
```

Create the storage bucket:

```bash
supabase storage create sites --public
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Click the "Choose a file" button to select a file from your device
2. Click the "Upload" button to upload the file to Supabase Storage
3. View upload progress and status
4. Click "View Upload History" to see all uploaded files
5. Use the search box to filter files by name, folder, or type

## File Organization

Files are automatically organized into folders based on their file type:

- 📄 Documents: pdf, doc, docx, txt, rtf
- 📊 Spreadsheets: csv, xls, xlsx
- 🌐 Web: html, htm, css, js, jsx, tsx
- 🖼️ Images: jpg, jpeg, png, gif, svg, webp
- 🎵 Audio: mp3, wav, ogg, m4a
- 🎬 Video: mp4, mov, avi, webm
- 💻 Code: json, xml, py, java, c, cpp, cs, php, rb, go, rs, ts
- 📦 Archives: zip, rar, tar, gz, 7z
- 📝 Other: any other file types

## Supabase Storage Bucket Configuration

For proper functionality, ensure your Supabase storage bucket is configured correctly:

1. Create the bucket (if not already done):
   ```bash
   supabase storage create sites --public
   ```

2. Update bucket settings to make it public:
   ```bash
   supabase storage update bucket sites --public=true
   ```

3. Set CORS configuration:
   ```bash
   supabase storage cors add '*' 'GET,POST,PUT,DELETE,OPTIONS' '*' '86400'
   ```

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── globals.css       # Global styles with Tailwind
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Home page component
├── components/           # React components
│   ├── FileUploader.tsx  # File upload component
│   └── UploadHistory.tsx # Upload history component
├── utils/                # Utility functions
│   └── supabase/         # Supabase client utilities
│       └── client.ts     # Supabase client configuration
├── public/               # Static assets
├── .env.local            # Environment variables
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Troubleshooting

### Storage Bucket Issues

If you encounter issues with the storage bucket:

1. Verify the bucket exists:
   ```bash
   supabase storage list buckets
   ```

2. Check bucket permissions:
   ```bash
   supabase storage get bucket sites
   ```

3. Ensure your Supabase URL and anon key are correct in `.env.local`

### Upload Errors

If file uploads fail:

1. Check browser console for specific error messages
2. Verify file size is within limits (default is 50MB)
3. Ensure your Supabase project has enough storage quota
4. Check network tab in browser dev tools for API response details

## License

MIT
