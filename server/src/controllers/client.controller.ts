import { Request, Response, NextFunction } from 'express';
import { clientService } from '../services/client.service';
import { createClientSchema, updateClientSchema } from '../validators/client.validator';

export class ClientController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await clientService.getAllClients();
      return res.json({ success: true, data: clients });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.getClientById(req.params.id);
      return res.json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createClientSchema.parse(req.body);
      const client = await clientService.createClient(input);
      return res.status(201).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateClientSchema.parse(req.body);
      const client = await clientService.updateClient(req.params.id, input);
      return res.json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await clientService.deleteClient(req.params.id);
      return res.json({ success: true, data: { message: 'Client deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
}

export const clientController = new ClientController();
