'use client'

import { Button } from '@/components/ui/button'

interface Book {
  id: string
  name: string
  inlingua_level: number | null
}

interface TestCompletionViewProps {
  testType: string
  recommendedBooks: Book[]
  onFinish: () => void
}

export function TestCompletionView({
  testType,
  recommendedBooks,
  onFinish,
}: TestCompletionViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6 max-w-md mx-auto px-4">
      <h2 className="text-3xl font-bold">Test Complete!</h2>

      {recommendedBooks.length > 0 && (
        <div className="w-full p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-left space-y-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Recommended Coursebooks ({testType})
          </h3>
          <ul className="space-y-2.5">
            {recommendedBooks.map((book) => (
              <li
                key={book.id}
                className="flex items-center justify-between text-zinc-800 font-medium text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">📖</span>
                  <span>{book.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-zinc-500 text-sm text-balance">
        Your results have been recorded. Our team will review your score shortly.
      </p>

      <Button size="lg" className="w-full" onClick={onFinish}>
        Finish
      </Button>
    </div>
  )
}