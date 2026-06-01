import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1).max(18).regex(/^[a-zA-Z0-9-]+$/),
  password: z.string().min(8)
})

export const createGameSchema = z.object({
  title: z.string().min(1),
  mainStory: z.coerce.number().optional(),
  mainPlusExtras: z.coerce.number().optional(),
  completionist: z.coerce.number().optional(),
  metacriticScore: z.coerce.number().optional(),
  releaseYear: z.coerce.number().optional(),
  description: z.string().optional(),
  genres: z.string().optional(),
  platforms: z.string().optional()
})

export const updateGameSchema = createGameSchema.partial()
