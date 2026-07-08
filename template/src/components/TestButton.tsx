'use client'

import cn from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

interface TestButtonProps extends HTMLAttributes<HTMLDivElement> {
  /** Component content */
  children?: ReactNode
}

/**
 * TestButton component.
 */
export function TestButton({
  children,
  className,
  ...props
}: TestButtonProps) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}
