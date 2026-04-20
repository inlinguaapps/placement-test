import { ResultsTable } from '@/components/admin/ResultsTable'
import { Button } from '@/components/ui/button'
import { LogOut, FileSpreadsheet, GraduationCap } from 'lucide-react'

export default function DashboardPage() {
  // Mock session data
  const user = { role: 'admin', branch: 'All Branches' }

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950'>
      {/* 1. Simple Top Navigation */}
      <nav className='sticky top-0 z-10 w-full border-b bg-white dark:bg-zinc-900 px-4 sm:px-8'>
        <div className='max-w-7xl mx-auto h-16 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <GraduationCap className='text-blue-600' size={24} />
            <span className='font-bold text-xl tracking-tight'>
              inlingua Admin
            </span>
          </div>

          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              className='hidden sm:flex gap-2 text-muted-foreground'
            >
              <FileSpreadsheet size={18} />
              Export
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='text-red-600 hover:bg-red-50 hover:text-red-700 gap-2'
            >
              <LogOut size={18} />
              <span className='hidden sm:inline'>Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      <main className='max-w-7xl mx-auto p-4 sm:p-8 space-y-6'>
        <header>
          <h1 className='text-2xl sm:text-3xl font-bold'>Placement Results</h1>
          <p className='text-muted-foreground text-sm sm:text-base'>
            Currently viewing:{' '}
            <span className='font-semibold text-zinc-900 dark:text-zinc-100'>
              {user.branch}
            </span>
          </p>
        </header>

        {/* The Results Table Component */}
        <ResultsTable
          branchFilter={user.role === 'admin' ? null : user.branch}
        />
      </main>
    </div>
  )
}
