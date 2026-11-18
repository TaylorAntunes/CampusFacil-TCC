import { AdvertisementsRepository } from '@/repositories/advertisements-repository'
import { Advertisement } from '@prisma/client'

interface SearchAdvertisementsServiceRequest {
  query: string
  page: number
  category?: string
  availability?: string
}

interface SearchAdvertisementsServiceResponse {
  advertisements: Advertisement[]
}

export class SearchAdvertisementsService {
  constructor(private advertisementsRepository: AdvertisementsRepository) {}

  async execute({
    query,
    page,
    category,
    availability,
  }: SearchAdvertisementsServiceRequest): Promise<SearchAdvertisementsServiceResponse> {
    const advertisements = await this.advertisementsRepository.searchMany(
      query,
      page,
      category,
      availability,
    )

    return { advertisements }
  }
}
