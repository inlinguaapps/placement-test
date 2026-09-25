// // src\app\auth\error\page.tsx

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// export default async function Page({ searchParams }: { searchParams: Promise<{ error: string }> }) {
//   const params = await searchParams

//   return (
//     <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
//       <div className="w-full max-w-sm">
//         <div className="flex flex-col gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-2xl">Sorry, something went wrong.</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {params?.error ? (
//                 <p className="text-sm text-muted-foreground">Code error: {params.error}</p>
//               ) : (
//                 <p className="text-sm text-muted-foreground">An unspecified error occurred.</p>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }



// src\app\auth\error\page.tsx

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: 'You do not have permission to access this resource.',
  Configuration: 'There is a problem with the server configuration.',
  Verification: 'The verification link has expired or has already been used.',
  OAuthSignin: 'Error occurred while constructing an authorization URL.',
  OAuthCallback: 'Error occurred while handling the response from the provider.',
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const description = error
    ? ERROR_MESSAGES[error] ?? `Code error: ${error}`
    : 'An unspecified authentication error occurred.'

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">
              Authentication Error
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardContent>

          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href="/login">Return to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}