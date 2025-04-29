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
  fecha_hecho: z.date().optional(),
  mecanica_hecho: z.string().optional(),
  monto_total: z.string().optional(),
  juzgado_id: z.string().optional(),
  objeto: z.string().min(1, "El objeto es obligatorio"),
  autos: z.string().optional(),
  estados: z.array(z.string()).optional().default([]),
  personas: z
    .array(
      z.object({
        id: z.string().min(1, "La persona es obligatoria"),
        rol: z.string().min(1, "El rol es obligatorio"),
        tipo: z.string().optional(),
        relacion_id: z.string().optional(),
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
  { value: "Citada en Garantía", label: "Citada en Garantía" },
]

// Objetos disponibles para los expedientes
const OBJETOS_DISPONIBLES = [{ value: "Daños y Perjuicios", label: "Daños y Perjuicios" }]

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
  const [personasArray, setPersonasArray] = useState<
    { id: string; rol: string; tipo?: string; relacion_id?: string }[]
  >([])
  const [formInitialized, setFormInitialized] = useState(false)
  const [estadosArray, setEstadosArray] = useState<string[]>([])
  const [autosGenerado, setAutosGenerado] = useState("")
  // Almacenar las relaciones entre aseguradoras y demandadas (ya que no existe la columna en la BD)
  const [relacionesAseguradoras, setRelacionesAseguradoras] = useState<Record<string, string>>({})

  // Modificar la función getDefaultValues para asegurar que el objeto se cargue correctamente
  const getDefaultValues = () => {
    try {
      if (expediente) {
        // Agregar log más detallado para depuración
        console.log("Expediente recibido:", expediente)
        console.log("Objeto del expediente:", expediente.objeto, typeof expediente.objeto)

        return {
          numero: expediente.numero || "",
          numero_judicial: expediente.numero_judicial || "",
          fecha_inicio: expediente.fecha_inicio ? new Date(expediente.fecha_inicio) : new Date(),
          fecha_inicio_judicial: expediente.fecha_inicio_judicial
            ? new Date(expediente.fecha_inicio_judicial)
            : undefined,
          fecha_hecho: expediente.fecha_hecho ? new Date(expediente.fecha_hecho) : undefined,
          mecanica_hecho: expediente.mecanica_hecho || "",
          monto_total: expediente.monto_total ? String(expediente.monto_total) : "",
          juzgado_id: expediente.juzgado_id || "",
          // Asegurar que el objeto tenga un valor por defecto válido
          objeto: expediente.objeto || OBJETOS_DISPONIBLES[0].value,
          autos: expediente.autos || "",
          estados: [], // Se actualizará después con useEffect
          personas: [], // Se actualizará después con useEffect
        }
      } else {
        // Valores por defecto para un nuevo expediente
        return {
          numero: "",
          numero_judicial: "",
          fecha_inicio: new Date(),
          fecha_hecho: undefined,
          mecanica_hecho: "",
          monto_total: "",
          juzgado_id: "",
          objeto: OBJETOS_DISPONIBLES[0].value, // Establecer un valor por defecto
          autos: "",
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
        objeto: OBJETOS_DISPONIBLES[0].value, // Establecer un valor por defecto
        autos: "",
        estados: [],
        personas: [],
      }
    }
  }

  const form = useForm<ExpedienteFormValues>({
    resolver: zodResolver(expedienteSchema),
    defaultValues: getDefaultValues(),
  })

  // Reemplazar el useEffect para inicializar el objeto con una versión mejorada
  useEffect(() => {
    if (expediente) {
      console.log("Inicializando objeto del expediente:", expediente.objeto)

      // Asegurar que el objeto se establezca correctamente, incluso si es undefined
      const objetoValue = expediente.objeto || OBJETOS_DISPONIBLES[0].value

      // Establecer el valor inmediatamente
      form.setValue("objeto", objetoValue, {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false,
      })

      // Y también con un pequeño retraso para asegurar que se aplique
      setTimeout(() => {
        form.setValue("objeto", objetoValue, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        })
        console.log("Valor del objeto establecido con retraso:", objetoValue)
      }, 200)
    }
  }, [expediente, form])

  // Extraer estados de manera segura del expediente (solo una vez al inicio)
  useEffect(() => {
    try {
      if (expediente && expediente.expediente_estados && Array.isArray(expediente.expediente_estados)) {
        const estadosIds = expediente.expediente_estados
          .filter((e: any) => e && typeof e === "object" && e.estado_id !== undefined)
          .map((e: any) => String(e.estado_id))

        console.log("Estados extraídos:", estadosIds)
        setEstadosArray(estadosIds)

        // Actualizar el formulario con los estados extraídos
        form.setValue("estados", estadosIds, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        })
      }
    } catch (error) {
      console.error("Error al extraer estados del expediente:", error)
      setEstadosArray([])
    }
  }, [expediente, form])

  // Extraer personas de manera segura del expediente (solo una vez al inicio)
  useEffect(() => {
    try {
      if (expediente) {
        let personasDefault: { id: string; rol: string; tipo?: string; relacion_id?: string }[] = []
        const relacionesTemp: Record<string, string> = {}

        if (expediente.expediente_personas && Array.isArray(expediente.expediente_personas)) {
          personasDefault = expediente.expediente_personas
            .filter((p: any) => p && typeof p === "object" && p.persona_id)
            .map((p: any) => {
              // Determinar el tipo de persona basado en el rol
              let tipo = undefined
              let relacion_id = ""

              if (p.rol === "Citada en Garantía") {
                tipo = "aseguradora"

                // Buscar la relación con la persona demandada
                // Esto es una simulación ya que no tenemos la columna en la BD
                // Podríamos usar metadatos o alguna convención para almacenar esta información

                // Buscar entre las demandadas
                const demandadas = expediente.expediente_personas.filter((d: any) => d && d.rol === "Demandada")

                if (demandadas.length > 0) {
                  // Asumimos que la primera demandada es la relacionada con esta aseguradora
                  relacion_id = demandadas[0].persona_id || ""

                  // Guardar la relación para usarla después
                  if (p.persona_id && relacion_id) {
                    relacionesTemp[p.persona_id] = relacion_id
                  }
                }
              }

              return {
                id: p.persona_id,
                rol: p.rol || "",
                tipo,
                relacion_id,
              }
            })
        }

        // Actualizar el estado de relaciones
        if (Object.keys(relacionesTemp).length > 0) {
          setRelacionesAseguradoras(relacionesTemp)
          console.log("Relaciones de aseguradoras cargadas:", relacionesTemp)
        }

        setPersonasArray(personasDefault)
      }
    } catch (error) {
      console.error("Error al extraer personas del expediente:", error)
      setPersonasArray([])
    }
  }, [expediente])

  // Actualizar el campo personas del formulario cuando cambie personasArray
  useEffect(() => {
    if (personasArray.length > 0) {
      form.setValue("personas", personasArray, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    }
    setFormInitialized(true)
  }, [personasArray, form])

  // Generar automáticamente el campo "Autos" cuando cambien las personas o el objeto
  useEffect(() => {
    try {
      const personas = form.watch("personas") || []
      const objeto = form.watch("objeto") || ""

      // Buscar la persona con rol "Actora"
      const actora = personas.find((p) => p.rol === "Actora")
      // Buscar la persona con rol "Demandada"
      const demandada = personas.find((p) => p.rol === "Demandada")

      let nombreActora = ""
      let nombreDemandada = ""

      // Obtener el nombre de la actora
      if (actora && actora.id) {
        const personaActora = getAllPersonas().find((p) => p.id === actora.id)
        if (personaActora) {
          nombreActora = personaActora.nombre
        }
      }

      // Obtener el nombre de la demandada
      if (demandada && demandada.id) {
        const personaDemandada = getAllPersonas().find((p) => p.id === demandada.id)
        if (personaDemandada) {
          nombreDemandada = personaDemandada.nombre
        }
      }

      // Generar el texto de "Autos"
      let autos = ""
      if (nombreActora) {
        autos = nombreActora
        if (nombreDemandada) {
          autos += " C/ " + nombreDemandada
        }
        if (objeto) {
          autos += " S/ " + objeto
        }
      }

      setAutosGenerado(autos)

      // Actualizar el campo "autos" en el formulario
      if (autos) {
        form.setValue("autos", autos, {
          shouldValidate: false,
          shouldDirty: true,
          shouldTouch: true,
        })
      }
    } catch (error) {
      console.error("Error al generar autos:", error)
    }
  }, [form.watch("personas"), form.watch("objeto"), form])

  // Manejar cambios en el monto para formatear automáticamente
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // Eliminar cualquier carácter que no sea un número
      const rawValue = e.target.value.replace(/[^\d]/g, "")

      if (rawValue) {
        // Convertir a número
        const numberValue = Number.parseInt(rawValue, 10)

        // Guardar el valor numérico en el formulario
        form.setValue("monto_total", String(numberValue))
      } else {
        // Si está vacío, establecer como cadena vacía
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
      form.setValue("personas", updatedPersonas, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    } catch (error) {
      console.error("Error al eliminar persona:", error)
    }
  }

  // Actualizar persona en el expediente
  const updatePersona = (index: number, field: "id" | "rol" | "relacion_id", value: string) => {
    try {
      const updatedPersonas = [...personasArray]
      if (updatedPersonas[index]) {
        updatedPersonas[index] = {
          ...updatedPersonas[index],
          [field]: value,
        }
        setPersonasArray(updatedPersonas)

        // Si estamos actualizando la relación, guardarla en el estado local
        if (field === "relacion_id" && updatedPersonas[index].id) {
          setRelacionesAseguradoras({
            ...relacionesAseguradoras,
            [updatedPersonas[index].id]: value,
          })
        }

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
        objeto: data.objeto,
        autos: data.autos,
      }

      // Almacenar los datos adicionales en localStorage para referencia futura
      // Esto es opcional y se puede eliminar si no se necesita
      if (data.fecha_hecho || data.mecanica_hecho) {
        try {
          const datosAdicionales = {
            fecha_hecho: data.fecha_hecho?.toISOString() || null,
            mecanica_hecho: data.mecanica_hecho || null,
          }

          // Guardar en localStorage usando el número de expediente como clave
          localStorage.setItem(`expediente_adicional_${data.numero}`, JSON.stringify(datosAdicionales))
        } catch (error) {
          console.log("No se pudieron guardar los datos adicionales en localStorage", error)
        }
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
      if (data.estados && data.estados.length > 0) {
        const estadosData = data.estados.map((estadoId) => ({
          expediente_id: expedienteId,
          estado_id: Number.parseInt(estadoId, 10),
        }))

        if (estadosData.length > 0) {
          const { error: insertEstadosError } = await supabase.from("expediente_estados").insert(estadosData)

          if (insertEstadosError) throw insertEstadosError
        }
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
      // IMPORTANTE: Eliminamos relacion_id del objeto que se envía a la base de datos
      const personasData = data.personas
        .filter((p) => p && p.id && p.id.trim() !== "" && p.rol && p.rol.trim() !== "") // Filtrar entradas vacías o inválidas
        .map(({ id, rol }) => ({
          // Desestructuramos para solo tomar id y rol
          expediente_id: expedienteId,
          persona_id: id,
          rol: rol,
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

      // 5. Almacenar las relaciones en algún lugar (por ejemplo, en localStorage o en una tabla separada)
      // Esto es opcional y se puede implementar más adelante si es necesario
      console.log("Relaciones de aseguradoras:", relacionesAseguradoras)

      toast({
        title: expediente ? "Expediente actualizado" : "Expediente creado",
        description: expediente
          ? "El expediente ha sido actualizado correctamente"
          : "El expediente ha sido creado correctamente",
      })

      // Redirigir a la página del expediente específico si estamos editando
      // o a la lista de expedientes si estamos creando uno nuevo
      if (expediente && expediente.id) {
        router.push(`/expedientes/${expediente.id}`)
      } else {
        router.push("/expedientes")
      }

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

  // Modificar el renderizado del campo objeto para asegurar que muestre el valor correcto
  // Cargar datos adicionales desde localStorage
  useEffect(() => {
    if (expediente && expediente.numero) {
      try {
        const key = `expediente_adicional_${expediente.numero}`
        const storedData = localStorage.getItem(key)

        if (storedData) {
          const parsedData = JSON.parse(storedData)

          // Establecer fecha del hecho si existe
          if (parsedData.fecha_hecho) {
            form.setValue("fecha_hecho", new Date(parsedData.fecha_hecho), {
              shouldValidate: false,
              shouldDirty: true,
            })
          }

          // Establecer mecánica del hecho si existe
          if (parsedData.mecanica_hecho) {
            form.setValue("mecanica_hecho", parsedData.mecanica_hecho, {
              shouldValidate: false,
              shouldDirty: true,
            })
          }
        }
      } catch (error) {
        console.error("Error al cargar datos adicionales:", error)
      }
    }
  }, [expediente, form])

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

                  {/* Fecha del Hecho */}
                  <FormField
                    control={form.control}
                    name="fecha_hecho"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha del Hecho</FormLabel>
                        <DatePicker
                          date={field.value}
                          setDate={(date) => {
                            field.onChange(date)
                            // Guardar inmediatamente en localStorage
                            try {
                              const expedienteNum = form.getValues("numero")
                              if (expedienteNum) {
                                const key = `expediente_adicional_${expedienteNum}`
                                const existingData = localStorage.getItem(key)
                                const parsedData = existingData ? JSON.parse(existingData) : {}
                                localStorage.setItem(
                                  key,
                                  JSON.stringify({
                                    ...parsedData,
                                    fecha_hecho: date ? date.toISOString() : null,
                                  }),
                                )
                              }
                            } catch (error) {
                              console.error("Error al guardar fecha del hecho:", error)
                            }
                          }}
                        />
                        <FormDescription>Este campo se guarda localmente y estará disponible al editar</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mecánica del Hecho */}
                  <FormField
                    control={form.control}
                    name="mecanica_hecho"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Mecánica del Hecho</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              // Guardar inmediatamente en localStorage
                              try {
                                const expedienteNum = form.getValues("numero")
                                if (expedienteNum) {
                                  const key = `expediente_adicional_${expedienteNum}`
                                  const existingData = localStorage.getItem(key)
                                  const parsedData = existingData ? JSON.parse(existingData) : {}
                                  localStorage.setItem(
                                    key,
                                    JSON.stringify({
                                      ...parsedData,
                                      mecanica_hecho: e.target.value,
                                    }),
                                  )
                                }
                              } catch (error) {
                                console.error("Error al guardar mecánica del hecho:", error)
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>Describa cómo ocurrió el hecho (se guarda localmente)</FormDescription>
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
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              {...field}
                              className="pl-7"
                              onChange={(e) => {
                                field.onChange(e)
                                handleMontoChange(e)
                              }}
                              value={
                                field.value
                                  ? new Intl.NumberFormat("es-AR").format(Number.parseInt(field.value, 10))
                                  : ""
                              }
                              placeholder="0"
                              inputMode="numeric"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Ingrese el monto total en pesos</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Objeto */}
                  <FormField
                    control={form.control}
                    name="objeto"
                    render={({ field }) => {
                      // Asegurarnos de que el valor del objeto se muestre correctamente
                      console.log("Renderizando campo objeto con valor:", field.value)

                      // Asegurar que siempre haya un valor válido
                      const currentValue = field.value || OBJETOS_DISPONIBLES[0].value

                      return (
                        <FormItem>
                          <FormLabel>
                            Objeto <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select value={currentValue} onValueChange={field.onChange} defaultValue={currentValue}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue>
                                  {OBJETOS_DISPONIBLES.find((obj) => obj.value === currentValue)?.label || currentValue}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {OBJETOS_DISPONIBLES.map((objeto) => (
                                <SelectItem key={objeto.value} value={objeto.value}>
                                  {objeto.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Este campo es obligatorio</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  {/* Autos (generado automáticamente) */}
                  <FormField
                    control={form.control}
                    name="autos"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Autos (Nombre del expediente)</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-muted" />
                        </FormControl>
                        <FormDescription>
                          Este campo se genera automáticamente a partir de la Actora, Demandada y Objeto
                        </FormDescription>
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
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Estados del expediente</FormLabel>
                        <FormDescription>Seleccione los estados actuales del expediente</FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {estados.map((estado) => {
                          // Convertir el ID a string para comparación consistente
                          const estadoId = String(estado.id)
                          // Verificar si este estado está en el array de estados seleccionados
                          const isChecked = field.value?.includes(estadoId)

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
                                  checked={field.value?.includes(estadoId)}
                                  onCheckedChange={(checked) => {
                                    // Obtener el valor actual como array
                                    const currentValue = Array.isArray(field.value) ? [...field.value] : []

                                    // Convertir todos los valores a string para comparación consistente
                                    const stringValues = currentValue.map((v) => String(v))

                                    if (checked) {
                                      // Si no está incluido, agregarlo
                                      if (!stringValues.includes(estadoId)) {
                                        field.onChange([...currentValue, estadoId])
                                      }
                                    } else {
                                      // Filtrar el valor
                                      field.onChange(currentValue.filter((v) => String(v) !== estadoId))
                                    }

                                    // Forzar la actualización del formulario
                                    setTimeout(() => {
                                      console.log("Estados actualizados:", field.value)
                                    }, 0)
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{estado.nombre}</FormLabel>
                            </FormItem>
                          )
                        })}
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
                  <div className="flex gap-2">
                    <Button type="button" onClick={addPersona} variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Agregar persona
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        // Agregar una aseguradora como persona con rol predefinido
                        const newPersona = { id: "", rol: "Citada en Garantía", tipo: "aseguradora", relacion_id: "" }
                        const updatedPersonas = [...personasArray, newPersona]
                        setPersonasArray(updatedPersonas)

                        // Actualizar explícitamente el campo personas en el formulario
                        form.setValue("personas", updatedPersonas, {
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true,
                        })

                        // Cambiar a la pestaña de personas si no está activa
                        if (activeTab !== "personas") {
                          setActiveTab("personas")
                        }
                      }}
                      variant="outline"
                      className="bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                    >
                      <PlusCircle className="mr-2 h-4 w-4 text-blue-600" />
                      Agregar aseguradora
                    </Button>
                  </div>
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
                      <h4 className="font-medium">
                        {persona.tipo === "aseguradora" ? "Aseguradora" : `Persona ${index + 1}`}
                      </h4>
                      <Button type="button" onClick={() => removePersona(index)} variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Selector de Persona */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {persona.tipo === "aseguradora" ? "Aseguradora" : "Persona"}
                        </label>
                        <Select value={persona.id} onValueChange={(value) => updatePersona(index, "id", value)}>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={`Seleccionar ${persona.tipo === "aseguradora" ? "aseguradora" : "persona"}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {persona.tipo === "aseguradora"
                              ? aseguradoras.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.nombre}
                                  </SelectItem>
                                ))
                              : getAllPersonas().map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.nombre} ({p.tipo})
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.personas?.[index]?.id && (
                          <p className="text-sm text-destructive">
                            {persona.tipo === "aseguradora" ? "La aseguradora" : "La persona"} es obligatoria
                          </p>
                        )}
                      </div>

                      {/* Selector de Rol */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rol</label>
                        {persona.tipo === "aseguradora" ? (
                          <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                            Citada en Garantía
                          </div>
                        ) : (
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
                        )}
                        {form.formState.errors.personas?.[index]?.rol && (
                          <p className="text-sm text-destructive">El rol es obligatorio</p>
                        )}
                      </div>

                      {/* Selector de Relación (solo para aseguradoras) */}
                      {persona.tipo === "aseguradora" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Relación</label>
                          <Select
                            value={persona.relacion_id || ""}
                            onValueChange={(value) => updatePersona(index, "relacion_id", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar demandada" />
                            </SelectTrigger>
                            <SelectContent>
                              {personasArray
                                .filter((p, i) => p.rol === "Demandada" && i !== index)
                                .map((p, i) => {
                                  const personaInfo = getAllPersonas().find((persona) => persona.id === p.id)
                                  return (
                                    <SelectItem key={`${p.id}-${i}`} value={p.id}>
                                      {personaInfo ? personaInfo.nombre : "Persona sin nombre"}
                                    </SelectItem>
                                  )
                                })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  expediente ? router.push(`/expedientes/${expediente.id}`) : router.push("/expedientes")
                }
              >
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
