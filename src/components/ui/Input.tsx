import { ReactNode, useState } from 'react'

interface InputProps {
  type: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  icon?: ReactNode
  rightIcon?: ReactNode
  onRightIconClick?: () => void
  required?: boolean
}

export const Input = ({ 
  type, 
  name, 
  value, 
  onChange, 
  placeholder, 
  icon, 
  rightIcon,
  onRightIconClick,
  required = false 
}: InputProps) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          {icon}
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} ${rightIcon ? 'pr-10' : 'pr-4'} py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800 placeholder:text-gray-400`}
        required={required}
      />
      {rightIcon && (
        <button
          type="button"
          onClick={onRightIconClick}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          {rightIcon}
        </button>
      )}
    </div>
  )
}
