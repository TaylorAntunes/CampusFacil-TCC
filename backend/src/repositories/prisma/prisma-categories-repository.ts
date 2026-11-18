import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { CategoriesRepository } from '@/repositories/categories-repository'

export class PrismaCategoriesRepository implements CategoriesRepository {
  async findByName(name: string) {
    return prisma.category.findUnique({
      where: {
        name,
      },
    })
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    return prisma.category.create({
      data,
    })
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: {
        id,
      },
    })
  }
}
