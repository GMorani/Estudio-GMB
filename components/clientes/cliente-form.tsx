"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { formatDNI, formatTelefono } from "@/lib/utils"
import { Loader2 } from "lucide-react"

// Esquema de validación
const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  dni_cuit: z.string().min(1, "El DNI es obligatorio"),
  domicilio: z.string().min(1, "El domicilio es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
  referido: z.string().optional(),
  rol: z.enum(["Actora", "Demandada"]),
  tieneVehiculo: z.boolean().default(false),
  vehiculo: z
    .object({
      marca: z.string().optional(),
      modelo: z.string().optional(),
      anio: z.string().optional(),
      dominio: z.string().optional(),
    })
    .optional(),
})

type ClienteFormValues = z.infer<typeof clienteSchema>

type ClienteFormProps = {
  cliente?: any
  clientesReferidos?: { id: string; nombre: string }[]
  onSuccess?: (id: string) => void
}

export function ClienteForm({ cliente, clientesReferidos = [], onSuccess }: ClienteFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [dominioEmail, setDominioEmail] = useState<string>("@gmail.com")
  const [emailPersonalizado, setEmailPersonalizado] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [referidos, setReferidos] = useState<{ id: string; nombre: string }[]>([])
  const [isLoadingReferidos, setIsLoadingReferidos] = useState<boolean>(false)

  // Cargar referidos si no se proporcionan
  useEffect(() => {
    if (clientesReferidos.length === 0) {
      const fetchReferidos = async () => {
        setIsLoadingReferidos(true)
        try {
          const { data, error } = await supabase
            .from("personas")
            .select("id, nombre")
            .eq("tipo_id", 1) // Asumiendo que tipo_id 1 es para clientes
            .order("nombre")

          if (error) throw error
          setReferidos(data || [])
        } catch (error) {
          console.error("Error al cargar referidos:", error)
          setReferidos([])
        } finally {
          setIsLoadingReferidos(false)
        }
      }

      fetchReferidos()
    } else {
      setReferidos(clientesReferidos)
    }
  }, [clientesReferidos, supabase])

  // Valores por defecto
  const defaultValues: Partial<ClienteFormValues> = cliente
    ? {
        nombre: cliente.nombre,
        dni_cuit: cliente.dni_cuit,
        domicilio: cliente.domicilio,
        telefono: cliente.telefono,
        email: cliente.email,
        referido: cliente.clientes?.referido || "",
        rol: cliente.rol || "Actora",
        tieneVehiculo: !!cliente.vehiculo,
        vehiculo: cliente.vehiculo
          ? {
              marca: cliente.vehiculo.marca,
              modelo: cliente.vehiculo.modelo,
              anio: String(cliente.vehiculo.anio),
              dominio: cliente.vehiculo.dominio,
            }
          : undefined,
      }
    : {
        nombre: "",
        dni_cuit: "",
        domicilio: "",
        telefono: "",
        email: "",
        referido: "",
        rol: "Actora",
        tieneVehiculo: false,
      }

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues,
  })

  // Manejar cambios en el DNI para formatear automáticamente
  const handleDNIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedDNI = formatDNI(e.target.value)
    form.setValue("dni_cuit", formattedDNI)
  }

  // Manejar cambios en el teléfono para formatear automáticamente
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedTelefono = formatTelefono(e.target.value)
    form.setValue("telefono", formattedTelefono)
  }

  // Manejar cambios en el email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value

    // Si contiene @ asumimos que es un email completo
    if (emailValue.includes("@")) {
      form.setValue("email", emailValue)
      return
    }

    // Si no, concatenamos con el dominio seleccionado
    if (!emailPersonalizado) {
      form.setValue("email", emailValue + dominioEmail)
    } else {
      form.setValue("email", emailValue)
    }
  }

  // Manejar cambio de dominio de email
  const handleDominioChange = (value: string) => {
    setDominioEmail(value)

    // Actualizar el email con el nuevo dominio
    const emailBase = form.getValues("email").split("@")[0]
    if (emailBase) {
      if (value === "otro") {
        setEmailPersonalizado(true)
        form.setValue("email", emailBase)
      } else {
        setEmailPersonalizado(false)
        form.setValue("email", emailBase + value)
      }
    }
  }

  async function onSubmit(data: ClienteFormValues) {
    setIsLoading(true)
    try {
      console.log("Guardando cliente con datos:", data)

      // 1. Crear o actualizar en la tabla personas
      const personaData = {
        nombre: data.nombre,
        dni_cuit: data.dni_cuit.replace(/\./g, ""), // Eliminar puntos
        domicilio: data.domicilio,
        telefono: data.telefono.replace(/-/g, ""), // Eliminar guiones
        email: data.email,
        tipo_id: 1, // Tipo cliente
      }

      console.log("Datos de persona a guardar:", personaData)

      let personaId

      if (cliente) {
        // Actualizar persona existente
        const { error: updateError } = await supabase.from("personas").update(personaData).eq("id", cliente.id)

        if (updateError) throw updateError
        personaId = cliente.id
      } else {
        // Crear nueva persona
        const { data: newPersona, error: insertError } = await supabase
          .from("personas")
          .insert(personaData)
          .select("id")
          .single()

        if (insertError) throw insertError
        personaId = newPersona.id
      }

      // 2. Crear o actualizar en la tabla clientes
      const clienteData = {
        id: personaId,
        referido: data.referido,
      }

      if (cliente) {
        // Actualizar cliente existente
        const { error: updateClienteError } = await supabase.from("clientes").update(clienteData).eq("id", personaId)

        if (updateClienteError) throw updateClienteError
      } else {
        // Crear nuevo cliente
        const { error: insertClienteError } = await supabase.from("clientes").insert(clienteData)

        if (insertClienteError) throw insertClienteError
      }

      // 3. Manejar vehículo si existe
      if (data.tieneVehiculo && data.vehiculo) {
        const vehiculoData = {
          cliente_id: personaId,
          marca: data.vehiculo.marca,
          modelo: data.vehiculo.modelo,
          anio: Number.parseInt(data.vehiculo.anio || "0"),
          dominio: data.vehiculo.dominio,
        }

        // Verificar si ya existe un vehículo para este cliente
        const { data: existingVehiculo } = await supabase
          .from("vehiculos")
          .select("id")
          .eq("cliente_id", personaId)
          .maybeSingle()

        if (existingVehiculo) {
          // Actualizar vehículo existente
          const { error: updateVehiculoError } = await supabase
            .from("vehiculos")
            .update(vehiculoData)
            .eq("id", existingVehiculo.id)

          if (updateVehiculoError) throw updateVehiculoError
        } else {
          // Crear nuevo vehículo
          const { error: insertVehiculoError } = await supabase.from("vehiculos").insert(vehiculoData)

          if (insertVehiculoError) throw insertVehiculoError
        }
      } else if (!data.tieneVehiculo) {
        // Eliminar vehículo si existe
        const { error: deleteVehiculoError } = await supabase.from("vehiculos").delete().eq("cliente_id", personaId)

        if (deleteVehiculoError) throw deleteVehiculoError
      }

      toast({
        title: cliente ? "Cliente actualizado" : "Cliente creado",
        description: cliente
          ? "El cliente ha sido actualizado correctamente"
          : "El cliente ha sido creado correctamente",
      })

      if (onSuccess) {
        onSuccess(personaId)
      } else {
        router.push("/clientes")
        router.refresh()
      }
    } catch (error) {
      console.error("Error al guardar cliente:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el cliente",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre completo */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DNI */}
              <FormField
                control={form.control}
                name="dni_cuit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          handleDNIChange(e)
                        }}
                        placeholder="XX.XXX.XXX"
                      />
                    </FormControl>
                    <FormDescription>Formato: XX.XXX.XXX</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Domicilio */}
              <FormField
                control={form.control}
                name="domicilio"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Domicilio</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Teléfono móvil */}
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono móvil</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          handleTelefonoChange(e)
                        }}
                        placeholder="XXX-XXX-XXXX"
                      />
                    </FormControl>
                    <FormDescription>Formato: XXX-XXX-XXXX</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value.split("@")[0] || ""}
                              onChange={(e) => {
                                handleEmailChange(e)
                              }}
                              placeholder="correo"
                            />
                          </FormControl>
                        </div>
                        <Select value={dominioEmail} onValueChange={handleDominioChange}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Dominio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="@gmail.com">@gmail.com</SelectItem>
                            <SelectItem value="@hotmail.com">@hotmail.com</SelectItem>
                            <SelectItem value="@outlook.com">@outlook.com</SelectItem>
                            <SelectItem value="@yahoo.com.ar">@yahoo.com.ar</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {emailPersonalizado && (
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="correo@dominio.com"
                            className="mt-2"
                          />
                        </FormControl>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Referido */}
              <FormField
                control={form.control}
                name="referido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referido por</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoadingReferidos}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar referido" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sin referido</SelectItem>
                        {isLoadingReferidos ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Cargando...</span>
                          </div>
                        ) : (
                          referidos.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nombre}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>Persona que refirió al cliente</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rol */}
              <FormField
                control={form.control}
                name="rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Actora" />
                          </FormControl>
                          <FormLabel className="font-normal">Actora</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Demandada" />
                          </FormControl>
                          <FormLabel className="font-normal">Demandada</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tiene vehículo */}
              <FormField
                control={form.control}
                name="tieneVehiculo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Vehículo</FormLabel>
                      <FormDescription>¿El cliente posee un vehículo?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Datos del vehículo (condicional) */}
            {form.watch("tieneVehiculo") && (
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Datos del vehículo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehiculo.marca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehiculo.modelo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehiculo.anio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehiculo.dominio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dominio (patente)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/clientes")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {cliente ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  <>{cliente ? "Actualizar" : "Guardar"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
