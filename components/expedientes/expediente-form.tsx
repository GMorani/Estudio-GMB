"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// Esquema de validación
const expedienteSchema = z.object({
  numero: z.string().min(1, "El número es obligatorio"),
  numero_judicial: z.string().optional(),
  fecha_inicio: z.string().optional(),
  fecha_inicio_judicial: z.string().optional(),
  monto_total: z.string().optional(),
  juzgado_id: z.string().optional(),
  objeto: z.string().optional(),
  autos: z.string().optional(),
  estados: z.array(z.string()).optional(),
  clientes: z.array(z.string()).optional(),
  abogados: z.array(z.string()).optional(),
  aseguradoras: z.array(z.string()).optional(),
  mediadores: z.array(z.string()).optional(),
  peritos: z.array(z.string()).optional(),
})

type ExpedienteFormValues = z.infer<typeof expedienteSchema>

type ExpedienteFormProps = {
  expedienteId?: string
  initialData?: any
  onSuccess?: (id: string) => void
}

export function ExpedienteForm({ expedienteId, initialData, onSuccess }: ExpedienteFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    juzgados: [] as any[],
    estados: [] as any[],
    clientes: [] as any[],
    abogados: [] as any[],
    aseguradoras: [] as any[],
    mediadores: [] as any[],
    peritos: [] as any[],
  })

  // Procesar los datos iniciales
  const processInitialData = () => {
    if (!initialData) return {}

    // Extraer estados del expediente
    const estados = initialData.expediente_estados?.map((estado: any) => estado.estado_id) || []

    // Extraer personas por rol
    const expedientePersonas = initialData.expediente_personas || []
    const clientes = expedientePersonas
      .filter((persona: any) => persona.rol === "Cliente")
      .map((persona: any) => persona.persona_id)

    const abogados = expedientePersonas
      .filter((persona: any) => persona.rol === "Abogado")
      .map((persona: any) => persona.persona_id)

    const aseguradoras = expedientePersonas
      .filter((persona: any) => persona.rol === "Aseguradora")
      .map((persona: any) => persona.persona_id)

    const mediadores = expedientePersonas
      .filter((persona: any) => persona.rol === "Mediador")
      .map((persona: any) => persona.persona_id)

    const peritos = expedientePersonas
      .filter((persona: any) => persona.rol === "Perito")
      .map((persona: any) => persona.persona_id)

    return {
      numero: initialData.numero || "",
      numero_judicial: initialData.numero_judicial || "",
      fecha_inicio: initialData.fecha_inicio || "",
      fecha_inicio_judicial: initialData.fecha_inicio_judicial || "",
      monto_total: initialData.monto_total || "",
      juzgado_id: initialData.juzgado_id || "",
      objeto: initialData.objeto || "",
      autos: initialData.autos || "",
      estados,
      clientes,
      abogados,
      aseguradoras,
      mediadores,
      peritos,
    }
  }

  // Valores por defecto
  const defaultValues = processInitialData()

  const form = useForm<ExpedienteFormValues>({
    resolver: zodResolver(expedienteSchema),
    defaultValues,
  })

  // Cargar datos necesarios para el formulario
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Obtener juzgados
        const { data: juzgados, error: juzgadosError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 4) // Tipo juzgado
          .order("nombre")

        if (juzgadosError) throw juzgadosError

        // Obtener estados
        const { data: estados, error: estadosError } = await supabase
          .from("estados_expediente")
          .select("id, nombre, color")
          .order("nombre")

        if (estadosError) throw estadosError

        // Obtener clientes
        const { data: clientes, error: clientesError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 1) // Tipo cliente
          .order("nombre")

        if (clientesError) throw clientesError

        // Obtener abogados
        const { data: abogados, error: abogadosError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 2) // Tipo abogado
          .order("nombre")

        if (abogadosError) throw abogadosError

        // Obtener aseguradoras
        const { data: aseguradoras, error: aseguradorasError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 3) // Tipo aseguradora
          .order("nombre")

        if (aseguradorasError) throw aseguradorasError

        // Obtener mediadores
        const { data: mediadores, error: mediadoresError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 5) // Tipo mediador
          .order("nombre")

        if (mediadoresError) throw mediadoresError

        // Obtener peritos
        const { data: peritos, error: peritosError } = await supabase
          .from("personas")
          .select("id, nombre")
          .eq("tipo_id", 6) // Tipo perito
          .order("nombre")

        if (peritosError) throw peritosError

        setFormData({
          juzgados: juzgados || [],
          estados: estados || [],
          clientes: clientes || [],
          abogados: abogados || [],
          aseguradoras: aseguradoras || [],
          mediadores: mediadores || [],
          peritos: peritos || [],
        })
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios para el formulario",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, toast])

  async function onSubmit(data: ExpedienteFormValues) {
    try {
      setIsSubmitting(true)

      // 1. Crear o actualizar en la tabla expedientes
      const expedienteData = {
        numero: data.numero,
        numero_judicial: data.numero_judicial,
        fecha_inicio: data.fecha_inicio,
        fecha_inicio_judicial: data.fecha_inicio_judicial,
        monto_total: data.monto_total,
        juzgado_id: data.juzgado_id || null,
        objeto: data.objeto,
        autos: data.autos,
      }

      let currentExpedienteId = initialData?.id || expedienteId

      if (currentExpedienteId) {
        // Actualizar expediente existente
        const { error: updateError } = await supabase
          .from("expedientes")
          .update(expedienteData)
          .eq("id", currentExpedienteId)

        if (updateError) throw updateError
      } else {
        // Crear nuevo expediente
        const { data: newExpediente, error: insertError } = await supabase
          .from("expedientes")
          .insert(expedienteData)
          .select("id")
          .single()

        if (insertError) throw insertError
        currentExpedienteId = newExpediente.id
      }

      // 2. Actualizar relaciones en expediente_estados
      // Eliminar relaciones existentes
      if (currentExpedienteId) {
        const { error: deleteEstadosError } = await supabase
          .from("expediente_estados")
          .delete()
          .eq("expediente_id", currentExpedienteId)

        if (deleteEstadosError) throw deleteEstadosError
      }

      // Insertar nuevas relaciones
      if (data.estados && data.estados.length > 0) {
        const estadosData = data.estados.map((estadoId) => ({
          expediente_id: currentExpedienteId,
          estado_id: estadoId,
        }))

        const { error: insertEstadosError } = await supabase.from("expediente_estados").insert(estadosData)

        if (insertEstadosError) throw insertEstadosError
      }

      // 3. Actualizar relaciones en expediente_personas
      // Eliminar relaciones existentes
      if (currentExpedienteId) {
        const { error: deletePersonasError } = await supabase
          .from("expediente_personas")
          .delete()
          .eq("expediente_id", currentExpedienteId)

        if (deletePersonasError) throw deletePersonasError
      }

      // Insertar nuevas relaciones
      const roles = [
        { tipo: "Cliente", ids: data.clientes },
        { tipo: "Abogado", ids: data.abogados },
        { tipo: "Aseguradora", ids: data.aseguradoras },
        { tipo: "Mediador", ids: data.mediadores },
        { tipo: "Perito", ids: data.peritos },
      ]

      for (const rol of roles) {
        if (rol.ids && rol.ids.length > 0) {
          const personasData = rol.ids.map((personaId) => ({
            expediente_id: currentExpedienteId,
            persona_id: personaId,
            rol: rol.tipo,
          }))

          const { error: insertPersonasError } = await supabase.from("expediente_personas").insert(personasData)

          if (insertPersonasError) throw insertPersonasError
        }
      }

      toast({
        title: initialData ? "Expediente actualizado" : "Expediente creado",
        description: initialData
          ? "El expediente ha sido actualizado correctamente"
          : "El expediente ha sido creado correctamente",
      })

      if (onSuccess) {
        onSuccess(currentExpedienteId)
      } else {
        router.push("/expedientes")
        router.refresh()
      }
    } catch (error) {
      console.error("Error al guardar expediente:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el expediente",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Número */}
          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Número Judicial */}
          <FormField
            control={form.control}
            name="numero_judicial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número Judicial</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha Inicio */}
          <FormField
            control={form.control}
            name="fecha_inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Inicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha Inicio Judicial */}
          <FormField
            control={form.control}
            name="fecha_inicio_judicial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Inicio Judicial</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Monto Total */}
          <FormField
            control={form.control}
            name="monto_total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto Total</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Juzgado */}
          <FormField
            control={form.control}
            name="juzgado_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Juzgado</FormLabel>
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar juzgado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {formData.juzgados.map((juzgado) => (
                      <SelectItem key={juzgado.id} value={juzgado.id}>
                        {juzgado.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Objeto */}
          <FormField
            control={form.control}
            name="objeto"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Objeto</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Autos */}
          <FormField
            control={form.control}
            name="autos"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Autos</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estados */}
          <FormField
            control={form.control}
            name="estados"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Estados</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {formData.estados.map((estado) => (
                      <div key={estado.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`estado-${estado.id}`}
                          value={estado.id}
                          checked={field.value?.includes(estado.id)}
                          onChange={(e) => {
                            const value = e.target.value
                            const isChecked = e.target.checked

                            if (isChecked) {
                              field.onChange([...(field.value || []), value])
                            } else {
                              field.onChange(field.value?.filter((val) => val !== value) || [])
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`estado-${estado.id}`} className="text-sm" style={{ color: estado.color }}>
                          {estado.nombre}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Clientes */}
          <FormField
            control={form.control}
            name="clientes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Clientes</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {formData.clientes.map((cliente) => (
                      <div key={cliente.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`cliente-${cliente.id}`}
                          value={cliente.id}
                          checked={field.value?.includes(cliente.id)}
                          onChange={(e) => {
                            const value = e.target.value
                            const isChecked = e.target.checked

                            if (isChecked) {
                              field.onChange([...(field.value || []), value])
                            } else {
                              field.onChange(field.value?.filter((val) => val !== value) || [])
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`cliente-${cliente.id}`} className="text-sm">
                          {cliente.nombre}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Abogados */}
          <FormField
            control={form.control}
            name="abogados"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Abogados</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {formData.abogados.map((abogado) => (
                      <div key={abogado.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`abogado-${abogado.id}`}
                          value={abogado.id}
                          checked={field.value?.includes(abogado.id)}
                          onChange={(e) => {
                            const value = e.target.value
                            const isChecked = e.target.checked

                            if (isChecked) {
                              field.onChange([...(field.value || []), value])
                            } else {
                              field.onChange(field.value?.filter((val) => val !== value) || [])
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`abogado-${abogado.id}`} className="text-sm">
                          {abogado.nombre}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Aseguradoras */}
          <FormField
            control={form.control}
            name="aseguradoras"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Aseguradoras</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {formData.aseguradoras.map((aseguradora) => (
                      <div key={aseguradora.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`aseguradora-${aseguradora.id}`}
                          value={aseguradora.id}
                          checked={field.value?.includes(aseguradora.id)}
                          onChange={(e) => {
                            const value = e.target.value
                            const isChecked = e.target.checked

                            if (isChecked) {
                              field.onChange([...(field.value || []), value])
                            } else {
                              field.onChange(field.value?.filter((val) => val !== value) || [])
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`aseguradora-${aseguradora.id}`} className="text-sm">
                          {aseguradora.nombre}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mediadores */}
          <FormField
            control={form.control}
            name="mediadores"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Mediadores</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {formData.mediadores.map((mediador) => (
                      <div key={mediador.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`mediador-${mediador.id}`}
                          value={mediador.id}
                          checked={field.value?.includes(mediador.id)}
                          onChange={(e) => {
                            const value = e.target.value
                            const isChecked = e.target.checked

                            if (isChecked) {
                              field.onChange([...(field.value || []), value])
                            } else {
                              field.onChange(field.value?.filter((val) => val !== value) || [])
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`mediador-${mediador.id}`} className="text-sm">
                          {mediador.nombre}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Peritos */}
          <FormField
            control={form.control}
            name="peritos"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Peritos</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {formData.peritos.map((perito) => (
                      <div key={perito.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`perito-${perito.id}`}
                          value={perito.id}
                          checked={field.value?.includes(perito.id)}
                          onChange={(e) => {
                            const value = e.target.value
                            const isChecked = e.target.checked

                            if (isChecked) {
                              field.onChange([...(field.value || []), value])
                            } else {
                              field.onChange(field.value?.filter((val) => val !== value) || [])
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`perito-${perito.id}`} className="text-sm">
                          {perito.nombre}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/expedientes")} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : initialData ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
