import { Category, Prisma } from '@prisma/client'

export interface CategoriesRepository {
  findByName(name: string): Promise<Category | null>
  create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>
  findById(id: string): Promise<Category | null>
}
