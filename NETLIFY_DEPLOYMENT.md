# Netlify Deployment Guide

This project has been configured for deployment to Netlify with instant static page loading.

## What Was Done

### 1. Netlify Configuration Files

- **netlify.toml**: Added build configuration with build command and publish directory
- **public/_redirects**: Added client-side routing support (redirects all routes to index.html)

### 2. Static HTML Snapshot

The `index.html` file now includes a hardcoded static version of your content that loads instantly while the React app initializes. This includes:

- **Hero Section**: Brand name, heading, and description
- **Project Packages**: Service offerings with pricing
- **Selected Work**: Your portfolio projects with images and details
- **Styling**: All content styled to match your dark theme design

The static content automatically hides once the React app is mounted.

### 3. Build Configuration

- Build command: `pnpm build`
- Publish directory: `dist`
- Redirects configured for SPA routing

### 4. Environment Variables

You'll need to set these in Netlify dashboard:

**Netlify Environment Variables:**
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_CLERK_DOMAIN`
- `VITE_CONVEX_URL`

**Convex Dashboard Variables:**
- `CLERK_APPLICATION_ID`
- `CLERK_PRIVATE_KEY`
- `CLERK_JWKS_URL`
- `CLERK_ISSUER_DOMAIN`

## Deployment Steps

### Option 1: Netlify Dashboard (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your Git repository
5. Build settings are pre-configured in `netlify.toml`
6. Add environment variables in Site settings → Environment variables
7. Click "Deploy site"

### Option 2: Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize site:
   ```bash
   netlify init
   ```

4. Deploy to production:
   ```bash
   pnpm build
   netlify deploy --prod
   ```

## Features

### Instant Page Load
The static HTML snapshot provides:
- Immediate content visibility
- Better SEO (search engines see content immediately)
- Improved perceived performance
- No blank screen during React initialization

### How It Works
1. User visits the site
2. Browser receives `index.html` with hardcoded content
3. Static content renders instantly (with styling)
4. React app loads in the background
5. Once React mounts, static content is hidden
6. Full interactive app is ready

## Updating Static Content

To update the hardcoded content in `index.html`:
1. Make changes in the static content section (between `<!-- Static content -->` comment)
2. Keep it in sync with your database content
3. Rebuild and redeploy

## Testing Locally

To test the production build locally:

```bash
pnpm build
pnpm preview
```

Visit `http://localhost:4173` to see the production build.

## Notes

- The static snapshot is based on the current content from your Convex database
- Update it manually when you make significant content changes
- Clerk and Convex configuration is handled separately (you mentioned you'll handle this)
- The build process compiles TypeScript and creates optimized production bundles

## Troubleshooting

If deployment fails:
1. Check build logs in Netlify dashboard
2. Verify environment variables are set correctly
3. Ensure `netlify.toml` is in included in your repository
4. Check that `pnpm build` completes successfully locally

