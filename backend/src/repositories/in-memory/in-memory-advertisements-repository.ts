import { Advertisement, Prisma } from '@prisma/client'
import {
  AdvertisementWithRatingAndReviews,
  AdvertisementsRepository,
} from '../advertisements-repository'

export class InMemoryAdvertisementsRepository
  implements AdvertisementsRepository
{
  public items: Advertisement[] = []

  async findById(id: string) {
    const advertisement = this.items.find((item) => item.id === id)

    if (!advertisement) {
      return null
    }

    return advertisement
  }

  async create(data: Prisma.AdvertisementUncheckedCreateInput) {
    const advertisement = {
      id: data.id ?? 'advertisement-1',
      title: data.title,
      description: data.description,
      price: new Prisma.Decimal(data.price.toString()),
      availability: data.availability,
      categoryId: data.categoryId,
      image: data.image ?? null,
      authorId: data.authorId,
      created_at: new Date(),
    }

    this.items.push(advertisement)

    return advertisement
  }

  async searchMany(
    query: string,
    page: number,
    category?: string,
    availability?: string,
  ) {
    let advertisements = this.items.filter((item) => item.title.includes(query))

    if (availability) {
      advertisements = advertisements.filter(
        (item) => item.availability === availability,
      )
    }

    if (category) {
      advertisements = advertisements.filter(
        (item) => item.categoryId === category,
      )
    }

    const pagedAdvertisements = advertisements.slice(
      (page - 1) * 20,
      page * 20,
    )

    return pagedAdvertisements.map(
      (advertisement): AdvertisementWithRatingAndReviews => ({
        ...advertisement,
        rating: 0,
        reviewCount: 0,
      }),
    )
  }
  async findManyByUserId(userId: string) { return this.items.filter(x => x.authorId === userId) }
  async update(id: string, data: Partial<Prisma.AdvertisementUncheckedCreateInput>) {
    const item = this.items.find(x => x.id === id)
    if (!item) throw new Error('Advertisement not found')
    if (data.title !== undefined) item.title = data.title
    if (data.description !== undefined) item.description = data.description
    if (data.price !== undefined) item.price = new Prisma.Decimal(data.price.toString())
    if (data.image !== undefined) item.image = data.image
    if (data.categoryId !== undefined) item.categoryId = data.categoryId
    return item
  }
  async delete(id: string) { this.items = this.items.filter(x => x.id !== id) }
}
