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
import { formatDNI, formatTelefono } from "@/lib/utils"

// Esquema de validación
const mediadorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  dni_cuit: z.string().min(1, "El DNI es obligatorio"),
  domicilio: z.string().min(1, "El domicilio es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
})

type MediadorFormValues = z.infer<typeof mediadorSchema>

type MediadorFormProps = {
  mediador?: any
}

export function MediadorForm({ mediador }: MediadorFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [dominioEmail, setDominioEmail] = useState<string>("@gmail.com")
  const [emailPersonalizado, setEmailPersonalizado] = useState<boolean>(false)

  // Valores por defecto
  const defaultValues: Partial<MediadorFormValues> = mediador
    ? {
        nombre: mediador.nombre,
        dni_cuit: mediador.dni_cuit,
        domicilio: mediador.domicilio,
        telefono: mediador.telefono,
        email: mediador.email,
      }
    : {
        nombre: "",
        dni_cuit: "",
        domicilio: "",
        telefono: "",
        email: "",
      }

  const form = useForm<MediadorFormValues>({
    resolver: zodResolver(mediadorSchema),
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

  async function onSubmit(data: MediadorFormValues) {
    try {
      // 1. Crear o actualizar en la tabla personas
      const personaData = {
        nombre: data.nombre,
        dni_cuit: data.dni_cuit.replace(/\./g, ""), // Eliminar puntos
        domicilio: data.domicilio,
        telefono: data.telefono.replace(/-/g, ""), // Eliminar guiones
        email: data.email,
        tipo_id: 5, // Tipo mediador
      }

      let personaId

      if (mediador) {
        // Actualizar persona existente
        const { error: updateError } = await supabase.from("personas").update(personaData).eq("id", mediador.id)

        if (updateError) throw updateError
        personaId = mediador.id
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

      // 2. Crear o actualizar en la tabla mediadores
      const mediadorData = {
        id: personaId,
      }

      if (mediador) {
        // Verificar si ya existe en la tabla mediadores
        const { data: existingMediador } = await supabase
          .from("mediadores")
          .select("id")
          .eq("id", personaId)
          .maybeSingle()

        if (!existingMediador) {
          // Crear registro en mediadores si no existe
          const { error: insertMediadorError } = await supabase.from("mediadores").insert(mediadorData)
          if (insertMediadorError) throw insertMediadorError
        }
      } else {
        // Crear nuevo mediador
        const { error: insertMediadorError } = await supabase.from("mediadores").insert(mediadorData)
        if (insertMediadorError) throw insertMediadorError
      }

      toast({
        title: mediador ? "Mediador actualizado" : "Mediador creado",
        description: mediador
          ? "El mediador ha sido actualizado correctamente"
          : "El mediador ha sido creado correctamente",
      })

      router.push("/mediadores")
      router.refresh()
    } catch (error) {
      console.error("Error al guardar mediador:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el mediador",
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
              <Button type="button" variant="outline" onClick={() => router.push("/mediadores")}>
                Cancelar
              </Button>
              <Button type="submit">{mediador ? "Actualizar" : "Guardar"}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
