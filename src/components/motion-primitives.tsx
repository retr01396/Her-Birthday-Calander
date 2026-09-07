"use client"

import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export function LiquidGlass({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "article" | "nav" }) {
  const Component = motion[as]
  return (
    <Component className={cn("liquid-glass", className)} whileHover={{ y: -3 }} transition={{ duration: 0.25 }}>
      {children}
    </Component>
  )
}

export function GlassCard({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.article
      className={cn("liquid-glass p-5", className)}
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.article>
  )
}

export function ScrollReveal({ children, className, delay = 0, direction = "up" }: { children: ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" | "scale" }) {
  const offset = direction === "left" ? { x: -30 } : direction === "right" ? { x: 30 } : direction === "scale" ? { scale: 0.94 } : { y: 30 }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function ScrollParallax({ children, className, distance = 60 }: { children: ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [distance, -distance]), { stiffness: 80, damping: 20 })
  return <motion.div ref={ref} style={{ y }} className={className}>{children}</motion.div>
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 80, damping: 20 })
  return <motion.div className="campus-progress" style={{ scaleX, transformOrigin: "0% 50%" }} aria-hidden="true" />
}

export function MagneticButton({ children, className, ...props }: React.ComponentProps<typeof motion.button>) {
  return <motion.button className={className} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }} {...props}>{children}</motion.button>
}
