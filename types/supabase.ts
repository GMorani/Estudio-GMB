export type Database = {
  public: {
    Tables: {
      abogados: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
      }
      aseguradoras: {
        Row: {
          id: string
          cuit: string
        }
        Insert: {
          id: string
          cuit: string
        }
        Update: {
          id?: string
          cuit?: string
        }
      }
      clientes: {
        Row: {
          id: string
          referido: string | null
        }
        Insert: {
          id: string
          referido?: string | null
        }
        Update: {
          id?: string
          referido?: string | null
        }
      }
      estados_expediente: {
        Row: {
          id: number
          nombre: string
          color: string
        }
        Insert: {
          id?: number
          nombre: string
          color: string
        }
        Update: {
          id?: number
          nombre?: string
          color?: string
        }
      }
      expedientes: {
        Row: {
          id: string
          numero: string
          fecha_inicio: string | null
          monto_total: number | null
          juzgado_id: string | null
          objeto: string | null
          autos: string | null
          numero_judicial: string | null
          fecha_inicio_judicial: string | null
        }
        Insert: {
          id?: string
          numero: string
          fecha_inicio?: string | null
          monto_total?: number | null
          juzgado_id?: string | null
          objeto?: string | null
          autos?: string | null
          numero_judicial?: string | null
          fecha_inicio_judicial?: string | null
        }
        Update: {
          id?: string
          numero?: string
          fecha_inicio?: string | null
          monto_total?: number | null
          juzgado_id?: string | null
          objeto?: string | null
          autos?: string | null
          numero_judicial?: string | null
          fecha_inicio_judicial?: string | null
        }
      }
      expediente_estados: {
        Row: {
          id: number
          expediente_id: string
          estado_id: number
          fecha_asignacion: string | null
        }
        Insert: {
          id?: number
          expediente_id: string
          estado_id: number
          fecha_asignacion?: string | null
        }
        Update: {
          id?: number
          expediente_id?: string
          estado_id?: number
          fecha_asignacion?: string | null
        }
      }
      expediente_personas: {
        Row: {
          id: number
          expediente_id: string
          persona_id: string
          rol: string
        }
        Insert: {
          id?: number
          expediente_id: string
          persona_id: string
          rol: string
        }
        Update: {
          id?: number
          expediente_id?: string
          persona_id?: string
          rol?: string
        }
      }
      juzgados: {
        Row: {
          id: string
          nombre_juez: string | null
          nombre_secretario: string | null
        }
        Insert: {
          id: string
          nombre_juez?: string | null
          nombre_secretario?: string | null
        }
        Update: {
          id?: string
          nombre_juez?: string | null
          nombre_secretario?: string | null
        }
      }
      mediadores: {
        Row: {
          id: string
          telefono: string | null
          email: string | null
          entidad: string | null
          direccion: string | null
          notas: string | null
        }
        Insert: {
          id: string
          telefono?: string | null
          email?: string | null
          entidad?: string | null
          direccion?: string | null
          notas?: string | null
        }
        Update: {
          id?: string
          telefono?: string | null
          email?: string | null
          entidad?: string | null
          direccion?: string | null
          notas?: string | null
        }
      }
      peritos: {
        Row: {
          id: string
          telefono: string | null
          email: string | null
          especialidad: string | null
          direccion: string | null
          notas: string | null
        }
        Insert: {
          id: string
          telefono?: string | null
          email?: string | null
          especialidad?: string | null
          direccion?: string | null
          notas?: string | null
        }
        Update: {
          id?: string
          telefono?: string | null
          email?: string | null
          especialidad?: string | null
          direccion?: string | null
          notas?: string | null
        }
      }
      personas: {
        Row: {
          id: string
          nombre: string
          dni_cuit: string
          telefono: string
          email: string
          domicilio: string
          tipo_id: number
        }
        Insert: {
          id?: string
          nombre: string
          dni_cuit: string
          telefono: string
          email: string
          domicilio: string
          tipo_id: number
        }
        Update: {
          id?: string
          nombre?: string
          dni_cuit?: string
          telefono?: string
          email?: string
          domicilio?: string
          tipo_id?: number
        }
      }
      tareas_expediente: {
        Row: {
          id: number
          descripcion: string
          fecha_vencimiento: string
          prioridad: string
          cumplida: boolean
          expediente_id: string
          notas: string | null
        }
        Insert: {
          id?: number
          descripcion: string
          fecha_vencimiento: string
          prioridad: string
          cumplida?: boolean
          expediente_id: string
          notas?: string | null
        }
        Update: {
          id?: number
          descripcion?: string
          fecha_vencimiento?: string
          prioridad?: string
          cumplida?: boolean
          expediente_id?: string
          notas?: string | null
        }
      }
      actividades_expediente: {
        Row: {
          id: number
          descripcion: string
          fecha: string
          expediente_id: string
          automatica: boolean
        }
        Insert: {
          id?: number
          descripcion: string
          fecha: string
          expediente_id: string
          automatica?: boolean
        }
        Update: {
          id?: number
          descripcion?: string
          fecha?: string
          expediente_id?: string
          automatica?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
