import { IRepository } from './repository.interface';
import { InMemoryRepository } from './in-memory.repository';
import { MongoRepository } from '../db/mongo';
import { config } from '../config/env';

let repositoryInstance: IRepository | null = null;

export function getRepository(): IRepository {
  if (!repositoryInstance) {
    if (config.mongodbUri) {
      repositoryInstance = new MongoRepository();
    } else {
      repositoryInstance = new InMemoryRepository();
    }
  }
  return repositoryInstance;
}

export function setRepository(repo: IRepository): void {
  repositoryInstance = repo;
}
