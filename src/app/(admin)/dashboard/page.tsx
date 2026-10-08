

// //src\app\(admin)\dashboard\page.tsx

// import { ResultsTable } from '@/components/admin/ResultsTable'
// import { LogoutButton } from '@/components/logout-button'
// import { Button } from '@/components/ui/button'
// import { GraduationCap } from 'lucide-react'
// import { createClient } from '@/lib/server'
// import { redirect } from 'next/navigation'
// import Link from 'next/link'

// export default async function DashboardPage() {
//   const supabase = await createClient()

//   // 1. Fetch Auth User & Profile
//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) redirect('/login')

//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('role, branch_name')
//     .eq('id', user.id)
//     .single()

//   const isAdmin = profile?.role === 'admin'
//   const userBranch = profile?.branch_name

//   // 2. Strict Branch Check for Non-Admins
//   if (!isAdmin && !userBranch) {
//     throw new Error('Access Denied: No branch assigned to this account.')
//   }

//   return (
//     <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
//       <nav className="sticky top-0 z-10 w-full border-b bg-white dark:bg-zinc-900 px-4 sm:px-8">
//         <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
//           {/* Left Navigation Section: Logo Title + Home Button */}
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <GraduationCap className="text-blue-600" size={24} />
//               <span className="font-bold text-xl tracking-tight">inlingua Admin</span>
//             </div>

//             <Button asChild>
//               <Link href="/" target="_blank">
//                 Home
//               </Link>
//             </Button>
//           </div>

//           {/* Right Navigation Section: User Greeting + Logout */}
//           <div className="flex items-center gap-4 sm:gap-6">
//             <span className="hidden sm:inline text-sm text-muted-foreground">
//               Welcome, <span className="font-medium text-foreground">{user.email}</span>
//             </span>
//             <LogoutButton />
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
//         <header>
//           <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
//             Placement Test Results
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Currently viewing:{' '}
//             <span className="font-semibold text-zinc-900 dark:text-zinc-100">
//               {isAdmin ? 'All Branches' : userBranch}
//             </span>
//           </p>
//         </header>

//         <ResultsTable branchFilter={isAdmin ? null : userBranch} />
//       </main>
//     </div>
//   )
// }

//src\app\(admin)\dashboard\page.tsx

import { ResultsTable } from '@/components/admin/ResultsTable'
import { LogoutButton } from '@/components/logout-button'
import { Button } from '@/components/ui/button'
import { GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Fetch Auth User & Profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_name')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const userBranch = profile?.branch_name

  // 2. Strict Branch Check for Non-Admins
  if (!isAdmin && !userBranch) {
    throw new Error('Access Denied: No branch assigned to this account.')
  }

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <nav className="sticky top-0 z-10 w-full border-b bg-white dark:bg-zinc-900 px-3 sm:px-8">
        <div className="max-w-7xl mx-auto h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Left Navigation Section: Logo Title + Home Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <GraduationCap className="text-blue-600 shrink-0 h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-bold text-base sm:text-xl tracking-tight truncate">
                inlingua Admin
              </span>
            </div>

            <Button asChild size="sm" variant="outline" className="h-8 text-xs sm:h-9 sm:text-sm px-2.5 sm:px-3">
              <Link href="/" target="_blank">
                Home
              </Link>
            </Button>
          </div>

          {/* Right Navigation Section: User Greeting + Logout */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <span className="hidden sm:inline text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] lg:max-w-none">
              Welcome, <span className="font-medium text-foreground">{user.email}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            Placement Test Results
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Currently viewing:{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {isAdmin ? 'All Branches' : userBranch}
            </span>
          </p>
        </header>

        <div className="w-full overflow-x-auto">
          <ResultsTable branchFilter={isAdmin ? null : userBranch} />
        </div>
      </main>
    </div>
  )
}