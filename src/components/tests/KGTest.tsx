export default function KgTest({ name }: { name: string }) {
  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-bold'>KG Placement Test</h2>
      <p className='text-muted-foreground'>Welcome, {name}</p>
      <div className='h-40 flex items-center justify-center border-2 border-dashed rounded-lg bg-zinc-50'>
        <p>KG Test Loading...</p>
      </div>
    </div>
  )
}
