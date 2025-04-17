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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { formatTelefono } from "@/lib/utils"

// Esquema de validación
const juzgadoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  domicilio: z.string().min(1, "La dirección es obligatoria"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
})

type JuzgadoFormValues = z.infer<typeof juzgadoSchema>

type JuzgadoFormProps = {
  juzgado?: any
}

export function JuzgadoForm({ juzgado }: JuzgadoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [dominioEmail, setDominioEmail] = useState<string>("@gmail.com")
  const [emailPersonalizado, setEmailPersonalizado] = useState<boolean>(false)

  // Valores por defecto
  const defaultValues: Partial<JuzgadoFormValues> = juzgado
    ? {
        nombre: juzgado.nombre,
        domicilio: juzgado.domicilio,
        telefono: juzgado.telefono,
        email: juzgado.email,
      }
    : {
        nombre: "",
        domicilio: "",
        telefono: "",
        email: "",
      }

  const form = useForm<JuzgadoFormValues>({
    resolver: zodResolver(juzgadoSchema),
    defaultValues,
  })

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

  async function onSubmit(data: JuzgadoFormValues) {
    try {
      // 1. Crear o actualizar en la tabla personas
      const personaData = {
        nombre: data.nombre,
        dni_cuit: "", // Los juzgados no tienen DNI/CUIT
        domicilio: data.domicilio,
        telefono: data.telefono.replace(/-/g, ""), // Eliminar guiones
        email: data.email,
        tipo_id: 4, // Tipo juzgado
      }

      let personaId

      if (juzgado) {
        // Actualizar persona existente
        const { error: updateError } = await supabase.from("personas").update(personaData).eq("id", juzgado.id)

        if (updateError) throw updateError
        personaId = juzgado.id
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

      // 2. Crear o actualizar en la tabla juzgados
      const juzgadoData = {
        id: personaId,
      }

      if (juzgado) {
        // Verificar si ya existe en la tabla juzgados
        const { data: existingJuzgado } = await supabase.from("juzgados").select("id").eq("id", personaId).maybeSingle()

        if (!existingJuzgado) {
          // Crear registro en juzgados si no existe
          const { error: insertJuzgadoError } = await supabase.from("juzgados").insert(juzgadoData)
          if (insertJuzgadoError) throw insertJuzgadoError
        }
      } else {
        // Crear nuevo juzgado
        const { error: insertJuzgadoError } = await supabase.from("juzgados").insert(juzgadoData)
        if (insertJuzgadoError) throw insertJuzgadoError
      }

      toast({
        title: juzgado ? "Juzgado actualizado" : "Juzgado creado",
        description: juzgado
          ? "El juzgado ha sido actualizado correctamente"
          : "El juzgado ha sido creado correctamente",
      })

      router.push("/juzgados")
      router.refresh()
    } catch (error) {
      console.error("Error al guardar juzgado:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el juzgado",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nombre del Juzgado</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Juzgado Civil N° 5" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dirección */}
              <FormField
                control={form.control}
                name="domicilio"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Teléfono */}
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
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
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          handleEmailChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/juzgados")}>
                Cancelar
              </Button>
              <Button type="submit">{juzgado ? "Actualizar" : "Guardar"}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
