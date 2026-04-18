'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import AdultTest from '@/components/tests/AdultTest'
import KgTest from '@/components/tests/KGTest'
import PathomTest from '@/components/tests/PathomTest'
import MattayomTest from '@/components/tests/MatthayomTest'
import { Button } from '@/components/ui/button'

function TestEngine() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const name = searchParams.get('name') || 'Guest'
  const age = Number(searchParams.get('age')) // Converts string "3" to number 3

  // 1. HANDLE ADULT PATH
  if (type === 'adult') {
    return <AdultTest name={name} />
  }

  // 2. HANDLE YOUNG LEARNER PATH
  if (type === 'young') {
    if (age >= 0 && age <= 5) {
      return <KgTest name={name} />
    }
    if (age >= 6 && age <= 11) {
      return <PathomTest name={name} />
    }
    if (age >= 12 && age <= 18) {
      return <MattayomTest name={name} />
    }

    // Fallback for ages outside 3-18
    return (
      <div className='text-center p-10'>
        Students aged over 18 should take the Adult Placement Test.
      </div>
    )
  }

  // 3. EMERGENCY FALLBACK (If URL is messed up)
  return (
    <div className='text-center p-10'>
      <p>Invalid test type selected.</p>
      <Button onClick={() => (window.location.href = '/')}>Go Back</Button>
    </div>
  )
}

export default function TestPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-50 dark:bg-black'>
      <div className='w-full max-w-3xl bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border'>
        <Suspense fallback={<div>Loading Test...</div>}>
          <TestEngine />
        </Suspense>
      </div>
    </div>
  )
}
