import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { CategoriesRepository } from '@/repositories/categories-repository'
import { Advertisement } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface CreateAdvertisementServiceRequest {
  title: string
  description: string
  price: number
  availability?: string
  authorId: string
  categoryId: string
  image?: string
}

interface CreateAdvertisementServiceResponse {
  advertisement: Advertisement
}

export class CreateAdvertisementService {
  constructor(
    private advertisementsRepository: AdvertisementsRepository,
    private categoriesRepository: CategoriesRepository,
  ) {}

  async execute({
    title,
    description,
    price,
    availability,
    authorId,
    categoryId,
    image,
  }: CreateAdvertisementServiceRequest): Promise<CreateAdvertisementServiceResponse> {
    const category = await this.categoriesRepository.findById(categoryId)

    if (!category) {
      throw new ResourceNotFoundError()
    }

    const advertisement = await this.advertisementsRepository.create({
      title,
      description,
      price,
      availability: availability ?? 'ACTIVE',
      authorId,
      categoryId: category.id,
      image,
    })

    return { advertisement }
  }
}
