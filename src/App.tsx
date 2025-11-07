import { Routes, Route } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { ConvexClientProvider } from './components/convex-provider'
import { SecretCellProvider } from './contexts/secret-cell-context'
import { SettingsProvider } from './contexts/settings-context'
import Home from './pages/Home'
import Admin from './pages/Admin'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

// Get Clerk environment variables
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const clerkDomain = import.meta.env.VITE_CLERK_DOMAIN

if (!clerkPublishableKey) {
  throw new Error('Missing Clerk Publishable Key')
}

function App() {
  const clerkProps: any = {
    publishableKey: clerkPublishableKey,
  }
  if (clerkDomain) {
    clerkProps.domain = clerkDomain
  }
  
  return (
    <ClerkProvider {...clerkProps}>
      <ConvexClientProvider>
        <SettingsProvider>
          <SecretCellProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/sign-in/*" element={<SignIn />} />
              <Route path="/sign-up/*" element={<SignUp />} />
            </Routes>
          </SecretCellProvider>
        </SettingsProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  )
}

export default App
