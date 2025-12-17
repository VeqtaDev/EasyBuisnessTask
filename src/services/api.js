import { getCurrentUser } from '../utils/auth';
import { verifyApiKey } from '../db/settings';
import * as taskDB from '../db/tasks';
import { getTaskStats } from '../db/tasks';

// Service API pour utilisation interne et externe
export class ApiService {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.userId = null;
  }

  async authenticate() {
    if (this.apiKey) {
      const userId = await verifyApiKey(this.apiKey);
      if (!userId) {
        throw new Error('Clé API invalide');
      }
      this.userId = userId;
    } else {
      const user = getCurrentUser();
      if (!user) {
        throw new Error('Non authentifié');
      }
      this.userId = user.id;
    }
  }

  async getTasks(filters = {}) {
    await this.authenticate();
    return await taskDB.getTasks(this.userId, filters);
  }

  async createTask(taskData) {
    await this.authenticate();
    return await taskDB.createTask(this.userId, taskData);
  }

  async updateTask(id, updates) {
    await this.authenticate();
    return await taskDB.updateTask(id, updates);
  }

  async deleteTask(id) {
    await this.authenticate();
    return await taskDB.deleteTask(id);
  }

  async getStats() {
    await this.authenticate();
    return await getTaskStats(this.userId);
  }
}

// Fonction helper pour les appels API externes
export async function handleApiRequest(url, method, body, apiKey) {
  const service = new ApiService(apiKey);
  
  try {
    if (url === '/api/tasks' && method === 'GET') {
      return await service.getTasks();
    }

    if (url === '/api/tasks' && method === 'POST') {
      return await service.createTask(body);
    }

    if (url.startsWith('/api/tasks/') && method === 'PUT') {
      const id = parseInt(url.split('/')[3]);
      return await service.updateTask(id, body);
    }

    if (url.startsWith('/api/tasks/') && method === 'DELETE') {
      const id = parseInt(url.split('/')[3]);
      return await service.deleteTask(id);
    }

    if (url === '/api/stats' && method === 'GET') {
      return await service.getStats();
    }

    throw new Error('Route non trouvée');
  } catch (error) {
    throw error;
  }
}

