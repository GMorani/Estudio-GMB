"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// Esquema de validación
const tareaSchema = z.object({
  descripcion: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  fecha_vencimiento: z.date().nullable(),
  expediente_id: z.string().min(1, "Debes seleccionar un expediente"),
  prioridad: z.enum(["baja", "media", "alta"]),
  cumplida: z.boolean().default(false),
  notas: z.string().optional(),
})

type TareaFormValues = z.infer<typeof tareaSchema>

interface TareaFormProps {
  tareaId?: string
  initialData?: any
  onSuccess?: () => void
}

export function TareaForm({ tareaId, initialData, onSuccess }: TareaFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [expedientes, setExpedientes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingExpedientes, setLoadingExpedientes] = useState(true)

  // Configurar el formulario
  const form = useForm<TareaFormValues>({
    resolver: zodResolver(tareaSchema),
    defaultValues: {
      descripcion: initialData?.descripcion || "",
      fecha_vencimiento: initialData?.fecha_vencimiento ? new Date(initialData.fecha_vencimiento) : null,
      expediente_id: initialData?.expediente_id || "",
      prioridad: initialData?.prioridad || "media",
      cumplida: initialData?.cumplida || false,
      notas: initialData?.notas || "",
    },
  })

  // Cargar expedientes para el select
  useEffect(() => {
    async function fetchExpedientes() {
      setLoadingExpedientes(true)
      try {
        const { data, error } = await supabase
          .from("expedientes")
          .select(`
            id,
            numero,
            expediente_personas (
              personas (
                nombre
              )
            )
          `)
          .order("numero")

        if (error) throw error

        // Formatear los datos para el select
        const formattedData = data.map((exp) => {
          const clienteNombre = exp.expediente_personas?.[0]?.personas?.nombre || "Sin cliente"
          return {
            id: exp.id,
            label: `${exp.numero} - ${clienteNombre}`,
          }
        })

        setExpedientes(formattedData)
      } catch (error) {
        console.error("Error al cargar expedientes:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los expedientes",
          variant: "destructive",
        })
      } finally {
        setLoadingExpedientes(false)
      }
    }

    fetchExpedientes()
  }, [supabase, toast])

  // Función para manejar el envío del formulario
  async function onSubmit(values: TareaFormValues) {
    setLoading(true)
    try {
      if (tareaId) {
        // Actualizar tarea existente
        const { error } = await supabase
          .from("tareas_expediente")
          .update({
            descripcion: values.descripcion,
            fecha_vencimiento: values.fecha_vencimiento,
            expediente_id: values.expediente_id,
            prioridad: values.prioridad,
            cumplida: values.cumplida,
            notas: values.notas || null,
          })
          .eq("id", tareaId)

        if (error) throw error

        toast({
          title: "Tarea actualizada",
          description: "La tarea se ha actualizado correctamente",
        })
      } else {
        // Crear nueva tarea
        const { data, error } = await supabase
          .from("tareas_expediente")
          .insert({
            descripcion: values.descripcion,
            fecha_vencimiento: values.fecha_vencimiento,
            expediente_id: values.expediente_id,
            prioridad: values.prioridad,
            cumplida: values.cumplida,
            notas: values.notas || null,
          })
          .select()

        if (error) throw error

        toast({
          title: "Tarea creada",
          description: "La tarea se ha creado correctamente",
        })
      }

      // Llamar a la función de éxito si se proporciona
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error al guardar tarea:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la tarea",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Descripción de la tarea" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="expediente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expediente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loadingExpedientes}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingExpedientes ? "Cargando..." : "Selecciona un expediente"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expedientes.map((exp) => (
                      <SelectItem key={exp.id} value={exp.id}>
                        {exp.label}
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
            name="fecha_vencimiento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de vencimiento</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  disabled={(date) => date < new Date("1900-01-01")}
                />
                <FormDescription>Fecha límite para completar la tarea</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="prioridad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la prioridad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cumplida"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Tarea cumplida</FormLabel>
                  <FormDescription>Marcar si la tarea ya ha sido completada</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas adicionales</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas o comentarios sobre la tarea" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tareaId ? "Actualizar tarea" : "Crear tarea"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
