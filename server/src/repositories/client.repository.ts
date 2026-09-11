import { prisma } from './prisma';
import { CreateClientInput, UpdateClientInput } from '../validators/client.validator';

export class ClientRepository {
  async findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async findAll() {
    return prisma.client.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateClientInput) {
    return prisma.client.create({ data });
  }

  async update(id: string, data: UpdateClientInput) {
    return prisma.client.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.client.delete({
      where: { id },
    });
  }
}

export const clientRepository = new ClientRepository();
