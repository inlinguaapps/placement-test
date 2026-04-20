'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function YoungLearnerForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')

  const handleStart = () => {
    // Keep the type as 'young' for the logic check,
    // but the URL will be user-friendly.
    router.push(`/test?type=young&name=${encodeURIComponent(name)}&age=${age}`)
  }

  return (
    <div className='flex flex-col flex-1 items-center justify-center p-6'>
      <div className='w-full max-w-xs space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>Young Learner Placement Test</h1>
          <p className='text-sm text-muted-foreground'>
            Please enter your name and age to begin.
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='name'>Full Name</Label>
          <Input
            id='name'
            placeholder='John Doe'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='age'>Age</Label>
          <Input
            id='age'
            type='number'
            placeholder='e.g. 8'
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <Button
          className='w-full h-11'
          onClick={handleStart}
          disabled={!name || !age}
        >
          Start Test
        </Button>
      </div>
    </div>
  )
}
