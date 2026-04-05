/**
 * Health Controller
 * Handles health check endpoints
 */

import * as supabaseService from '../services/supabaseService.js';
import * as geminiService from '../services/geminiService.js';
import { sendSuccess } from '../utils/responseHelper.js';
import config from '../config/index.js';
import logger from '../config/logger.js';

/**
 * Basic health check
 * GET /api/v1/health
 */
export const healthCheck = (req, res) => {
  sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: config.server.env,
  });
};

/**
 * Detailed health check with service status
 * GET /api/v1/health/detailed
 */
export const detailedHealthCheck = async (req, res) => {
  logger.info('Running detailed health check...');

  // Check all services in parallel
  const [dbHealthy, geminiHealthy] = await Promise.all([
    supabaseService.healthCheck().catch(() => false),
    geminiService.healthCheck().catch(() => false),
  ]);

  const services = {
    database: {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      message: dbHealthy ? 'Connected' : 'Connection failed',
    },
    gemini: {
      status: geminiHealthy ? 'healthy' : 'unhealthy',
      message: geminiHealthy ? 'API accessible' : 'API not accessible',
    },
  };

  const overallHealthy = dbHealthy && geminiHealthy;

  const response = {
    status: overallHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: config.server.env,
    services,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
  };

  // Use 503 if services are down in production
  const statusCode = overallHealthy ? 200 : config.server.isProduction ? 503 : 200;

  res.status(statusCode).json({
    success: overallHealthy,
    data: response,
  });
};

export default {
  healthCheck,
  detailedHealthCheck,
};
