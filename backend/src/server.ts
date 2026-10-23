import { createApp } from './app';
import { config } from './config/env';
import { MongoRepository } from './db/mongo';

async function bootstrap() {
  // Connect to MongoDB if configured
  if (config.mongodbUri) {
    await MongoRepository.connect();
  }

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`
==============================================================
  T→G (Trend to Growth) — Business Intelligence API
==============================================================
  Port:              ${config.port}
  Environment:       ${config.env}
  Database:          ${config.mongodbUri ? 'MongoDB' : 'In-Memory (Demo)'}
  Intelligence Mode: ${config.groqApiKey ? `Groq (${config.groqModel})` : 'Mock Engine'}
  Version:           tgo-v1
  API Endpoint:      http://localhost:${config.port}/api
==============================================================
    `);
  });
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
});
