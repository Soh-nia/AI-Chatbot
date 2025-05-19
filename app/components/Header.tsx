"use client"

import AuthStatus from '@/components/auth-status';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { Lusitana } from 'next/font/google';
import Link from 'next/link';

const lusitana = Lusitana({ subsets: ['latin'], weight: ['400', '700'], });

// NavLink component
// const NavLink = ({ text }) => (
//   <a href="#" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
//     {text}
//   </a>
// );

export function Header() {
  return (
    <header className="relative z-10">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/chat" className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 flex items-center justify-center mr-2">
              <Sparkles size={18} className="text-white" />
            </div>
            <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 ${lusitana.className}`}>NOVA AI</h1>
            </Link>

          {/* <div className="hidden md:flex items-center space-x-1">
            <NavLink text="Features" />
            <NavLink text="Pricing" />
            <NavLink text="Documentation" />
            <NavLink text="Blog" />
          </div> */}

          <AuthStatus />
        </nav>
      </header>
  )
}

export function ChatHeader() {
  return (
    <header className="relative z-10">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/chat" className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 flex items-center justify-center mr-2">
                <Sparkles size={18} className="text-white" />
              </div>
              <h1 className={`text-1xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 ${lusitana.className}`}>NOVA AI</h1>
            </Link>

            {/* <Button
              variant="outline"
              size={"icon"}
              className="mx-2 mb-2  text-white"
            >
              <div>
                <Plus size={20} />
              </div>
            </Button> */}
          </div>


          <div className="flex items-center space-x-4">
            <Link href="/auth/signin" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Log in
            </Link>
            <Button asChild size={"sm"}>
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Sign up
            </Link>
            </Button>
          </div>
        </nav>
      </header>
  )
}