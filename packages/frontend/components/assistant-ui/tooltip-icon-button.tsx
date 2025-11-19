"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TooltipIconButtonProps {
  tooltip: string
  variant?: "default" | "outline" | "ghost"
  className?: string
  children: React.ReactNode
  [key: string]: any
}

export function TooltipIconButton({
  tooltip,
  variant = "ghost",
  className,
  children,
  ...props
}: TooltipIconButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={variant} size="icon" className={className} {...props}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

