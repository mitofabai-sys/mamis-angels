import type { Database } from './database'

export type ServiceType = Database['public']['Tables']['service_types']['Row']
export type Addon = Database['public']['Tables']['addons']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Cleaner = Database['public']['Tables']['cleaners']['Row']
export type Availability = Database['public']['Tables']['availability']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingAddon = Database['public']['Tables']['booking_addons']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type PropertyType = 'condo' | 'house'
export type BedroomCount = 'studio' | '1br' | '2br' | '3br' | '4br'

// Booking with expanded relations
export type BookingWithDetails = Booking & {
  service_type: ServiceType
  cleaner: Cleaner | null
  booking_addons: (BookingAddon & { addon: Addon })[]
}

// Addon selection state in booking wizard
export interface AddonSelection {
  addonId: string
  quantity: number
}

// Booking wizard form state
export interface BookingFormState {
  // Step 1
  propertyType: PropertyType | null
  bedroomCount: BedroomCount | null
  serviceTypeId: string
  addonSelections: AddonSelection[]
  // Step 2
  bookingDate: string   // ISO date 'YYYY-MM-DD'
  bookingTime: string   // 'HH:MM'
  availabilityId: string
  // Step 3
  address: string
  notes: string
  // Computed
  totalPrice: number
}
