// src\app\(admin)\dashboard\page.tsx

import { ResultsTable } from '@/components/admin/ResultsTable'
import { LogoutButton } from '@/components/logout-button'
import { GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Get the Auth User
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 2. Get the Profile Data (Role & Branch) from the database
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_name')
    .eq('id', user?.id)
    .single()

  // 3. Strict Role & Branch Logic
  // Default to 'branch_user' to match your DB column default
  const userRole = profile?.role || 'branch_user'
  let userBranch = ''

  if (userRole === 'admin') {
    // Admins always see "All Branches" label regardless of DB content
    userBranch = 'All Branches'
  } else {
    // Branch users MUST have a branch assigned or the page throws an error
    if (!profile?.branch_name) {
      throw new Error('Access Denied: No branch assigned to this account.')
    }
    userBranch = profile.branch_name
  }

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950'>
      <nav className='sticky top-0 z-10 w-full border-b bg-white dark:bg-zinc-900 px-4 sm:px-8'>
        <div className='max-w-7xl mx-auto h-16 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <GraduationCap className='text-blue-600' size={24} />
            <span className='font-bold text-xl tracking-tight'>
              inlingua Admin
            </span>
          </div>

          <div className='flex items-center gap-6'>
            <span className='hidden sm:inline text-sm text-muted-foreground'>
              Welcome,{' '}
              <span className='font-medium text-foreground'>{user?.email}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className='max-w-7xl mx-auto p-4 sm:p-8 space-y-6'>
        <header>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
            Placement Test Results
          </h1>
          <p className='text-muted-foreground mt-1'>
            Currently viewing:{' '}
            <span className='font-semibold text-zinc-900 dark:text-zinc-100'>
              {userBranch}
            </span>
          </p>
        </header>

        {/* 
            Filter Logic:
            - Admin: branchFilter is null (fetches everything)
            - Branch User: branchFilter is their specific branch name
        */}
        <ResultsTable branchFilter={userRole === 'admin' ? null : userBranch} />
      </main>
    </div>
  )
}
