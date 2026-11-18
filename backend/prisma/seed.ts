import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function main() {
  const categories = [
    { name: 'Educação' },
    { name: 'Tecnologia' },
    { name: 'Acadêmico' },
    { name: 'Design' },
    { name: 'Idiomas' },
    { name: 'Pesquisa' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
