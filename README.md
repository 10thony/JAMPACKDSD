# J.A.M Packed SD

A modern portfolio website for J.A.M Packed SD - professional web development and design services based in San Diego.

## About J.A.M Packed SD

Professional web development and design services specializing in crafting digital experiences with precision and care. Based in San Diego, we build accessible, pixel-perfect digital experiences for the web using modern web technologies and thoughtful design systems.

## Tech Stack

- **Build Tool**: Vite
- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Backend**: Convex (real-time database and serverless functions)
- **Authentication**: Clerk (user management and authentication)
- **Package Manager**: pnpm
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up Convex:
   ```bash
   npx convex dev --configure
   ```

4. Set up Clerk authentication:
   - Get your Clerk keys from the [Clerk Dashboard](https://dashboard.clerk.com)
   - Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```
   - Add your Clerk keys to `.env.local`:
   ```env
   # Frontend variables (exposed to client)
   VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
   VITE_CLERK_DOMAIN=your_clerk_domain
   
   # Backend variables (for Convex)
   CLERK_APPLICATION_ID=your_application_id
   CLERK_PRIVATE_KEY=your_private_key
   CLERK_JWKS_URL=your_jwks_url
   CLERK_ISSUER_DOMAIN=your_issuer_domain
   
   # Convex
   VITE_CONVEX_URL=your_convex_url
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `pnpm dev` - Start Vite development server
- `pnpm dev:convex` - Start Convex development server (run in separate terminal)
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint

### Project Structure

```
├── src/
│   ├── components/     # React components
│   │   ├── ui/        # shadcn/ui components
│   │   └── ...        # Custom components
│   ├── pages/         # Page components (routes)
│   ├── lib/           # Utility functions
│   ├── hooks/         # Custom React hooks
│   ├── styles/        # Global styles
│   ├── App.tsx        # Main app component with routing
│   └── main.tsx       # Entry point
├── convex/            # Convex backend functions and schema
├── public/            # Static assets
└── dist/              # Build output
```

### Environment Variables

Create a `.env.local` file in the root directory (or copy from `env.example`):

```env
# Frontend variables (prefixed with VITE_ to be exposed to client)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_CLERK_DOMAIN=your_clerk_domain
VITE_CONVEX_URL=https://your-convex-url.convex.cloud

# Backend variables (for Convex integration with Clerk)
CLERK_APPLICATION_ID=your_clerk_application_id
CLERK_PRIVATE_KEY=your_clerk_private_key
CLERK_JWKS_URL=your_clerk_jwks_url
CLERK_ISSUER_DOMAIN=your_clerk_issuer_domain
```

**Note**: In Vite, only environment variables prefixed with `VITE_` are exposed to the client-side code. Backend variables (without the prefix) are used by Convex for server-side authentication.

## Features

- Professional web development and design services
- Responsive design optimized for all devices
- Dark/light theme support
- Modern UI components with shadcn/ui
- TypeScript support for type safety
- ESLint configuration for code quality
- Tailwind CSS for modern styling
- San Diego-based professional services
- Real-time database with Convex
- Serverless backend functions
- Admin panel for project management
- Secure authentication with Clerk
- Protected admin routes
- User management and sign-in/sign-up

## Deployment

### Netlify Deployment

This project is configured for easy deployment to Netlify.

#### Prerequisites

- Netlify account
- GitHub/GitLab/Bitbucket repository (optional, can deploy directly)

#### Deploy via Netlify CLI

1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize Netlify in your project:
   ```bash
   netlify init
   ```

4. Deploy to production:
   ```bash
   pnpm build
   netlify deploy --prod
   ```

#### Deploy via Netlify Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Configure build settings:
   - **Build command**: `pnpm build`
   - **Publish directory**: `dist`
6. Add environment variables in Netlify dashboard (same as `.env.local`)
7. Click "Deploy site"

#### Environment Variables on Netlify

Set the following environment variables in Netlify Dashboard → Site settings → Environment variables:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_CLERK_DOMAIN`
- `VITE_CONVEX_URL`

For Convex backend variables (used by Convex, not Netlify):
- Set these in your Convex dashboard

#### Static Site Features

The project includes a hardcoded static HTML snapshot that loads instantly while the React app loads. This provides:

- Instant page load for better SEO
- Improved perceived performance
- Fallback content during app initialization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `pnpm lint`
5. Submit a pull request
