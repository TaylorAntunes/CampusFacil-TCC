import { prisma } from '@/lib/prisma'
import { Prisma, RequestStatus, ServiceRequest } from '@prisma/client'
import { ServiceRequestsRepository } from '../service-requests-repository'

export class PrismaServiceRequestsRepository
  implements ServiceRequestsRepository
{
  async findManyByUserId(userId: string) {
    const serviceRequests = await prisma.serviceRequest.findMany({
      where: {
        OR: [{ requesterId: userId }, { advertisement: { authorId: userId } }],
      },
      include: {
        advertisement: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar_url: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    })

    return serviceRequests
  }

  async findById(id: string) {
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: {
        id,
      },
    })

    return serviceRequest
  }

  async findByAdvertisementId(advertisementId: string) {
    const serviceRequests = await prisma.serviceRequest.findMany({
      where: {
        advertisementId,
      },
    })

    return serviceRequests
  }

  async findManyByAdvertisementIdAndRequesterId(
    advertisementId: string,
    requesterId: string,
  ) {
    const serviceRequests = await prisma.serviceRequest.findMany({
      where: {
        advertisementId,
        requesterId,
      },
    })

    return serviceRequests
  }

  async findByRequesterId(requesterId: string) {
    const serviceRequests = await prisma.serviceRequest.findMany({
      where: {
        requesterId,
      },
    })

    return serviceRequests
  }

  async save(serviceRequest: ServiceRequest) {
    const updatedServiceRequest = await prisma.serviceRequest.update({
      where: {
        id: serviceRequest.id,
      },
      data: serviceRequest,
    })

    return updatedServiceRequest
  }

  async create(data: Prisma.ServiceRequestUncheckedCreateInput) {
    const serviceRequest = await prisma.serviceRequest.create({
      data,
    })

    return serviceRequest
  }

  async updateStatus(serviceRequestId: string, status: RequestStatus) {
    const updatedServiceRequest = await prisma.serviceRequest.update({
      where: {
        id: serviceRequestId,
      },
      data: {
        status,
      },
      include: {
        advertisement: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    })

    return updatedServiceRequest
  }

  async delete(serviceRequestId: string) {
    await prisma.serviceRequest.delete({
      where: {
        id: serviceRequestId,
      },
    })
  }
}
