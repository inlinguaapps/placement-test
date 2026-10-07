// // // src\components\admin\ResultsTable.tsx

// 'use client'

// import { useState, useMemo, useEffect } from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '@/components/ui/tooltip'
// import {
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   ArrowUpDown,
//   ArrowUp,
//   ArrowDown,
//   Loader2,
//   Trash2,
// } from 'lucide-react'
// import { createClient } from '@/lib/client'
// import { deleteTestResult } from '@/app/actions'

// interface QuestionHistoryItem {
//   level: string
//   correct: boolean
// }

// interface TestResult {
//   id: string
//   student_name: string
//   test_type: 'Adult' | 'Mathayom' | 'Prathom' | 'KG'
//   age: number | null
//   branch_name: string
//   final_result: string
//   created_at: string
//   status?: string | null
//   started_at_level?: string | null
//   question_history: QuestionHistoryItem[] | null
// }

// type SortField =
//   | 'student_name'
//   | 'test_type'
//   | 'age'
//   | 'branch_name'
//   | 'final_result'
//   | 'created_at'

// type SortOrder = 'asc' | 'desc'

// interface ResultsTableProps {
//   branchFilter?: string | null
// }

// export function ResultsTable({ branchFilter }: ResultsTableProps) {
//   const supabase = useMemo(() => createClient(), [])
//   const [data, setData] = useState<TestResult[]>([])
//   const [loading, setLoading] = useState(true)
//   const [deletingId, setDeletingId] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [currentPage, setCurrentPage] = useState(1)
//   const [sortField, setSortField] = useState<SortField>('created_at')
//   const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
//   const [itemsPerPage, setItemsPerPage] = useState(10)

//   useEffect(() => {
//     async function fetchResults() {
//       setLoading(true)
//       let query = supabase.from('test_results').select('*')
//       if (branchFilter) {
//         query = query.eq('branch_name', branchFilter)
//       }
//       query = query.order('created_at', { ascending: false })
//       const { data: results, error } = await query.returns<TestResult[]>()

//       if (!error && results) {
//         setData(results)
//       }
//       setLoading(false)
//     }
//     fetchResults()
//   }, [branchFilter, supabase])

//   const handleDelete = async (id: string) => {
//     const confirmed = window.confirm(
//       'Are you sure you want to delete this test result? This action cannot be undone.'
//     )
//     if (!confirmed) return

//     try {
//       setDeletingId(id)
//       await deleteTestResult(id)
//       setData((prev) => prev.filter((item) => item.id !== id))
//     } catch {
//       alert('Failed to delete the result. Please try again.')
//     } finally {
//       setDeletingId(null)
//     }
//   }

//   const handleSort = (field: SortField) => {
//     if (sortField === field) {
//       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
//     } else {
//       setSortField(field)
//       setSortOrder('asc')
//     }
//   }

//   const processedData = useMemo(() => {
//     const s = searchTerm.trim().toLowerCase()

//     const filtered = data.filter((item) => {
//       if (!s) return true
//       return (
//         (item.student_name || '').toLowerCase().includes(s) ||
//         (item.test_type || '').toLowerCase().includes(s) ||
//         (item.branch_name || '').toLowerCase().includes(s) ||
//         (item.final_result || '').toLowerCase().includes(s)
//       )
//     })

//     return filtered.sort((a, b) => {
//       const valA = a[sortField]
//       const valB = b[sortField]

//       if (valA === null || valA === undefined) return sortOrder === 'asc' ? -1 : 1
//       if (valB === null || valB === undefined) return sortOrder === 'asc' ? 1 : -1

//       if (sortField === 'created_at') {
//         const timeA = new Date(valA as string).getTime()
//         const timeB = new Date(valB as string).getTime()
//         return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
//       }

//       if (typeof valA === 'string' && typeof valB === 'string') {
//         return sortOrder === 'asc'
//           ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
//           : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' })
//       }

//       if (valA < valB) return sortOrder === 'asc' ? -1 : 1
//       if (valA > valB) return sortOrder === 'asc' ? 1 : -1
//       return 0
//     })
//   }, [data, searchTerm, sortField, sortOrder])

//   const totalPages = Math.ceil(processedData.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const paginatedData = processedData.slice(
//     startIndex,
//     startIndex + itemsPerPage
//   )

//   const renderSortIndicator = (field: SortField) => {
//     if (sortField !== field) {
//       return <ArrowUpDown size={14} className="opacity-40" />
//     }
//     return sortOrder === 'asc' ? (
//       <ArrowUp size={14} className="text-zinc-900 dark:text-zinc-100" />
//     ) : (
//       <ArrowDown size={14} className="text-zinc-900 dark:text-zinc-100" />
//     )
//   }

//   if (loading) {
//     return (
//       <div className="h-64 flex items-center justify-center">
//         <Loader2 className="animate-spin text-blue-600" size={32} />
//       </div>
//     )
//   }

//   return (
//     <TooltipProvider>
//       <div className="space-y-4">
//         <div className="relative max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//           <Input
//             placeholder="Search results..."
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value)
//               setCurrentPage(1)
//             }}
//             className="pl-9"
//           />
//         </div>

