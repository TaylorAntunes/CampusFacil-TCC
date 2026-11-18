import type { User } from '@prisma/client'
import { hash } from 'bcryptjs'
import type { UsersRepository } from '@/repositories/users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { InstitutionalEmailRequiredError } from './errors/institutional-email-required-error'

interface RegisterServiceRequest {
  name: string
  email: string
  password: string
}

interface RegisterServiceResponse {
  user: User
}

export class RegisterService {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
  }: RegisterServiceRequest): Promise<RegisterServiceResponse> {
    email = email.trim().toLowerCase()

    if (!/^[^\s@]+@ifce\.edu\.br$/i.test(email)) {
      throw new InstitutionalEmailRequiredError()
    }

    const password_hash = await hash(password, 12)

    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    const user = await this.usersRepository.create({
      name,
      email,
      password_hash,
    })

    return { user }
  }
}
