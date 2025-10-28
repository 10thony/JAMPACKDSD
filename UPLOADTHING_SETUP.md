# UploadThing Setup Guide

This project uses UploadThing for direct image uploads in the portfolio manager.

## Environment Variables Required

Add this to your `.env.local` file:

```env
VITE_UPLOADTHING_TOKEN=your_uploadthing_api_key_here
```

## Getting Your UploadThing API Key

1. **Sign up for UploadThing**
   - Visit [uploadthing.com](https://uploadthing.com)
   - Create an account or sign in

2. **Create a New App**
   - In the dashboard, click "Create New App" or select an existing app
   - Give your app a name (e.g., "My Portfolio")

3. **Get Your API Key**
   - Go to your app's **API Keys** section in the dashboard
   - Copy the **Secret Key** or create a new one
   - Paste it as `VITE_UPLOADTHING_TOKEN` in your `.env.local` file

   **Important:** This is your secret API key. Keep it secure and never commit it to version control.

## No Additional Configuration Needed

Unlike traditional UploadThing setups that require backend routes:
- ✅ This implementation uses UploadThing's direct API
- ✅ No file routes needed
- ✅ No backend server required
- ✅ Works perfectly with Vite + Convex

## How It Works

The image uploader in this project:

- **Supports two methods:**
  - Direct file upload via UploadThing
  - URL input for externally hosted images

- **File validation:**
  - Only accepts image formats (JPG, PNG, GIF, WebP)
  - Maximum file size: 4MB

- **Used in:**
  - Adding new projects (FloatingAddProject)
  - Editing existing projects (EditProjectDialog)

## Restart Development Server

After adding the environment variables, restart your development server:

```bash
pnpm dev
```

## Testing

1. Sign in with your authorized account
2. Click the "+" button to add a new project
3. Use the "Upload File" tab to upload an image directly
4. Or use the "Use URL" tab to provide an image URL
5. The preview will show immediately after upload/URL entry

