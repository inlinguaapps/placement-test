// // src/app/(student)/test/page.tsx

import { getSessionData } from '@/app/actions'
import AdaptiveTestController from '@/components/test/AdaptiveTestController'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function TestPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>
}) {
  const { sessionId } = await searchParams

  if (!sessionId) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-6 text-center'>
        <h1 className='text-xl font-bold mb-2'>Session Missing</h1>
        <p className='text-muted-foreground mb-6'>
          Please start the test from the selection page.
        </p>
        <Link href='/'>
          <Button variant='outline'>Return to Home</Button>
        </Link>
      </div>
    )
  }

  const session = await getSessionData(sessionId)

  if (!session) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-6 text-center'>
        <h1 className='text-xl font-bold mb-2'>Test Not Found</h1>
        <p className='text-muted-foreground mb-6'>
          We couldn&apos;t retrieve your session data.
        </p>
        <Link href='/'>
          <Button variant='outline'>Start New Test</Button>
        </Link>
      </div>
    )
  }

  return (
    /**
     * FIX: Changed 'justify-center' to 'justify-start' and added 'pt-12 md:pt-20'
     * This keeps the container top-anchored so it doesn't snap vertically
     * when the question content height changes.
     */
    <div className='flex flex-col items-center justify-start min-h-screen p-4 pt-20 md:pt-25 bg-zinc-50 dark:bg-black'>
      <div className='w-full max-w-2xl'>
        <AdaptiveTestController initialSession={session} />
      </div>
    </div>
  )
}
