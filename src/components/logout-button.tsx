// // src\components\logout-button.tsx

// 'use client'

// import { useRouter } from 'next/navigation'

// import { createClient } from '@/lib/client'
// import { Button } from '@/components/ui/button'

// export function LogoutButton() {
//   const router = useRouter()

//   const logout = async () => {
//     const supabase = createClient()
//     await supabase.auth.signOut()
//     router.push('/')
//   }

//   return <Button onClick={logout}>Logout</Button>
// }



// src/components/logout-button.tsx

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'

interface LogoutButtonProps extends React.ComponentProps<typeof Button> {
  redirectTo?: string
}

export function LogoutButton({
  redirectTo = '/',
  children = 'Logout',
  variant = 'default',
  disabled,
  ...props
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error.message)
      }
      
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      console.error('Unexpected error during logout:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? 'Logging out...' : children}
    </Button>
  )
}