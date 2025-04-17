"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Trash2 } from "lucide-react"

// Esquema de validación
const expedienteSchema = z.object({
  numero: z.string().min(1, "El número es obligatorio"),
  numero_judicial: z.string().optional(),
  fecha_inicio: z.date().optional(),
  fecha_inicio_judicial: z.date().optional(),
  // Eliminamos descripcion del esquema ya que no existe en la base de datos
  monto_total: z.string().optional(),
  juzgado_id: z.string().optional(),
  estados: z.array(z.string()).min(1, "Debe seleccionar al menos un estado"),
  personas: z
    .array(
      z.object({
        id: z.string().min(1, "La persona es obligatoria"),
        rol: z.string().min(1, "El rol es obligatorio"),
      }),
    )
    .min(1, "Debe agregar al menos una persona"),
})

type ExpedienteFormValues = z.infer<typeof expedienteSchema>

type Persona = {
  id: string
  nombre: string
}

type Estado = {
  id: number
  nombre: string
  color: string
}

type ExpedienteFormProps = {
  expediente?: any
  juzgados: Persona[]
  estados: Estado[]
  clientes: Persona[]
  abogados: Persona[]
  aseguradoras: Persona[]
  mediadores: Persona[]
  peritos: Persona[]
}

export function ExpedienteForm({
  expediente,
  juzgados,
  estados,
  clientes,
  abogados,
  aseguradoras,
  mediadores,
  peritos,
}: ExpedienteFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [activeTab, setActiveTab] = useState("general")

  // Preparar valores por defecto
  const defaultValues: Partial<ExpedienteFormValues> = expediente
    ? {
        numero: expediente.numero,
        numero_judicial: expediente.numero_judicial || "",
        fecha_inicio: expediente.fecha_inicio ? new Date(expediente.fecha_inicio) : undefined,
        fecha_inicio_judicial: expediente.fecha_inicio_judicial
          ? new Date(expediente.fecha_inicio_judicial)
          : undefined,
        // Eliminamos descripcion de los valores por defecto
        monto_total: expediente.monto_total ? String(expediente.monto_total) : "",
        juzgado_id: expediente.juzgado_id || "",
        estados: expediente.expediente_estados?.map((e: any) => String(e.estados_expediente.id)) || [],
        personas:
          expediente.expediente_personas?.map((p: any) => ({
            id: p.persona_id,
            rol: p.rol,
          })) || [],
      }
    : {
        numero: "",
        numero_judicial: "",
        // Eliminamos descripcion de los valores por defecto
        monto_total: "",
        juzgado_id: "",
        estados: [],
        personas: [],
      }

  const form = useForm<ExpedienteFormValues>({
    resolver: zodResolver(expedienteSchema),
    defaultValues,
  })

  // Manejar cambios en el monto para formatear automáticamente
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "")
    if (value) {
      const numberValue = Number.parseInt(value, 10)
      form.setValue("monto_total", String(numberValue))
    } else {
      form.setValue("monto_total", "")
    }
  }

  // Agregar persona al expediente
  const addPersona = () => {
    const personas = form.getValues("personas") || []
    form.setValue("personas", [...personas, { id: "", rol: "" }])
  }

  // Eliminar persona del expediente
  const removePersona = (index: number) => {
    const personas = form.getValues("personas") || []
    form.setValue(
      "personas",
      personas.filter((_, i) => i !== index),
    )
  }

  // Obtener todas las personas disponibles
  const getAllPersonas = () => {
    return [
      ...clientes.map((c) => ({ ...c, tipo: "Cliente" })),
      ...abogados.map((a) => ({ ...a, tipo: "Abogado" })),
      ...aseguradoras.map((a) => ({ ...a, tipo: "Aseguradora" })),
      ...mediadores.map((m) => ({ ...m, tipo: "Mediador" })),
      ...peritos.map((p) => ({ ...p, tipo: "Perito" })),
    ]
  }

  async function onSubmit(data: ExpedienteFormValues) {
    try {
      // 1. Crear o actualizar expediente
      const expedienteData = {
        numero: data.numero,
        numero_judicial: data.numero_judicial || null,
        fecha_inicio: data.fecha_inicio?.toISOString() || null,
        fecha_inicio_judicial: data.fecha_inicio_judicial?.toISOString() || null,
        // Eliminamos el campo descripcion del objeto que se envía a la base de datos
        monto_total: data.monto_total ? Number.parseInt(data.monto_total, 10) : null,
        juzgado_id: data.juzgado_id === "none" ? null : data.juzgado_id || null,
      }

      let expedienteId

      if (expediente) {
        // Actualizar expediente existente
        const { error: updateError } = await supabase.from("expedientes").update(expedienteData).eq("id", expediente.id)

        if (updateError) throw updateError
        expedienteId = expediente.id
      } else {
        // Crear nuevo expediente
        const { data: newExpediente, error: insertError } = await supabase
          .from("expedientes")
          .insert({ ...expedienteData, fecha_creacion: new Date().toISOString() })
          .select("id")
          .single()

        if (insertError) throw insertError
        expedienteId = newExpediente.id
      }

      // 2. Manejar estados del expediente
      if (expediente) {
        // Eliminar estados existentes
        const { error: deleteEstadosError } = await supabase
          .from("expediente_estados")
          .delete()
          .eq("expediente_id", expedienteId)

        if (deleteEstadosError) throw deleteEstadosError
      }

      // Insertar nuevos estados
      const estadosData = data.estados.map((estadoId) => ({
        expediente_id: expedienteId,
        estado_id: Number.parseInt(estadoId, 10),
        fecha: new Date().toISOString(),
      }))

      if (estadosData.length > 0) {
        const { error: insertEstadosError } = await supabase.from("expediente_estados").insert(estadosData)

        if (insertEstadosError) throw insertEstadosError
      }

      // 3. Manejar personas del expediente
      if (expediente) {
        // Eliminar personas existentes
        const { error: deletePersonasError } = await supabase
          .from("expediente_personas")
          .delete()
          .eq("expediente_id", expedienteId)

        if (deletePersonasError) throw deletePersonasError
      }

      // Insertar nuevas personas
      const personasData = data.personas
        .filter((p) => p.id !== "none" && p.rol !== "none" && p.id && p.rol) // Filtrar entradas vacías o con valores "none"
        .map((persona) => ({
          expediente_id: expedienteId,
          persona_id: persona.id,
          rol: persona.rol,
        }))

      if (personasData.length > 0) {
        const { error: insertPersonasError } = await supabase.from("expediente_personas").insert(personasData)

        if (insertPersonasError) throw insertPersonasError
      }

      // 4. Registrar actividad
      await supabase.from("actividades_expediente").insert({
        expediente_id: expedienteId,
        descripcion: expediente ? `Expediente actualizado: ${data.numero}` : `Expediente creado: ${data.numero}`,
        fecha: new Date().toISOString(),
        automatica: true,
      })

      toast({
        title: expediente ? "Expediente actualizado" : "Expediente creado",
        description: expediente
          ? "El expediente ha sido actualizado correctamente"
          : "El expediente ha sido creado correctamente",
      })

      router.push("/expedientes")
      router.refresh()
    } catch (error) {
      console.error("Error al guardar expediente:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el expediente",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Información General</TabsTrigger>
                <TabsTrigger value="estados">Estados</TabsTrigger>
                <TabsTrigger value="personas">Personas</TabsTrigger>
              </TabsList>

              {/* Pestaña de Información General */}
              <TabsContent value="general" className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Número de expediente */}
                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de expediente</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Número de expediente judicial */}
                  <FormField
                    control={form.control}
                    name="numero_judicial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de expediente judicial</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Fecha de inicio */}
                  <FormField
                    control={form.control}
                    name="fecha_inicio"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de inicio</FormLabel>
                        <DatePicker date={field.value} setDate={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Fecha de inicio judicial */}
                  <FormField
                    control={form.control}
                    name="fecha_inicio_judicial"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de inicio judicial</FormLabel>
                        <DatePicker date={field.value} setDate={field.onChange} />
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
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar juzgado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Sin juzgado</SelectItem>
                            {juzgados.map((juzgado) => (
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

                  {/* Monto total */}
                  <FormField
                    control={form.control}
                    name="monto_total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto total</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              handleMontoChange(e)
                            }}
                            value={field.value ? formatCurrency(Number.parseInt(field.value, 10)) : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Eliminamos el campo de descripción del formulario */}
                </div>
              </TabsContent>

              {/* Pestaña de Estados */}
              <TabsContent value="estados" className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="estados"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Estados del expediente</FormLabel>
                        <FormDescription>Seleccione los estados actuales del expediente</FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {estados.map((estado) => (
                          <FormField
                            key={estado.id}
                            control={form.control}
                            name="estados"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={estado.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                  style={{
                                    borderColor: estado.color,
                                    backgroundColor: `${estado.color}10`,
                                  }}
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(String(estado.id))}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || []
                                        const estadoId = String(estado.id)
                                        if (checked) {
                                          field.onChange([...currentValue, estadoId])
                                        } else {
                                          field.onChange(currentValue.filter((value) => value !== estadoId))
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{estado.nombre}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Pestaña de Personas */}
              <TabsContent value="personas" className="space-y-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Personas vinculadas</h3>
                    <p className="text-sm text-muted-foreground">Agregue las personas relacionadas con el expediente</p>
                  </div>
                  <Button type="button" onClick={addPersona} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar persona
                  </Button>
                </div>

                {form.getValues("personas")?.length === 0 && (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground">No hay personas vinculadas</p>
                    <Button type="button" onClick={addPersona} variant="link">
                      Agregar persona
                    </Button>
                  </div>
                )}

                {form.getValues("personas")?.map((_, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Persona {index + 1}</h4>
                      <Button type="button" onClick={() => removePersona(index)} variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`personas.${index}.id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Persona</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar persona" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Seleccionar persona</SelectItem>
                                {getAllPersonas().map((persona) => (
                                  <SelectItem key={persona.id} value={persona.id}>
                                    {persona.nombre} ({persona.tipo})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`personas.${index}.rol`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Seleccionar rol</SelectItem>
                                <SelectItem value="Actora">Actora</SelectItem>
                                <SelectItem value="Demandada">Demandada</SelectItem>
                                <SelectItem value="Tercero">Tercero</SelectItem>
                                <SelectItem value="Abogado Actora">Abogado Actora</SelectItem>
                                <SelectItem value="Abogado Demandada">Abogado Demandada</SelectItem>
                                <SelectItem value="Mediador">Mediador</SelectItem>
                                <SelectItem value="Perito">Perito</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/expedientes")}>
                Cancelar
              </Button>
              <Button type="submit">{expediente ? "Actualizar" : "Guardar"}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
