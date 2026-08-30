# ---- Backend Dockerfile ----
FROM node:18-alpine

WORKDIR /usr/src/app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./

EXPOSE 5000

CMD ["node", "server.js"]
