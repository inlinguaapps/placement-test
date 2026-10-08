// // src\app\(student)\page.tsx

// import Link from 'next/link'
// import Image from 'next/image'
// import { Button } from '@/components/ui/button'
// import { Lock } from 'lucide-react'

// export default function SelectionPage() {
//   return (
//     <div className="flex flex-col min-h-screen bg-blue-400 text-zinc-900">
//       {/* Main Content */}
//       <div className="flex flex-col flex-1 items-center justify-center p-6 w-full max-w-lg mx-auto">
//         <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-[3/1] mb-6 flex justify-center">
//           <Image
//             src="/inlingua.png"
//             alt="inlingua Logo"
//             fill
//             priority
//             sizes="(max-width: 640px) 280px, 340px"
//             className="object-contain"
//           />
//         </div>

//         <h1 className="text-3xl font-bold mb-2 text-center text-slate-900">
//           Placement Test
//         </h1>
//         <p className="text-slate-800 mb-8 text-center font-medium">
//           Please select your test track
//         </p>

//         <div className='flex flex-col sm:flex-row gap-4 w-full max-w-[450px]'>
//           <Link href='/young-learner' className='flex-1'>
//             <Button className='w-full h-16 text-lg border-2' variant='outline'>
//               Young Learner
//             </Button>
//           </Link>

//           <Link href='/adult' className='flex-1'>
//             <Button className='w-full h-16 text-lg border-2' variant='outline'>
//               Adult
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* Staff Footer */}
//       <footer className="p-6 flex justify-center">
//         <Link
//           href="/dashboard"
//           className="flex items-center gap-2 text-xs text-slate-800 hover:text-slate-950 font-medium transition-colors"
//         >
//           <Lock size={12} />
//           Staff Login
//         </Link>
//       </footer>
//     </div>
//   )
// }

// // src\app\(student)\page.tsx

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export default function SelectionPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-blue-400 text-slate-900">
      {/* Main Content */}
      <main className="flex flex-col flex-1 items-center justify-center p-4 sm:p-6 w-full max-w-lg mx-auto py-8">
        <div className="relative w-full max-w-[240px] xs:max-w-[280px] sm:max-w-[340px] aspect-[3/1] mb-6 flex justify-center">
          <Image
            src="/inlingua.png"
            alt="inlingua Logo"
            fill
            priority
            sizes="(max-width: 640px) 280px, 340px"
            className="object-contain"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-slate-900">
          Placement Test
        </h1>
        <p className="text-sm sm:text-base text-slate-800 mb-8 text-center font-medium">
          Please select your test track
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-[450px]">
          <Link href="/young-learner" className="flex-1 w-full">
            <Button
              className="w-full h-14 sm:h-16 text-base sm:text-lg border-2 bg-white/90 hover:bg-white text-slate-900 border-slate-300 font-semibold shadow-sm"
              variant="outline"
            >
              Young Learner
            </Button>
          </Link>

          <Link href="/adult" className="flex-1 w-full">
            <Button
              className="w-full h-14 sm:h-16 text-base sm:text-lg border-2 bg-white/90 hover:bg-white text-slate-900 border-slate-300 font-semibold shadow-sm"
              variant="outline"
            >
              Adult
            </Button>
          </Link>
        </div>
      </main>

      {/* Staff Footer */}
      <footer className="p-4 sm:p-6 flex justify-center">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs sm:text-sm text-slate-800 hover:text-slate-950 font-medium transition-colors py-2 px-3 rounded-md hover:bg-black/5"
        >
          <Lock size={14} />
          Staff Login
        </Link>
      </footer>
    </div>
  )
}