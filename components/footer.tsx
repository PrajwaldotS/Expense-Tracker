'use client'

import Link from 'next/link'
import { FaGithub, FaLinkedin } from 'react-icons/fa'

export default function AppFooter() {
  return (
    <footer
      className="
        fixed bottom-0 left-0 w-full z-40
        backdrop-blur-md bg-background/70
        border-t border-border/40
      "
    >
      {/* Blended top fade */}
      <div className="absolute -top-6 left-0 w-full h-6 bg-gradient-to-t from-background/70 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        
        {/* Text */}
        <span>
          Designed &amp; Developed by{' '}
          <span className="font-semibold text-foreground">
            Prajwal
          </span>
        </span>

        {/* Links */}
        <div className="flex items-center gap-4">
          <Link
            href="https://www.linkedin.com/in/prajwal-s-159b5a369/"
            target="_blank"
            className="hover:text-[#0a66c2] transition"
          >
            <FaLinkedin size={16} />
          </Link>

          <Link
            href="https://github.com/PrajwaldotS"
            target="_blank"
            className="hover:text-foreground transition"
          >
            <FaGithub size={16} />
          </Link>
        </div>
      </div>
    </footer>
  )
}
