// Supabase database types.
// Regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      service_types: {
        Row: {
          id: string
          property_type: 'condo' | 'house'
          bedroom_count: 'studio' | '1br' | '2br' | '3br' | '4br'
          base_price: number
        }
        Insert: {
          id?: string
          property_type: 'condo' | 'house'
          bedroom_count: 'studio' | '1br' | '2br' | '3br' | '4br'
          base_price: number
        }
        Update: {
          id?: string
          property_type?: 'condo' | 'house'
          bedroom_count?: 'studio' | '1br' | '2br' | '3br' | '4br'
          base_price?: number
        }
        Relationships: []
      }
      addons: {
        Row: {
          id: string
          name: string
          price: number
          unit: string
          has_quantity: boolean
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          price: number
          unit: string
          has_quantity?: boolean
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          price?: number
          unit?: string
          has_quantity?: boolean
          is_active?: boolean
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          created_at?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          id: string
          created_at: string
        }
        Insert: {
          id: string
          created_at?: string
        }
        Update: {
          id?: string
          created_at?: string
        }
        Relationships: []
      }
      cleaners: {
        Row: {
          id: string
          full_name: string
          email: string | null
          phone: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          full_name: string
          email?: string | null
          phone?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      availability: {
        Row: {
          id: string
          cleaner_id: string
          date: string
          start_time: string
          end_time: string
          is_booked: boolean
        }
        Insert: {
          id?: string
          cleaner_id: string
          date: string
          start_time: string
          end_time: string
          is_booked?: boolean
        }
        Update: {
          id?: string
          cleaner_id?: string
          date?: string
          start_time?: string
          end_time?: string
          is_booked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'availability_cleaner_id_fkey'
            columns: ['cleaner_id']
            isOneToOne: false
            referencedRelation: 'cleaners'
            referencedColumns: ['id']
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          cleaner_id: string | null
          service_type_id: string
          booking_date: string
          booking_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          address: string
          notes: string | null
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cleaner_id?: string | null
          service_type_id: string
          booking_date: string
          booking_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          address: string
          notes?: string | null
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cleaner_id?: string | null
          service_type_id?: string
          booking_date?: string
          booking_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          address?: string
          notes?: string | null
          total_price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_cleaner_id_fkey'
            columns: ['cleaner_id']
            isOneToOne: false
            referencedRelation: 'cleaners'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_service_type_id_fkey'
            columns: ['service_type_id']
            isOneToOne: false
            referencedRelation: 'service_types'
            referencedColumns: ['id']
          }
        ]
      }
      booking_addons: {
        Row: {
          id: string
          booking_id: string
          addon_id: string
          quantity: number
        }
        Insert: {
          id?: string
          booking_id: string
          addon_id: string
          quantity?: number
        }
        Update: {
          id?: string
          booking_id?: string
          addon_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: 'booking_addons_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'booking_addons_addon_id_fkey'
            columns: ['addon_id']
            isOneToOne: false
            referencedRelation: 'addons'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          booking_id: string
          type: 'confirmation' | 'reminder'
          channel: 'sms' | 'email'
          status: 'sent' | 'failed'
          sent_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          type: 'confirmation' | 'reminder'
          channel: 'sms' | 'email'
          status: 'sent' | 'failed'
          sent_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          type?: 'confirmation' | 'reminder'
          channel?: 'sms' | 'email'
          status?: 'sent' | 'failed'
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']
export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type InsertDTO<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type UpdateDTO<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']
