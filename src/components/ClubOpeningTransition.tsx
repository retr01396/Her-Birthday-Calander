"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { ClubMark } from "@/components/clubboard/club-identity"

export default function ClubOpeningTransition({ club, href, children }: { club: { name: string; category: string | null; logoUrl: string | null }; href: string; children: ReactNode }) {
  const router = useRouter()
  const [opening, setOpening] = useState(false)

  const open = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setOpening(true)
    window.setTimeout(() => router.push(href), 560)
  }

  return (
    <>
      <a href={href} onClick={open} className="contents">{children}</a>
      <AnimatePresence>
        {opening && (
          <motion.div className="club-opening-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: .7, opacity: 0, rotate: -5 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: .5, ease: [0.2, .7, .2, 1] }} className="flex flex-col items-center gap-6 text-center">
              <ClubMark club={club} size="lg" />
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.25em] text-white/60">Entering community</p>
                <h2 className="mt-2 max-w-[80vw] font-display text-5xl leading-none text-white sm:text-7xl">{club.name}</h2>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
