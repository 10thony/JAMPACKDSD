import { SignUp } from '@clerk/clerk-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium mb-2">Join J.A.M Packed SD</h1>
          <p className="text-muted-foreground">Create an account to get started</p>
        </div>
        <SignUp 
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
              headerTitle: "Sign up for JAM PACKED SD",
              headerSubtitle: "Create your account to get started."
            }
          }}
        />
      </div>
    </div>
  )
}
