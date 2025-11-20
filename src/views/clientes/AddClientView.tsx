'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AxiosClients } from '@/services/axiosClients'
import { CreateClientDto } from '@/types/clientTypes'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Mail, Phone, MapPin, IdCard } from 'lucide-react'

export function AddClientView() {
  const router = useRouter()
  const clientsService = new AxiosClients()
  const [isLoading, setIsLoading] = useState(false)

  const [clientData, setClientData] = useState<CreateClientDto>({
    name: '',
    identification: '',
    email: '',
    phone: '',
    address: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setClientData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await clientsService.createClient(clientData)
      if (result) {
        router.push('/dashboard/clientes')
      }
    } catch (error) {
      console.error('Error al crear cliente:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Agregar Cliente
          </h1>
          <p className="text-gray-600">Complete la información del cliente</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Información Básica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      name="name"
                      value={clientData.name}
                      onChange={handleInputChange}
                      placeholder="Nombre completo del cliente"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="identification">Identificación *</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="identification"
                      type="text"
                      name="identification"
                      value={clientData.identification}
                      onChange={handleInputChange}
                      placeholder="Cédula, NIT, etc."
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Información de Contacto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={clientData.email}
                      onChange={handleInputChange}
                      placeholder="correo@ejemplo.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={clientData.phone}
                      onChange={handleInputChange}
                      placeholder="300 123 4567"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Dirección
              </h2>
              <div>
                <Label htmlFor="address">Dirección Completa *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="address"
                    type="text"
                    name="address"
                    value={clientData.address}
                    onChange={handleInputChange}
                    placeholder="Dirección completa del cliente"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard/clientes')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Cliente'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

