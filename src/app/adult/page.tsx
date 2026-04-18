'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdultFormPage() {
  const router = useRouter()
  const [name, setName] = useState('')

  const handleStart = () => {
    // Send to test page with type 'adult'
    // encodeURIComponent handles spaces or special characters in names
    router.push(`/test?type=adult&name=${encodeURIComponent(name)}`)
  }

  return (
    <div className='flex flex-col flex-1 items-center justify-center p-6 min-h-screen bg-zinc-50 dark:bg-black'>
      <div className='w-full max-w-xs space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>Adult Placement Test</h1>
          <p className='text-sm text-muted-foreground'>
            Please enter your name to begin.
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='name'>Full Name</Label>
          <Input
            id='name'
            placeholder='e.g. Somchai Dee'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='h-11'
          />
        </div>

        <Button
          className='w-full h-11'
          onClick={handleStart}
          disabled={!name.trim()}
        >
          Start Test
        </Button>
      </div>
    </div>
  )
}
