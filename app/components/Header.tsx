"use client"

import AuthStatus from '@/components/auth-status';
import { MessageSquare } from 'lucide-react';
import { Lusitana } from 'next/font/google';

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
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 flex items-center justify-center mr-3">
              <MessageSquare size={20} className="text-white" />
            </div>
            <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 ${lusitana.className}`}>NOVA AI</h1>
          </div>

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