// src\app\(student)\young-learner\YoungLearnerFormClient.tsx

'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function YoungLearnerFormClient({
  branches,
}: {
  branches: string[]
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [branch, setBranch] = useState('')

  const handleStart = () => {
    const params = new URLSearchParams({
      type: 'young',
      name,
      age,
      branch,
    })
    router.push(`/test?${params.toString()}`)
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

        <div className='space-y-2'>
          <Label htmlFor='branch'>Branch</Label>
          <select
            id='branch'
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className='flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            <option value=''>Select a branch...</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <Button
          className='w-full h-11'
          onClick={handleStart}
          disabled={!name || !age || !branch}
        >
          Start Test
        </Button>
      </div>
    </div>
  )
}
