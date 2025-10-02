interface ButtonProps {
  type: 'button' | 'submit' | 'reset'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  className?: string
}

export const Button = ({ 
  type, 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  className = ''
}: ButtonProps) => {
  const baseClasses = 'font-medium py-3 px-4 rounded-lg transition-colors'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
