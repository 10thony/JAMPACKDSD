# J.A.M Packed SD - Vite Portfolio

This project has been migrated from Next.js to Vite for faster development and build times.

## Migration Changes

### Key Changes Made:
- ✅ Replaced Next.js with Vite as the build tool
- ✅ Migrated from Next.js App Router to React Router
- ✅ Updated Clerk from `@clerk/nextjs` to `@clerk/clerk-react`
- ✅ Converted environment variables from `NEXT_PUBLIC_*` to `VITE_*`
- ✅ Restructured project from `app/` directory to `src/` directory
- ✅ Updated TypeScript configuration for Vite
- ✅ Removed Next.js specific files and configurations

### Project Structure:
```
src/
├── components/          # React components
├── pages/              # Page components (routes)
├── styles/             # Global styles
├── App.tsx             # Main app component with routing
├── main.tsx            # Entry point
└── vite-env.d.ts       # Vite environment types
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   VITE_CONVEX_URL=your_convex_url_here
   ```

### Development
```bash
# Start Vite dev server
pnpm dev

# Start Convex backend (in separate terminal)
pnpm dev:convex
```

### Build
```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Environment Variables

### Frontend Variables (Client-side)
These variables are prefixed with `VITE_` and are exposed to the browser:

| Variable | Description |
|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication publishable key |
| `VITE_CLERK_DOMAIN` | Your Clerk application domain |
| `VITE_CONVEX_URL` | Convex backend URL |

### Backend Variables (Server-side)
These variables are used by Convex for authentication and are not exposed to the browser:

| Variable | Description |
|----------|-------------|
| `CLERK_APPLICATION_ID` | Clerk application ID |
| `CLERK_PRIVATE_KEY` | Clerk private/secret key |
| `CLERK_JWKS_URL` | Clerk JSON Web Key Set URL |
| `CLERK_ISSUER_DOMAIN` | Clerk JWT issuer domain |

## Features

- ⚡ **Vite** - Fast development server and build tool
- ⚛️ **React 19** - Latest React with concurrent features
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔐 **Clerk** - Authentication and user management
- 🗄️ **Convex** - Real-time backend
- 🧭 **React Router** - Client-side routing
- 📱 **Responsive Design** - Mobile-first approach
- ♿ **Accessibility** - WCAG compliant components

## Migration Notes

### What Changed:
1. **Routing**: File-based routing → React Router
2. **Environment Variables**: `NEXT_PUBLIC_*` → `VITE_*`
3. **Authentication**: `@clerk/nextjs` → `@clerk/clerk-react`
4. **Build Tool**: Next.js → Vite
5. **Project Structure**: `app/` → `src/`

### Benefits of Vite:
- ⚡ Faster development server startup
- 🔥 Instant Hot Module Replacement (HMR)
- 📦 Optimized production builds
- 🛠️ Better TypeScript support
- 🔧 More flexible configuration

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**
   - Ensure variables are prefixed with `VITE_`
   - Restart the dev server after adding new variables

2. **Import Errors**
   - Check that all imports use the `@/` alias correctly
   - Verify file paths in `src/` directory

3. **Clerk Authentication Issues**
   - Verify `VITE_CLERK_PUBLISHABLE_KEY` is set correctly
   - Check Clerk dashboard for correct domain configuration

4. **Convex Connection Issues**
   - Ensure `VITE_CONVEX_URL` is set correctly
   - Verify Convex deployment is running

## Support

For issues related to the migration or Vite setup, please check:
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Clerk React Documentation](https://clerk.com/docs/references/react)
- [Convex Documentation](https://docs.convex.dev/)
