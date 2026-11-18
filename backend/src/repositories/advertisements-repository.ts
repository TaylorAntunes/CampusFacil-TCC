import { Prisma, Advertisement } from '@prisma/client'

export interface AdvertisementWithRatingAndReviews extends Advertisement {
  rating: number
  reviewCount: number
}

export interface AdvertisementsRepository {
  findById(id: string): Promise<Advertisement | null>
  create(data: Prisma.AdvertisementUncheckedCreateInput): Promise<Advertisement>
  searchMany(
    query: string,
    page: number,
    category?: string,
    availability?: string,
  ): Promise<AdvertisementWithRatingAndReviews[]>
  findManyByUserId(userId: string): Promise<Advertisement[]>
  update(
    id: string,
    data: Partial<Prisma.AdvertisementUncheckedUpdateInput>,
  ): Promise<Advertisement>
  delete(id: string): Promise<void>
}
