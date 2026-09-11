import { clientRepository } from '../repositories/client.repository';
import { CreateClientInput, UpdateClientInput } from '../validators/client.validator';
import { AppError } from '../utils/errors';

export class ClientService {
  async getAllClients() {
    return clientRepository.findAll();
  }

  async getClientById(id: string) {
    const client = await clientRepository.findById(id);
    if (!client) throw AppError.notFound('Client not found');
    return client;
  }

  async createClient(input: CreateClientInput) {
    return clientRepository.create(input);
  }

  async updateClient(id: string, input: UpdateClientInput) {
    await this.getClientById(id);
    return clientRepository.update(id, input);
  }

  async deleteClient(id: string) {
    await this.getClientById(id);
    return clientRepository.delete(id);
  }
}

export const clientService = new ClientService();
