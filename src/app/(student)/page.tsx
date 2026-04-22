// src\app\(student)\page.tsx

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap, Lock } from 'lucide-react'

export default function SelectionPage() {
  return (
    <div className='flex flex-col min-h-screen'>
      {/* Main Content */}
      <div className='flex flex-col flex-1 items-center justify-center p-6'>
        <div className='bg-blue-600 p-3 rounded-2xl text-white mb-6'>
          <GraduationCap size={32} />
        </div>

        <h1 className='text-3xl font-bold mb-2 text-center'>
          inlingua Placement Test
        </h1>
        <p className='text-muted-foreground mb-8 text-center'>
          Please select your test track
        </p>

        <div className='flex flex-col sm:flex-row gap-4 w-full max-w-[450px]'>
          <Link href='/young-learner' className='flex-1'>
            <Button className='w-full h-16 text-lg border-2' variant='outline'>
              Young Learner
            </Button>
          </Link>

          <Link href='/adult' className='flex-1'>
            <Button className='w-full h-16 text-lg border-2' variant='outline'>
              Adult
            </Button>
          </Link>
        </div>
      </div>

      {/* Subtle Staff Footer */}
      <footer className='p-6 flex justify-center'>
        <Link
          href='/dashboard'
          className='flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-600 transition-colors'
        >
          <Lock size={12} />
          Staff Login
        </Link>
      </footer>
    </div>
  )
}
