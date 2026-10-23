import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.APP_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  webOrigin: process.env.WEB_ORIGIN || 'http://localhost:5173',
  
  // MongoDB database connection
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pragyan',
  
  // Groq AI
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'tg-secret-jwt-key-growth-works-2025',
  
  // Logging & mode
  logLevel: process.env.LOG_LEVEL || 'info',
  dataMode: process.env.MONGODB_URI ? 'mongodb' : 'demo',
  intelligenceMode: process.env.GROQ_API_KEY ? 'groq' : 'mock',
  demoMode: process.env.DEMO_MODE !== 'false',

  // Legacy compatibility fallbacks for connectors
  youtubeApiKey: '',
  redditClientId: '',
  redditClientSecret: '',
  redditUserAgent: 'TrendToGrowthBot/1.0',
  googleTrendsProvider: 'mock',
  googleTrendsApiKey: '',
  aiModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  aiVersion: 'groq-llama-3.3',
};
