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
const aseguradoraSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  dni_cuit: z.string().min(1, "El CUIT es obligatorio"),
  domicilio: z.string().min(1, "El domicilio es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
})

type AseguradoraFormValues = z.infer<typeof aseguradoraSchema>

type AseguradoraFormProps = {
  aseguradora?: any
}

export function AseguradoraForm({ aseguradora }: AseguradoraFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [dominioEmail, setDominioEmail] = useState<string>("@gmail.com")
  const [emailPersonalizado, setEmailPersonalizado] = useState<boolean>(false)

  // Valores por defecto
  const defaultValues: Partial<AseguradoraFormValues> = aseguradora
    ? {
        nombre: aseguradora.nombre,
        dni_cuit: aseguradora.dni_cuit,
        domicilio: aseguradora.domicilio,
        telefono: aseguradora.telefono,
        email: aseguradora.email,
      }
    : {
        nombre: "",
        dni_cuit: "",
        domicilio: "",
        telefono: "",
        email: "",
      }

  const form = useForm<AseguradoraFormValues>({
    resolver: zodResolver(aseguradoraSchema),
    defaultValues,
  })

  // Manejar cambios en el CUIT para formatear automáticamente
  const handleCUITChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCUIT = formatDNI(e.target.value)
    form.setValue("dni_cuit", formattedCUIT)
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

  async function onSubmit(data: AseguradoraFormValues) {
    try {
      // 1. Crear o actualizar en la tabla personas
      const personaData = {
        nombre: data.nombre,
        dni_cuit: data.dni_cuit.replace(/\./g, ""), // Eliminar puntos
        domicilio: data.domicilio,
        telefono: data.telefono.replace(/-/g, ""), // Eliminar guiones
        email: data.email,
        tipo_id: 3, // Tipo aseguradora
      }

      let personaId

      if (aseguradora) {
        // Actualizar persona existente
        const { error: updateError } = await supabase.from("personas").update(personaData).eq("id", aseguradora.id)

        if (updateError) throw updateError
        personaId = aseguradora.id
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

      // 2. Crear o actualizar en la tabla aseguradoras
      const aseguradoraData = {
        id: personaId,
      }

      if (aseguradora) {
        // Verificar si ya existe en la tabla aseguradoras
        const { data: existingAseguradora } = await supabase
          .from("aseguradoras")
          .select("id")
          .eq("id", personaId)
          .maybeSingle()

        if (!existingAseguradora) {
          // Crear registro en aseguradoras si no existe
          const { error: insertAseguradoraError } = await supabase.from("aseguradoras").insert(aseguradoraData)
          if (insertAseguradoraError) throw insertAseguradoraError
        }
      } else {
        // Crear nueva aseguradora
        const { error: insertAseguradoraError } = await supabase.from("aseguradoras").insert(aseguradoraData)
        if (insertAseguradoraError) throw insertAseguradoraError
      }

      toast({
        title: aseguradora ? "Aseguradora actualizada" : "Aseguradora creada",
        description: aseguradora
          ? "La aseguradora ha sido actualizada correctamente"
          : "La aseguradora ha sido creada correctamente",
      })

      router.push("/aseguradoras")
      router.refresh()
    } catch (error) {
      console.error("Error al guardar aseguradora:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la aseguradora",
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
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CUIT */}
              <FormField
                control={form.control}
                name="dni_cuit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CUIT</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          handleCUITChange(e)
                        }}
                        placeholder="XX-XXXXXXXX-X"
                      />
                    </FormControl>
                    <FormDescription>Formato: XX-XXXXXXXX-X</FormDescription>
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
              <Button type="button" variant="outline" onClick={() => router.push("/aseguradoras")}>
                Cancelar
              </Button>
              <Button type="submit">{aseguradora ? "Actualizar" : "Guardar"}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
