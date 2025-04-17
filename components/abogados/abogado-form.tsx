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

// Modificar el esquema de validación para que no incluya campos que podrían no existir
const abogadoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  dni_cuit: z.string().min(1, "El DNI es obligatorio"),
  domicilio: z.string().min(1, "El domicilio es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
})

type AbogadoFormValues = z.infer<typeof abogadoSchema>

type AbogadoFormProps = {
  abogado?: any
}

export function AbogadoForm({ abogado }: AbogadoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [dominioEmail, setDominioEmail] = useState<string>("@gmail.com")
  const [emailPersonalizado, setEmailPersonalizado] = useState<boolean>(false)

  // Modificar los valores por defecto para que no incluyan campos que podrían no existir
  const defaultValues: Partial<AbogadoFormValues> = abogado
    ? {
        nombre: abogado.nombre,
        dni_cuit: abogado.dni_cuit,
        domicilio: abogado.domicilio,
        telefono: abogado.telefono,
        email: abogado.email,
      }
    : {
        nombre: "",
        dni_cuit: "",
        domicilio: "",
        telefono: "",
        email: "",
      }

  const form = useForm<AbogadoFormValues>({
    resolver: zodResolver(abogadoSchema),
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

  // Lista de especialidades comunes
  const especialidades = [
    "Derecho Civil",
    "Derecho Penal",
    "Derecho Laboral",
    "Derecho Comercial",
    "Derecho de Familia",
    "Derecho Administrativo",
    "Derecho Tributario",
    "Derecho Ambiental",
    "Derecho Internacional",
    "Otra",
  ]

  // Modificar la función onSubmit para que no intente guardar campos que podrían no existir
  async function onSubmit(data: AbogadoFormValues) {
    try {
      // 1. Crear o actualizar en la tabla personas
      const personaData = {
        nombre: data.nombre,
        dni_cuit: data.dni_cuit.replace(/\./g, ""), // Eliminar puntos
        domicilio: data.domicilio,
        telefono: data.telefono.replace(/-/g, ""), // Eliminar guiones
        email: data.email,
        tipo_id: 2, // Tipo abogado
      }

      let personaId

      if (abogado) {
        // Actualizar persona existente
        const { error: updateError } = await supabase.from("personas").update(personaData).eq("id", abogado.id)

        if (updateError) throw updateError
        personaId = abogado.id
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

      // 2. Crear o actualizar en la tabla abogados
      const abogadoData = {
        id: personaId,
      }

      if (abogado) {
        // Verificar si ya existe en la tabla abogados
        const { data: existingAbogado } = await supabase.from("abogados").select("id").eq("id", personaId).maybeSingle()

        if (existingAbogado) {
          // No necesitamos actualizar nada en la tabla abogados
        } else {
          // Crear registro en abogados si no existe
          const { error: insertAbogadoError } = await supabase.from("abogados").insert(abogadoData)
          if (insertAbogadoError) throw insertAbogadoError
        }
      } else {
        // Crear nuevo abogado
        const { error: insertAbogadoError } = await supabase.from("abogados").insert(abogadoData)
        if (insertAbogadoError) throw insertAbogadoError
      }

      toast({
        title: abogado ? "Abogado actualizado" : "Abogado creado",
        description: abogado
          ? "El abogado ha sido actualizado correctamente"
          : "El abogado ha sido creado correctamente",
      })

      router.push("/abogados")
      router.refresh()
    } catch (error) {
      console.error("Error al guardar abogado:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el abogado",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Modificar el formulario para que no incluya campos que podrían no existir */}
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
              <Button type="button" variant="outline" onClick={() => router.push("/abogados")}>
                Cancelar
              </Button>
              <Button type="submit">{abogado ? "Actualizar" : "Guardar"}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
