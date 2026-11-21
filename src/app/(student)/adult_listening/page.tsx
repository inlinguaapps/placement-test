// src/app/(student)/adult_listening/page.tsx

import Link from 'next/link'
import { getSessionData, getAdultListeningQuestions } from '@/app/actions'
import AdultListeningTestController from '@/components/test/AdultListeningTestController'
import { Button } from '@/components/ui/button'

export default async function AdultListeningPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>
}) {
  const { sessionId } = await searchParams
  const session = sessionId ? await getSessionData(sessionId) : null

  if (!session) {
    const isMissing = !sessionId
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-xl font-bold mb-2">
          {isMissing ? 'Session Missing' : 'Test Not Found'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isMissing
            ? 'Please start the test from the selection page.'
            : "We couldn't retrieve your session data."}
        </p>
        <Button variant="outline" asChild>
          <Link href="/">{isMissing ? 'Return to Home' : 'Start New Test'}</Link>
        </Button>
      </div>
    )
  }

  const { listening, reading } = await getAdultListeningQuestions()

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-20 md:pt-24 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-4xl">
        <AdultListeningTestController
          sessionId={session.sessionId}
          listeningQuestions={listening}
          readingQuestions={reading}
        />
      </div>
    </div>
  )
}