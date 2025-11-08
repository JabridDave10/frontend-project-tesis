'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface FileUploadProps {
  label: string
  accept?: string
  maxSizeMB?: number
  onFileSelect: (file: File | null) => void
  preview?: string | null
  required?: boolean
  helperText?: string
}

export const FileUpload = ({
  label,
  accept = 'image/jpeg,image/jpg,image/png',
  maxSizeMB = 5,
  onFileSelect,
  preview,
  required = false,
  helperText
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null)

    if (!file) {
      setPreviewUrl(null)
      onFileSelect(null)
      return
    }

    // Validar tipo de archivo
    const acceptedTypes = accept.split(',').map(t => t.trim())
    if (!acceptedTypes.includes(file.type)) {
      setError(`Tipo de archivo no permitido. Solo se aceptan: ${acceptedTypes.join(', ')}`)
      setPreviewUrl(null)
      onFileSelect(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`)
      setPreviewUrl(null)
      onFileSelect(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    onFileSelect(file)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setError(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      <div className="flex flex-col items-center gap-4">
        {previewUrl && (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex gap-2 w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            {previewUrl ? 'Cambiar archivo' : 'Seleccionar archivo'}
          </label>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-3 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