//         <div className="rounded-md border bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
//           <Table>
//             <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
//               <TableRow>
//                 {[
//                   { label: 'Name', key: 'student_name' },
//                   { label: 'Type', key: 'test_type' },
//                   { label: 'Age', key: 'age' },
//                   { label: 'Branch', key: 'branch_name' },
//                   { label: 'Level', key: 'final_result' },
//                 ].map((column) => (
//                   <TableHead
//                     key={column.key}
//                     onClick={() => handleSort(column.key as SortField)}
//                     className="cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none"
//                   >
//                     <div className="flex items-center gap-1">
//                       {column.label}
//                       {renderSortIndicator(column.key as SortField)}
//                     </div>
//                   </TableHead>
//                 ))}

//                 <TableHead>Answers Progress</TableHead>

//                 <TableHead
//                   onClick={() => handleSort('created_at')}
//                   className="cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none"
//                 >
//                   <div className="flex items-center gap-1">
//                     Date
//                     {renderSortIndicator('created_at')}
//                   </div>
//                 </TableHead>

//                 {/* Actions Column */}
//                 <TableHead className="w-[60px] text-center">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {paginatedData.length > 0 ? (
//                 paginatedData.map((result) => (
//                   <TableRow
//                     key={result.id}
//                     className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 text-sm transition-colors"
//                   >
//                     <TableCell className="font-medium">
//                       {result.student_name}
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant="outline" className="font-normal">
//                         {result.test_type}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       {result.age ? `${result.age} yrs` : '—'}
//                     </TableCell>
//                     <TableCell>{result.branch_name}</TableCell>
//                     <TableCell>
//                       <span className="font-bold text-blue-600 dark:text-blue-400">
//                         {result.final_result}
//                       </span>
//                     </TableCell>

//                     <TableCell>
//                       <DnaStrip history={result.question_history} />
//                     </TableCell>

//                     <TableCell className="text-left text-muted-foreground tabular-nums whitespace-nowrap">
//                       {new Date(result.created_at).toLocaleString('en-GB', {
//                         day: '2-digit',
//                         month: 'short',
//                         year: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit',
//                         hour12: false,
//                       })}
//                     </TableCell>

//                     <TableCell className="text-center">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => handleDelete(result.id)}
//                         disabled={deletingId === result.id}
//                         className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors"
//                         title="Delete Result"
//                       >
//                         {deletingId === result.id ? (
//                           <Loader2 size={16} className="animate-spin text-red-600" />
//                         ) : (
//                           <Trash2 size={16} />
//                         )}
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={8}
//                     className="h-24 text-center text-muted-foreground"
//                   >
//                     No results found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-muted-foreground whitespace-nowrap">
//               Rows per page
//             </span>
//             <Select
//               value={itemsPerPage.toString()}
//               onValueChange={(val: string) => {
//                 setItemsPerPage(Number(val))
//                 setCurrentPage(1)
//               }}
//             >
//               <SelectTrigger className="h-8 w-[70px]">
//                 <SelectValue placeholder={itemsPerPage} />
//               </SelectTrigger>
//               <SelectContent>
//                 {[10, 20, 30, 40, 50].map((size) => (
//                   <SelectItem key={size} value={size.toString()}>
//                     {size}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               disabled={currentPage === 1}
//             >
//               <ChevronLeft size={16} />
//             </Button>
//             <div className="text-sm font-medium mx-2">
//               Page {currentPage} of {totalPages || 1}
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//               disabled={currentPage === totalPages || totalPages === 0}
//             >
//               <ChevronRight size={16} />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </TooltipProvider>
//   )
// }

// function DnaStrip({ history }: { history: QuestionHistoryItem[] | null }) {
//   if (!history || history.length === 0) {
//     return <span className="text-xs text-muted-foreground">—</span>
//   }

//   return (
//     <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] py-1 scrollbar-none">
//       {history.map((q, i) => (
//         <Tooltip key={i}>
//           <TooltipTrigger asChild>
//             <span
//               className={`w-3 h-3 rounded-full transition-transform hover:scale-125 shrink-0 inline-block cursor-help ${
//                 q.correct ? 'bg-emerald-500' : 'bg-rose-500'
//               }`}
//             />
//           </TooltipTrigger>
//           <TooltipContent side="top" className="text-xs font-semibold">
//             Q{i + 1}: Level {q.level} ({q.correct ? 'Correct' : 'Incorrect'})
//           </TooltipContent>
//         </Tooltip>
//       ))}
//     </div>
//   )
// }

// src\components\admin\ResultsTable.tsx

'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Trash2,
} from 'lucide-react'
import { createClient } from '@/lib/client'
import { deleteTestResult } from '@/app/actions'

interface QuestionHistoryItem {
  level: string
  correct: boolean
}

interface TestResult {
  id: string
  student_name: string
  test_type: 'Adult' | 'Mathayom' | 'Prathom' | 'KG'
  age: number | null
  branch_name: string
  final_result: string
  created_at: string
  status?: string | null
  started_at_level?: string | null
  question_history: QuestionHistoryItem[] | null
}

