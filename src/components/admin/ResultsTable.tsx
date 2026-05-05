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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/client'

// 1. Define strict interface to remove 'any' warnings
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
  const supabase = createClient()
  // 2. Apply the interface to the state
  const [data, setData] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    async function fetchResults() {
      setLoading(true)

      // 1. Start the query builder
      let query = supabase.from('test_results').select('*')

      // 2. Apply filters BEFORE casting the return type
      if (branchFilter) {
        query = query.eq('branch_name', branchFilter)
      }

      // 3. Apply sorting or other modifiers
      query = query.order('created_at', { ascending: false })

      // 4. Finally, cast the return type and execute
      const { data: results, error } = await query.returns<TestResult[]>()

      if (!error && results) {
        setData(results)
      }
      setLoading(false)
    }

    fetchResults()
  }, [branchFilter, supabase])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const processedData = useMemo(() => {
    const filtered = data.filter((item) => {
      const s = searchTerm.toLowerCase()
      return (
        item.student_name.toLowerCase().includes(s) ||
        item.test_type.toLowerCase().includes(s) ||
        item.branch_name.toLowerCase().includes(s) ||
        item.final_result.toLowerCase().includes(s)
      )
    })

    return filtered.sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]

      if (valA === null || valA === undefined)
        return sortOrder === 'asc' ? -1 : 1
      if (valB === null || valB === undefined)
        return sortOrder === 'asc' ? 1 : -1

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [data, searchTerm, sortField, sortOrder])

  const totalPages = Math.ceil(processedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = processedData.slice(
    startIndex,
    startIndex + itemsPerPage,
  )

  if (loading) {
    return (
      <div className='h-64 flex items-center justify-center'>
        <Loader2 className='animate-spin text-blue-600' size={32} />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='relative max-w-sm'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
        <Input
          placeholder='Search results...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className='pl-9'
        />
      </div>

      <div className='rounded-md border bg-white dark:bg-zinc-900 overflow-hidden'>
        <Table>
          <TableHeader className='bg-zinc-50 dark:bg-zinc-800/50'>
            <TableRow>
              {[
                { label: 'Name', key: 'student_name' },
                { label: 'Type', key: 'test_type' },
                { label: 'Age', key: 'age' },
                { label: 'Branch', key: 'branch_name' },
                { label: 'Level', key: 'final_result' },
                { label: 'Date', key: 'created_at' },
              ].map((column) => (
                <TableHead
                  key={column.key}
                  onClick={() => handleSort(column.key as SortField)}
                  className={`cursor-pointer hover:text-zinc-900 transition-colors ${column.key === 'created_at' ? 'text-right' : ''}`}
                >
                  <div
                    className={`flex items-center gap-1 ${column.key === 'created_at' ? 'justify-end' : ''}`}
                  >
                    {column.label}
                    <ArrowUpDown size={14} className='opacity-50' />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((result) => (
                <TableRow
                  key={result.id}
                  className='hover:bg-zinc-50/50 text-sm'
                >
                  <TableCell className='font-medium'>
                    {result.student_name}
                  </TableCell>
                  <TableCell>{result.test_type}</TableCell>
                  <TableCell>
                    {result.age ? `${result.age} yrs` : '—'}
                  </TableCell>
                  <TableCell>{result.branch_name}</TableCell>
                  <TableCell className='font-bold text-blue-600'>
                    {result.final_result}
                  </TableCell>
                  <TableCell className='text-right text-muted-foreground tabular-nums'>
                    {new Date(result.created_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false, // Set to true if you prefer AM/PM
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='h-24 text-center text-muted-foreground'
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground whitespace-nowrap'>
            Rows per page
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(val: string) => {
              setItemsPerPage(Number(val))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
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

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <div className='text-sm font-medium mx-2'>
            Page {currentPage} of {totalPages || 1}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
