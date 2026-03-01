'use client'

import { useState } from 'react'
import { AxiosCompany } from '@/services/axiosCompany'
import { CreateCompanyDto } from '@/types/companyTypes'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2 } from 'lucide-react'

interface CompanyRegistrationModalProps {
  open: boolean
  onClose?: () => void
  onSuccess: () => void
  required?: boolean // Si es true, no se puede cerrar hasta que se registre la empresa
}

// Tipo para el formulario (sin id_user, que se obtiene del localStorage)
interface CompanyFormData {
  name: string
  nit?: string
  logo?: string
}

export const CompanyRegistrationModal = ({
  open,
  onClose,
  onSuccess,
  required = false
}: CompanyRegistrationModalProps) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    nit: '',
    logo: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const companyService = new AxiosCompany()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return
    }

    setIsLoading(true)

    try {
      // Obtener el id del usuario desde localStorage (requerido por el backend)
      let userId: number | null = null
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            userId = user.id
            if (!userId) {
              console.error('El usuario no tiene un id válido')
            }
          } catch (error) {
            console.error('Error al obtener usuario del localStorage:', error)
          }
        }
      }

      if (!userId) {
        console.error('No se pudo obtener el id del usuario. Por favor, inicia sesión nuevamente.')
        setIsLoading(false)
        return
      }

      // Construir el objeto con id_user requerido por el backend
      const dataToSend: CreateCompanyDto = {
        id_user: userId,
        name: formData.name.trim(),
        ...(formData.nit?.trim() && { nit: formData.nit.trim() }),
        ...(formData.logo?.trim() && { logo: formData.logo.trim() })
      }

      console.log('Enviando datos al backend:', dataToSend)

      const result = await companyService.createCompany(dataToSend)
      
      if (result && result.company) {
        // Actualizar el usuario en localStorage con el id_company
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('user')
          if (userStr) {
            try {
              const user = JSON.parse(userStr)
              user.id_company = result.company.id_company
              localStorage.setItem('user', JSON.stringify(user))
            } catch (error) {
              console.error('Error al actualizar usuario:', error)
            }
          }
        }
        
        // Resetear formulario
        setFormData({
          name: '',
          nit: '',
          logo: ''
        } as CompanyFormData)
        
        // Llamar a onSuccess primero
        onSuccess()
        
        // Cerrar el modal siempre después de registrar exitosamente
        // Forzar el cierre incluso si required es true
        forceClose()
      }
    } catch (error) {
      console.error('Error al crear empresa:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const [shouldClose, setShouldClose] = useState(false)

  const handleClose = (newOpen: boolean) => {
    // Si se está intentando cerrar
    if (!newOpen) {
      // Si es requerido y no se ha marcado para cerrar, no permitir
      if (required && !shouldClose) {
        return
      }
      // Si se puede cerrar, cerrar el modal
      if (onClose) {
        onClose()
        setShouldClose(false) // Resetear el flag
      }
    }
  }

  // Función para forzar el cierre (usada después de registro exitoso)
  const forceClose = () => {
    setShouldClose(true) // Marcar que se puede cerrar
    if (onClose) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] z-[9999]" onInteractOutside={(e) => required && e.preventDefault()} onEscapeKeyDown={(e) => required && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Registrar Empresa
          </DialogTitle>
          <DialogDescription>
            Completa los datos de tu empresa para continuar. El nombre es obligatorio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre de la Empresa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre de la empresa"
              required
              disabled={isLoading}
            />
          </div>

          {/* Campo NIT */}
          <div className="space-y-2">
            <Label htmlFor="nit">NIT (Opcional)</Label>
            <Input
              id="nit"
              name="nit"
              type="text"
              value={formData.nit}
              onChange={handleInputChange}
              placeholder="Ingresa el NIT de la empresa"
              disabled={isLoading}
            />
          </div>

          {/* Campo Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo (Opcional)</Label>
            <Input
              id="logo"
              name="logo"
              type="text"
              value={formData.logo}
              onChange={handleInputChange}
              placeholder="URL o texto del logo (por ahora solo texto)"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Por ahora solo se acepta texto. La funcionalidad de carga de archivos se implementará más adelante.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            {!required && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Registrando...' : 'Registrar Empresa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

