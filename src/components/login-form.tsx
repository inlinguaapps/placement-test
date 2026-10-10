// src/components/login-form.tsx

'use client'

import React, { useState } from 'react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Triggers a full page request carrying fresh session cookies to /dashboard
      window.location.href = '/dashboard'
      // NOTE: We do NOT call setIsLoading(false) here, so the button stays 
      // in its "Logging in..." state while the browser navigates away.
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsLoading(false) // Only reset loading state if an error happened
    }
  }

  return (
    <div className={cn('flex flex-col gap-6 w-full max-w-sm sm:max-w-md mx-auto', className)} {...props}>
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="p-5 sm:p-6 pb-2 sm:pb-4 text-center sm:text-left">
          <CardTitle className="text-xl sm:text-2xl font-bold">Login</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 pt-0">
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(error)}
                  className="h-12 sm:h-10 text-base sm:text-sm"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(error)}
                  className="h-12 sm:h-10 text-base sm:text-sm"
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-red-500 text-center sm:text-left" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full h-12 sm:h-10 text-base sm:text-sm font-semibold" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}