// // src\app\(student)\adult\AdultFormClient.tsx

// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'

// export default function AdultFormClient({ branches }: { branches: string[] }) {
//   const router = useRouter()
//   const [name, setName] = useState('')
//   const [branch, setBranch] = useState('')

//   const handleStart = () => {
//     const params = new URLSearchParams({
//       type: 'adult',
//       name: name.trim(),
//       branch: branch,
//     })
//     router.push(`/test?${params.toString()}`)
//   }

//   return (
//     <div className='flex flex-col flex-1 items-center justify-center p-6 min-h-screen bg-zinc-50 dark:bg-black'>
//       <div className='w-full max-w-xs space-y-6'>
//         <div className='space-y-2 text-center'>
//           <h1 className='text-2xl font-bold'>Adult Placement Test</h1>
//           <p className='text-sm text-muted-foreground'>
//             Please enter your name and select your branch.
//           </p>
//         </div>

//         <div className='space-y-2'>
//           <Label htmlFor='name'>Full Name</Label>
//           <Input
//             id='name'
//             placeholder='e.g. Somchai Dee'
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className='h-11'
//           />
//         </div>

//         <div className='space-y-2'>
//           <Label htmlFor='branch'>Study Location</Label>
//           <select
//             id='branch'
//             value={branch}
//             onChange={(e) => setBranch(e.target.value)}
//             className='flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
//           >
//             <option value=''>Select a branch...</option>
//             {branches.map((b) => (
//               <option key={b} value={b}>
//                 {b}
//               </option>
//             ))}
//           </select>
//         </div>

//         <Button
//           className='w-full h-11'
//           onClick={handleStart}
//           disabled={!name.trim() || !branch}
//         >
//           Start Test
//         </Button>
//       </div>
//     </div>
//   )
// }

// src\app\(student)\adult\AdultFormClient.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { initializeTestSession } from '@/app/actions' // Import the action

export default function AdultFormClient({ branches }: { branches: string[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [branch, setBranch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStart = async () => {
    setIsSubmitting(true)
    try {
      // 1. Initialize session here, not in the next page's server component
      const session = await initializeTestSession({
        name: name.trim(),
        age: 0, // Adult default
        category: 'Adult',
        branch: branch,
      })

      // 2. Pass the created session ID to the test page via URL
      // This prevents the TestPage from re-running initializeTestSession on every render
      router.push(`/test?sessionId=${session.sessionId}`)
    } catch (error) {
      console.error('Failed to start session:', error)
      alert('System error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex flex-col flex-1 items-center justify-center p-6 min-h-screen bg-zinc-50 dark:bg-black'>
      <div className='w-full max-w-xs space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>Adult Placement Test</h1>
          <p className='text-sm text-muted-foreground'>
            Please enter your name and select your branch.
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='name'>Full Name</Label>
          <Input
            id='name'
            placeholder='e.g. Somchai Dee'
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className='h-11'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='branch'>Study Location</Label>
          <select
            id='branch'
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            disabled={isSubmitting}
            className='flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
          disabled={!name.trim() || !branch || isSubmitting}
        >
          {isSubmitting ? 'Starting...' : 'Start Test'}
        </Button>
      </div>
    </div>
  )
}
