import { auth } from "@/auth"
import Link from "next/link"
import SignOutButton from "./ui/signOutButton"

export async function Header() {
  const session = await auth()

  return (
    <header className='p-4 bg-gray-100 border-b'>
      <nav className='flex justify-between items-center max-w-7xl mx-auto'>
        <div className='flex items-center space-x-6'>
          <p className='font-bold'>Next Auth v5 + Next.js + OIDC</p>
          <div className='flex items-center space-x-4 text-sm'>
            <Link href='/dashboard' className='text-muted-foreground hover:text-foreground transition-colors'>
              Dashboard
            </Link>
            <Link href='/admin/users' className='text-muted-foreground hover:text-foreground transition-colors'>
              Users
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span>{session?.user?.name}</span>          
          <SignOutButton />
        </div>
      </nav>
    </header>
  )
}