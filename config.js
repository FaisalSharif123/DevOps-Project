module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  gracefulShutdownTimeout: 10000,
  
  // Health check config
  health: {
    enabled: true,
    path: '/health'
  },
  
  // Kubernetes probes
  probes: {
    liveness: {
      enabled: true,
      path: '/health'
    },
    readiness: {
      enabled: true,
      path: '/ready'
    }
  }
};
