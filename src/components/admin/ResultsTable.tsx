'use client'

import { useState, useMemo } from 'react'
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
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'

const initialData = [
  {
    id: 1,
    name: 'Somchai Dee',
    type: 'Adult',
    age: null,
    branch: 'Siam Square',
    level: 'B1',
    date: '2026-04-20',
  },
  {
    id: 2,
    name: 'Jane Doe',
    type: 'Prathom',
    age: 8,
    branch: 'Bang Na',
    level: 'A1',
    date: '2026-04-19',
  },
  {
    id: 3,
    name: 'Kittisak P.',
    type: 'KG',
    age: 5,
    branch: 'Paragon',
    level: 'A2',
    date: '2026-04-19',
  },
  {
    id: 4,
    name: 'Ananda S.',
    type: 'Mathayom',
    age: 14,
    branch: 'Pinklao',
    level: 'B2',
    date: '2026-04-18',
  },
]

type SortField = 'name' | 'type' | 'age' | 'branch' | 'level' | 'date'
type SortOrder = 'asc' | 'desc'

interface ResultsTableProps {
  branchFilter?: string | null
}

export function ResultsTable({ branchFilter }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const processedData = useMemo(() => {
    const filtered = initialData.filter((item) => {
      const matchesBranch = branchFilter ? item.branch === branchFilter : true
      const s = searchTerm.toLowerCase()
      return (
        matchesBranch &&
        (item.name.toLowerCase().includes(s) ||
          item.type.toLowerCase().includes(s) ||
          item.branch.toLowerCase().includes(s) ||
          item.level.toLowerCase().includes(s))
      )
    })

    return filtered.sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]
      if (valA === null) return sortOrder === 'asc' ? -1 : 1
      if (valB === null) return sortOrder === 'asc' ? 1 : -1
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [searchTerm, branchFilter, sortField, sortOrder])

  const totalPages = Math.ceil(processedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = processedData.slice(
    startIndex,
    startIndex + itemsPerPage,
  )

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
              {['name', 'type', 'age', 'branch', 'level', 'date'].map(
                (field) => (
                  <TableHead
                    key={field}
                    onClick={() => handleSort(field as SortField)}
                    className={`cursor-pointer hover:text-zinc-900 transition-colors ${field === 'date' ? 'text-right' : ''}`}
                  >
                    <div
                      className={`flex items-center gap-1 ${field === 'date' ? 'justify-end' : ''}`}
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                      <ArrowUpDown size={14} className='opacity-50' />
                    </div>
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((result) => (
                <TableRow
                  key={result.id}
                  className='hover:bg-zinc-50/50 text-sm'
                >
                  <TableCell className='font-medium'>{result.name}</TableCell>
                  <TableCell>{result.type}</TableCell>
                  <TableCell>
                    {result.age ? `${result.age} yrs` : '—'}
                  </TableCell>
                  <TableCell>{result.branch}</TableCell>
                  <TableCell className='font-bold text-blue-600'>
                    {result.level}
                  </TableCell>
                  <TableCell className='text-right text-muted-foreground tabular-nums'>
                    {result.date}
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
        <div className='flex items-center gap-4'>
          {/* <p className='text-sm text-muted-foreground font-medium'>
            Showing {processedData.length > 0 ? startIndex + 1 : 0} to{' '}
            {Math.min(startIndex + itemsPerPage, processedData.length)} of{' '}
            {processedData.length}
          </p> */}
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground whitespace-nowrap'>
              Rows per page
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(val: unknown) => {
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