type SortField =
  | 'student_name'
  | 'test_type'
  | 'age'
  | 'branch_name'
  | 'final_result'
  | 'created_at'

type SortOrder = 'asc' | 'desc'

interface ResultsTableProps {
  branchFilter?: string | null
}

export function ResultsTable({ branchFilter }: ResultsTableProps) {
  const supabase = useMemo(() => createClient(), [])
  const [data, setData] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<TestResult | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      let query = supabase.from('test_results').select('*')
      if (branchFilter) {
        query = query.eq('branch_name', branchFilter)
      }
      query = query.order('created_at', { ascending: false })
      const { data: results, error } = await query.returns<TestResult[]>()

      if (!error && results) {
        setData(results)
      }
      setLoading(false)
    }
    fetchResults()
  }, [branchFilter, supabase])

  const confirmDelete = async () => {
    if (!itemToDelete) return

    const id = itemToDelete.id
    try {
      setDeletingId(id)
      await deleteTestResult(id)
      setData((prev) => prev.filter((item) => item.id !== id))
    } catch {
      alert('Failed to delete the result. Please try again.')
    } finally {
      setDeletingId(null)
      setItemToDelete(null)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const processedData = useMemo(() => {
    const s = searchTerm.trim().toLowerCase()

    const filtered = data.filter((item) => {
      if (!s) return true
      return (
        (item.student_name || '').toLowerCase().includes(s) ||
        (item.test_type || '').toLowerCase().includes(s) ||
        (item.branch_name || '').toLowerCase().includes(s) ||
        (item.final_result || '').toLowerCase().includes(s)
      )
    })

    return filtered.sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]

      if (valA === null || valA === undefined) return sortOrder === 'asc' ? -1 : 1
      if (valB === null || valB === undefined) return sortOrder === 'asc' ? 1 : -1

      if (sortField === 'created_at') {
        const timeA = new Date(valA as string).getTime()
        const timeB = new Date(valB as string).getTime()
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
          : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' })
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [data, searchTerm, sortField, sortOrder])

  const totalPages = Math.ceil(processedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = processedData.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="opacity-40" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} className="text-zinc-900 dark:text-zinc-100" />
    ) : (
      <ArrowDown size={14} className="text-zinc-900 dark:text-zinc-100" />
    )
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>

        <div className="rounded-md border bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
              <TableRow>
                {[
                  { label: 'Name', key: 'student_name' },
                  { label: 'Type', key: 'test_type' },
                  { label: 'Age', key: 'age' },
                  { label: 'Branch', key: 'branch_name' },
                  { label: 'Level', key: 'final_result' },
                ].map((column) => (
                  <TableHead
                    key={column.key}
                    onClick={() => handleSort(column.key as SortField)}
                    className="cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {renderSortIndicator(column.key as SortField)}
                    </div>
                  </TableHead>
                ))}

                <TableHead>Answers Progress</TableHead>

                <TableHead
                  onClick={() => handleSort('created_at')}
                  className="cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    Date
                    {renderSortIndicator('created_at')}
                  </div>
                </TableHead>

                <TableHead className="w-[60px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((result) => (
                  <TableRow
                    key={result.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 text-sm transition-colors"
                  >
                    <TableCell className="font-medium">
                      {result.student_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {result.test_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {result.age ? `${result.age} yrs` : '—'}
                    </TableCell>
                    <TableCell>{result.branch_name}</TableCell>
                    <TableCell>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {result.final_result}
                      </span>
                    </TableCell>

                    <TableCell>
                      <DnaStrip history={result.question_history} />
                    </TableCell>

                    <TableCell className="text-left text-muted-foreground tabular-nums whitespace-nowrap">
                      {new Date(result.created_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setItemToDelete(result)}
                        disabled={deletingId === result.id}
                        className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors"
                        title="Delete Result"
                      >
                        {deletingId === result.id ? (
                          <Loader2 size={16} className="animate-spin text-red-600" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Rows per page
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(val: string) => {
                setItemsPerPage(Number(val))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="text-sm font-medium mx-2">
              Page {currentPage} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* shadcn Delete Confirmation Modal */}
        <AlertDialog
          open={!!itemToDelete}
          onOpenChange={(open) => {
            if (!open) setItemToDelete(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the test
                result for{' '}
                <span className="font-semibold text-foreground">
                  {itemToDelete?.student_name}
                </span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}

function DnaStrip({ history }: { history: QuestionHistoryItem[] | null }) {
  if (!history || history.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] py-1 scrollbar-none">
      {history.map((q, i) => (
        <Tooltip key={i}>
          <TooltipTrigger asChild>
            <span
              className={`w-3 h-3 rounded-full transition-transform hover:scale-125 shrink-0 inline-block cursor-help ${
                q.correct ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs font-semibold">
            Q{i + 1}: Level {q.level} ({q.correct ? 'Correct' : 'Incorrect'})
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}