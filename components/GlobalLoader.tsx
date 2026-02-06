'use client'

import { motion } from 'framer-motion'

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Spinner */}
        <motion.div
          className="w-14 h-14 rounded-full border-4 border-muted border-t-brand"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 1,
          }}
        />

        {/* Text */}
        <motion.p
          className="text-sm text-muted-foreground tracking-wide"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
          }}
        >
          Loading, please wait…
        </motion.p>
      </motion.div>
    </div>
  )
}
