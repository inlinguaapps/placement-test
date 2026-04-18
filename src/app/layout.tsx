import type { Metadata } from 'next'
import { Inter } from 'next/font/google' // Import Inter
import './globals.css'

// Configure Inter
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'inlingua Placement Test',
  description: 'Language assessment platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='h-full'>
      {/* Apply the variable and the font-sans class */}
      <body
        className={`${inter.variable} font-sans antialiased min-h-full flex flex-col`}
      >
        {children}
      </body>
    </html>
  )
}
