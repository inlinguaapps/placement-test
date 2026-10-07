// //src\app\(admin)\dashboard\page.tsx

// import { ResultsTable } from '@/components/admin/ResultsTable'
// import { LogoutButton } from '@/components/logout-button'
// import { GraduationCap, ExternalLink } from 'lucide-react'
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
//           <div className="flex items-center gap-2">
//             <GraduationCap className="text-blue-600" size={24} />
//             <span className="font-bold text-xl tracking-tight">inlingua Admin</span>
//           </div>

//           <div className="flex items-center gap-4 sm:gap-6">
//             {/* Take Test / Home Link */}
//             <Link
//               href="/"
//               target="_blank"
//               className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
//             >
//               <span>Take Test</span>
//               <ExternalLink size={16} />
//             </Link>

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="sticky top-0 z-10 w-full border-b bg-white dark:bg-zinc-900 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={24} />
            <span className="font-bold text-xl tracking-tight">inlingua Admin</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Home Button with default shadcn styling */}
            <Button asChild>
              <Link href="/" target="_blank">
                Home
              </Link>
            </Button>

            <span className="hidden sm:inline text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{user.email}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Placement Test Results
          </h1>
          <p className="text-muted-foreground mt-1">
            Currently viewing:{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {isAdmin ? 'All Branches' : userBranch}
            </span>
          </p>
        </header>

        <ResultsTable branchFilter={isAdmin ? null : userBranch} />
      </main>
    </div>
  )
}