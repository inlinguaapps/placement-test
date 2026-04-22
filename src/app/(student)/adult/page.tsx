// src\app\(student)\adult\page.tsx

import { getActiveBranches } from '@/app/actions'
import AdultFormClient from '@/app/(student)/adult/AdultFormClient'

export default async function AdultPage() {
  // Fetch branches on the server
  const branches = await getActiveBranches()

  return <AdultFormClient branches={branches} />
}
