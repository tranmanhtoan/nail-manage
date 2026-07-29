import { z } from 'zod'

// ─── Quick Entry Form ───────────────────────────────────────────────────────

export const quickEntrySchema = z.object({
  employeeId: z.string().optional(),
  serviceId: z.string().min(1, 'Service is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  tip: z.number().min(0, 'Tip cannot be negative').default(0),
  paymentMethod: z.enum(['cash', 'card']),
})

export type QuickEntryInput = z.infer<typeof quickEntrySchema>

// ─── Appointment Form ───────────────────────────────────────────────────────

export const appointmentSchema = z.object({
  customerId: z.string().nullable().optional(),
  employeeId: z.string().min(1, 'Employee is required'),
  serviceId: z.string().min(1, 'Service is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  price: z.number().min(0, 'Price cannot be negative'),
  tip: z.number().min(0).default(0),
  paymentMethod: z.enum(['cash', 'card']).optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['booked', 'in_progress', 'completed', 'cancelled', 'no_show']).default('booked'),
  source: z.enum(['walk_in', 'online']).default('walk_in'),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>

// ─── Customer Form ──────────────────────────────────────────────────────────

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z
    .string()
    .regex(/^[\d\s\-+()]*$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
})

export type CustomerInput = z.infer<typeof customerSchema>

// ─── Employee Form ──────────────────────────────────────────────────────────

export const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z
    .string()
    .regex(/^[\d\s\-+()]*$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  payType: z.enum(['commission', 'fixed', 'split']),
  commissionRate: z.number().min(0).max(100).nullable().optional(),
  fixedSalary: z.number().min(0).nullable().optional(),
  splitRate: z.number().min(0).max(100).nullable().optional(),
  isActive: z.boolean().default(true),
})

export type EmployeeInput = z.infer<typeof employeeSchema>

// ─── Service Form ───────────────────────────────────────────────────────────

export const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
  durationMinutes: z.number().int().positive('Duration must be positive'),
  isActive: z.boolean().default(true),
})

export type ServiceInput = z.infer<typeof serviceSchema>

// ─── Booking Form (Public) ──────────────────────────────────────────────────

export const bookingSchema = z.object({
  customerName: z.string().min(1, 'Name is required').max(100),
  customerPhone: z.string().min(6, 'Phone is required').regex(/^[\d\s\-+()]+$/, 'Invalid phone'),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  serviceId: z.string().min(1, 'Service is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time'),
})

export type BookingInput = z.infer<typeof bookingSchema>

// ─── Login Form ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().min(1, 'Username or email is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ─── Helper: validate and return result ─────────────────────────────────────

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.')
    if (!errors[key]) {
      errors[key] = issue.message
    }
  }
  return { success: false, errors }
}
