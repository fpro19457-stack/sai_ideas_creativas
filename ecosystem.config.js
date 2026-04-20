module.exports = {
  apps: [{
    name: "sai-ideas-creativas",
    script: ".next/standalone/server.js",
    instances: 1,
    env: {
      NODE_ENV: "production",
      PORT: 3002
    }
  }]
};