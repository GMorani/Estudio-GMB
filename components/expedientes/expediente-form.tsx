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
  fecha_inicio: z.date({
    required_error: "La fecha de inicio es obligatoria",
  }),
  fecha_inicio_judicial: z.date().optional(),
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

// Roles disponibles para las personas
const ROLES_DISPONIBLES = [
  { value: "Actora", label: "Actora" },
  { value: "Demandada", label: "Demandada" },
  { value: "Tercero", label: "Tercero" },
  { value: "Abogado Actora", label: "Abogado Actora" },
  { value: "Abogado Demandada", label: "Abogado Demandada" },
  { value: "Mediador", label: "Mediador" },
  { value: "Perito", label: "Perito" },
]

export function ExpedienteForm({
  expediente,
  juzgados = [],
  estados = [],
  clientes = [],
  abogados = [],
  aseguradoras = [],
  mediadores = [],
  peritos = [],
}: ExpedienteFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [activeTab, setActiveTab] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [personasArray, setPersonasArray] = useState<{ id: string; rol: string }[]>([])
  const [formInitialized, setFormInitialized] = useState(false)

  // Extraer personas de manera segura del expediente (solo una vez al inicio)
  useEffect(() => {
    try {
      if (expediente) {
        let personasDefault: { id: string; rol: string }[] = []
        if (expediente.expediente_personas && Array.isArray(expediente.expediente_personas)) {
          personasDefault = expediente.expediente_personas
            .filter((p: any) => p && typeof p === "object" && p.persona_id)
            .map((p: any) => ({
              id: p.persona_id,
              rol: p.rol || "",
            }))
        }
        setPersonasArray(personasDefault)
      }
    } catch (error) {
      console.error("Error al extraer personas del expediente:", error)
      setPersonasArray([])
    }
  }, [expediente])

  // Preparar valores por defecto de manera segura
  const getDefaultValues = () => {
    try {
      if (expediente) {
        // Extraer estados de manera segura
        let estadosDefault: string[] = []
        if (expediente.expediente_estados && Array.isArray(expediente.expediente_estados)) {
          estadosDefault = expediente.expediente_estados
            .filter(
              (e: any) => e && typeof e === "object" && e.estados_expediente && e.estados_expediente.id !== undefined,
            )
            .map((e: any) => String(e.estados_expediente.id))
        }

        return {
          numero: expediente.numero || "",
          numero_judicial: expediente.numero_judicial || "",
          fecha_inicio: expediente.fecha_inicio ? new Date(expediente.fecha_inicio) : new Date(),
          fecha_inicio_judicial: expediente.fecha_inicio_judicial
            ? new Date(expediente.fecha_inicio_judicial)
            : undefined,
          monto_total: expediente.monto_total ? String(expediente.monto_total) : "",
          juzgado_id: expediente.juzgado_id || "",
          estados: estadosDefault,
          personas: [], // Inicialmente vacío, se actualizará después
        }
      } else {
        // Valores por defecto para un nuevo expediente
        return {
          numero: "",
          numero_judicial: "",
          fecha_inicio: new Date(),
          monto_total: "",
          juzgado_id: "",
          estados: [],
          personas: [],
        }
      }
    } catch (error) {
      console.error("Error al preparar valores por defecto:", error)
      // En caso de error, devolver valores por defecto básicos
      return {
        numero: "",
        numero_judicial: "",
        fecha_inicio: new Date(),
        monto_total: "",
        juzgado_id: "",
        estados: [],
        personas: [],
      }
    }
  }

  const form = useForm<ExpedienteFormValues>({
    resolver: zodResolver(expedienteSchema),
    defaultValues: getDefaultValues(),
  })

  // Actualizar el campo personas del formulario cuando cambie personasArray
  useEffect(() => {
    if (personasArray.length > 0) {
      form.setValue("personas", personasArray)
    }
    setFormInitialized(true)
  }, [personasArray, form])

  // Manejar cambios en el monto para formatear automáticamente
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value.replace(/[^\d]/g, "")
      if (value) {
        const numberValue = Number.parseInt(value, 10)
        form.setValue("monto_total", String(numberValue))
      } else {
        form.setValue("monto_total", "")
      }
    } catch (error) {
      console.error("Error al manejar cambio de monto:", error)
    }
  }

  // Agregar persona al expediente
  const addPersona = () => {
    try {
      const newPersona = { id: "", rol: "" }
      const updatedPersonas = [...personasArray, newPersona]
      setPersonasArray(updatedPersonas)

      // Actualizar explícitamente el campo personas en el formulario
      form.setValue("personas", updatedPersonas, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    } catch (error) {
      console.error("Error al agregar persona:", error)
    }
  }

  // Eliminar persona del expediente
  const removePersona = (index: number) => {
    try {
      const updatedPersonas = personasArray.filter((_, i) => i !== index)
      setPersonasArray(updatedPersonas)
      form.setValue("personas", updatedPersonas)
    } catch (error) {
      console.error("Error al eliminar persona:", error)
    }
  }

  // Actualizar persona en el expediente
  const updatePersona = (index: number, field: "id" | "rol", value: string) => {
    try {
      const updatedPersonas = [...personasArray]
      if (updatedPersonas[index]) {
        updatedPersonas[index] = {
          ...updatedPersonas[index],
          [field]: value,
        }
        setPersonasArray(updatedPersonas)

        // Actualizar explícitamente el campo personas en el formulario
        form.setValue("personas", updatedPersonas, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        })
      }
    } catch (error) {
      console.error(`Error al actualizar ${field} de persona:`, error)
    }
  }

  // Preparar lista de todas las personas disponibles
  const getAllPersonas = () => {
    try {
      const allPersonas = []

      // Agregar clientes si existen
      if (clientes && Array.isArray(clientes)) {
        for (const cliente of clientes) {
          if (cliente && typeof cliente === "object" && cliente.id && cliente.nombre) {
            allPersonas.push({ ...cliente, tipo: "Cliente" })
          }
        }
      }

      // Agregar abogados si existen
      if (abogados && Array.isArray(abogados)) {
        for (const abogado of abogados) {
          if (abogado && typeof abogado === "object" && abogado.id && abogado.nombre) {
            allPersonas.push({ ...abogado, tipo: "Abogado" })
          }
        }
      }

      // Agregar aseguradoras si existen
      if (aseguradoras && Array.isArray(aseguradoras)) {
        for (const aseguradora of aseguradoras) {
          if (aseguradora && typeof aseguradora === "object" && aseguradora.id && aseguradora.nombre) {
            allPersonas.push({ ...aseguradora, tipo: "Aseguradora" })
          }
        }
      }

      // Agregar mediadores si existen
      if (mediadores && Array.isArray(mediadores)) {
        for (const mediador of mediadores) {
          if (mediador && typeof mediador === "object" && mediador.id && mediador.nombre) {
            allPersonas.push({ ...mediador, tipo: "Mediador" })
          }
        }
      }

      // Agregar peritos si existen
      if (peritos && Array.isArray(peritos)) {
        for (const perito of peritos) {
          if (perito && typeof perito === "object" && perito.id && perito.nombre) {
            allPersonas.push({ ...perito, tipo: "Perito" })
          }
        }
      }

      return allPersonas
    } catch (error) {
      console.error("Error al obtener todas las personas:", error)
      return []
    }
  }

  // Verificar si el número de expediente ya existe
  const checkNumeroExists = async (numero: string): Promise<boolean> => {
    try {
      if (!numero) return false

      // Si estamos editando un expediente existente y el número no ha cambiado, no es un duplicado
      if (expediente && expediente.numero === numero) return false

      const { data, error } = await supabase.from("expedientes").select("id").eq("numero", numero).maybeSingle()

      if (error) {
        console.error("Error al verificar número de expediente:", error)
        return false
      }

      return !!data
    } catch (error) {
      console.error("Error al verificar número de expediente:", error)
      return false
    }
  }

  async function onSubmit(data: ExpedienteFormValues) {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      // Verificar si el número de expediente ya existe
      const numeroExists = await checkNumeroExists(data.numero)
      if (numeroExists) {
        toast({
          title: "Error",
          description: `El número de expediente ${data.numero} ya existe. Por favor, utilice otro número.`,
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // 1. Crear o actualizar expediente
      const expedienteData = {
        numero: data.numero,
        numero_judicial: data.numero_judicial || null,
        fecha_inicio: data.fecha_inicio.toISOString(),
        fecha_inicio_judicial: data.fecha_inicio_judicial?.toISOString() || null,
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

      // Filtrar y validar personas antes de insertar
      const personasData = data.personas
        .filter((p) => p && p.id && p.id.trim() !== "" && p.rol && p.rol.trim() !== "") // Filtrar entradas vacías o inválidas
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
      setIsSubmitting(false)
    }
  }

  // Si el formulario aún no está inicializado, mostrar un estado de carga
  if (!formInitialized && expediente) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <p>Cargando formulario...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit(onSubmit)(e)
            }}
            className="space-y-6"
          >
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
                          <Input {...field} placeholder="Ej: 0145-2023" />
                        </FormControl>
                        <FormDescription>Ingrese un número único para identificar este expediente</FormDescription>
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
                        <FormLabel>
                          Fecha de inicio <span className="text-destructive">*</span>
                        </FormLabel>
                        <DatePicker date={field.value} setDate={field.onChange} />
                        <FormDescription>Este campo es obligatorio</FormDescription>
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

                {personasArray.length === 0 && (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground">No hay personas vinculadas</p>
                    <Button type="button" onClick={addPersona} variant="link">
                      Agregar persona
                    </Button>
                  </div>
                )}

                {personasArray.map((persona, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Persona {index + 1}</h4>
                      <Button type="button" onClick={() => removePersona(index)} variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Selector de Persona */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Persona</label>
                        <Select value={persona.id} onValueChange={(value) => updatePersona(index, "id", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar persona" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAllPersonas().map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nombre} ({p.tipo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.personas?.[index]?.id && (
                          <p className="text-sm text-destructive">La persona es obligatoria</p>
                        )}
                      </div>

                      {/* Selector de Rol */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rol</label>
                        <Select value={persona.rol} onValueChange={(value) => updatePersona(index, "rol", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES_DISPONIBLES.map((rol) => (
                              <SelectItem key={rol.value} value={rol.value}>
                                {rol.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.personas?.[index]?.rol && (
                          <p className="text-sm text-destructive">El rol es obligatorio</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/expedientes")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : expediente ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
