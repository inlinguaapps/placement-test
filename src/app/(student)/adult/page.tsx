// // src\app\(student)\adult\page.tsx

// import { getActiveBranches } from '@/app/actions'
// import AdultFormClient from '@/app/(student)/adult/AdultFormClient'

// export default async function AdultPage() {
//   // Fetch branches on the server
//   const branches = await getActiveBranches()

//   return <AdultFormClient branches={branches} />
// }



// src\app\(student)\adult\page.tsx

import { getActiveBranches } from '@/app/actions'
import AdultFormClient from '@/app/(student)/adult/AdultFormClient'

// Force dynamic rendering to ensure fresh branch data on every load
export const dynamic = 'force-dynamic'

export default async function AdultPage() {
  // Fetch branches with fallback protection
  const branches = (await getActiveBranches()) ?? []

  return <AdultFormClient branches={branches} />
}