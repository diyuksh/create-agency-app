'use client'

import cn from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

interface AnotherButtonProps extends HTMLAttributes<HTMLDivElement> {
  /** Component content */
  children?: ReactNode
}

/**
 * AnotherButton component.
 */
export function AnotherButton({
  children,
  className,
  ...props
}: AnotherButtonProps) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}
