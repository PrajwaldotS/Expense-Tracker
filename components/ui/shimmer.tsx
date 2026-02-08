'use client'

export function Shimmer({
  className = '',
}: {
  className?: string
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-md bg-muted
        before:absolute before:inset-0
        before:-translate-x-full
        before:bg-linear-to-r
        before:from-transparent
        before:via-white/20
        before:to-transparent
        before:animate-[shimmer_1.2s_infinite]
        ${className}
      `}
    />
  )
}
