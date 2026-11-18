import { z } from 'zod'
export const userNameSchema = z.string().trim().min(3).max(120)
