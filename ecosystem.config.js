module.exports = {
  apps: [
    {
      name: "randomsitcom-api",
      cwd: "./apps/api",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: 3000,
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
    {
      name: "randomsitcom-web",
      cwd: "./apps/web",
      script: "npm",
      args: "run preview -- --host 0.0.0.0 --port 5173",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
    },
  ],
};
