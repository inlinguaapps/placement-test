import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SelectionPage() {
  return (
    <div className='flex flex-col flex-1 items-center justify-center p-6'>
      <h1 className='text-2xl font-bold mb-8 text-center'>
        inlingua Placement Test
      </h1>
      <div className='flex flex-col sm:flex-row gap-4 w-full max-w-[400px]'>
        {/* Updated Link to young-learner */}
        <Link href='/young-learner' className='flex-1'>
          <Button className='w-full h-12' variant='outline'>
            Young Learner
          </Button>
        </Link>

        <Link href='/adult' className='flex-1'>
          <Button className='w-full h-12' variant='outline'>
            Adult Test
          </Button>
        </Link>
      </div>
    </div>
  )
}
