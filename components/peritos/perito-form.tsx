"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const peritoFormSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  telefono: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  especialidad: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
})

type PeritoFormValues = z.infer<typeof peritoFormSchema>

interface PeritoFormProps {
  perito?: PeritoFormValues & { id: string }
}

export function PeritoForm({ perito }: PeritoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const defaultValues: Partial<PeritoFormValues> = {
    nombre: perito?.nombre || "",
    telefono: perito?.telefono || "",
    email: perito?.email || "",
    especialidad: perito?.especialidad || "",
    direccion: perito?.direccion || "",
    notas: perito?.notas || "",
  }

  const form = useForm<PeritoFormValues>({
    resolver: zodResolver(peritoFormSchema),
    defaultValues,
  })

  async function onSubmit(data: PeritoFormValues) {
    setIsSubmitting(true)

    try {
      if (perito?.id) {
        // Actualizar perito existente
        const { error } = await supabase.from("peritos").update(data).eq("id", perito.id)

        if (error) throw error

        toast({
          title: "Perito actualizado",
          description: "Los datos del perito han sido actualizados correctamente.",
        })

        router.push(`/peritos/${perito.id}`)
      } else {
        // Crear nuevo perito
        const { data: newPerito, error } = await supabase.from("peritos").insert(data).select().single()

        if (error) throw error

        toast({
          title: "Perito creado",
          description: "El perito ha sido creado correctamente.",
        })

        router.push(`/peritos/${newPerito.id}`)
      }
    } catch (error) {
      console.error("Error al guardar perito:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el perito. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Teléfono de contacto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email de contacto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="especialidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidad</FormLabel>
              <FormControl>
                <Input placeholder="Especialidad del perito" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Dirección" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas adicionales" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : perito?.id ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
