module.exports = {
  apps: [{
    name: 'loomis-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: 'C:\\Users\\KokpitUser\\Desktop\\loomis',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
     PORT: 6001,
      HOSTNAME: 'localhost'
    },
    error_file: 'C:\\Users\\KokpitUser\\Desktop\\loomis\\logs\\err.log',
    out_file: 'C:\\Users\\KokpitUser\\Desktop\\loomis\\logs\\out.log',
    log_file: 'C:\\Users\\KokpitUser\\Desktop\\loomis\\logs\\combined.log',
    time: true
  }]
};