import { SignIn } from '@clerk/clerk-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium mb-2">Welcome to J.A.M Packed SD</h1>
          <p className="text-muted-foreground">Sign in to manage your portfolio</p>
        </div>
        <SignIn 
          appearance={{
            baseTheme: 'neobrutalism' as any,
            variables: {
              colorBackground: 'transparent',
              colorText: 'var(--foreground)',
              colorPrimary: 'var(--primary)',
              colorInputBackground: 'var(--input)',
              colorInputText: 'var(--foreground)',
            },
            elements: {
              headerTitle: "Sign in to JAM PACKED SD",
              headerSubtitle: "Welcome back! Please sign in to continue."
            }
          }}
        />
      </div>
    </div>
  )
}
