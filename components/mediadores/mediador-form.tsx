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

const mediadorFormSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  telefono: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  entidad: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
})

type MediadorFormValues = z.infer<typeof mediadorFormSchema>

interface MediadorFormProps {
  mediador?: MediadorFormValues & { id: string }
}

export function MediadorForm({ mediador }: MediadorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const defaultValues: Partial<MediadorFormValues> = {
    nombre: mediador?.nombre || "",
    telefono: mediador?.telefono || "",
    email: mediador?.email || "",
    entidad: mediador?.entidad || "",
    direccion: mediador?.direccion || "",
    notas: mediador?.notas || "",
  }

  const form = useForm<MediadorFormValues>({
    resolver: zodResolver(mediadorFormSchema),
    defaultValues,
  })

  async function onSubmit(data: MediadorFormValues) {
    setIsSubmitting(true)

    try {
      if (mediador?.id) {
        // Actualizar mediador existente
        const { error } = await supabase.from("mediadores").update(data).eq("id", mediador.id)

        if (error) throw error

        toast({
          title: "Mediador actualizado",
          description: "Los datos del mediador han sido actualizados correctamente.",
        })

        router.push(`/mediadores/${mediador.id}`)
      } else {
        // Crear nuevo mediador
        const { data: newMediador, error } = await supabase.from("mediadores").insert(data).select().single()

        if (error) throw error

        toast({
          title: "Mediador creado",
          description: "El mediador ha sido creado correctamente.",
        })

        router.push(`/mediadores/${newMediador.id}`)
      }
    } catch (error) {
      console.error("Error al guardar mediador:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el mediador. Por favor, inténtalo de nuevo.",
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
          name="entidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entidad</FormLabel>
              <FormControl>
                <Input placeholder="Entidad a la que pertenece" {...field} />
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
            {isSubmitting ? "Guardando..." : mediador?.id ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
