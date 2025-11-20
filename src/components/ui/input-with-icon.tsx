import * as React from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface InputWithIconProps extends React.ComponentProps<"input"> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, leftIcon, rightIcon, onRightIconClick, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>
    )
  }
)

InputWithIcon.displayName = "InputWithIcon"

export { InputWithIcon }

