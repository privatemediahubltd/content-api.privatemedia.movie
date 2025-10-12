module.exports = {
    apps: [
      {
        name: 'movie-content-server',
        script: './dist/main.js',
        
        // Instance settings
        instances: 10,  // Use 'max' for cluster mode (number of CPU cores)
        exec_mode: 'fork',  // Use 'cluster' for load balancing
        
        // Auto-restart settings
        watch: false,  // Set to true for development
        max_memory_restart: '500M',  // Restart if memory exceeds 500MB
        
        // Environment variables
        env: {
          NODE_ENV: 'production',
          PORT: 9010,
        },
        env_production: {
          NODE_ENV: 'development',
          PORT: 9010,
          // Add your production environment variables here
          // DATABASE_URL: 'your-database-url',
          // JWT_SECRET: 'your-jwt-secret',
        },
        
        // Logging
        error_file: './logs/movie-content-server-err.log',
        out_file: './logs/movie-content-server-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        
        // Advanced options
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        listen_timeout: 3000,
        kill_timeout: 5000,
        
        // Post-deployment
        post_update: ['npm install', 'echo Deployment finished'],
      },
    ],
  };