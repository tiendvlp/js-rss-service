FROM node:17-alpine3.12

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

# 30 minutes by default
ENV OUTDATED_RULE_DURATION 1800000
# 15 minutes by default
ENV SLEEP_BETWEEN_UPDATE 900000

EXPOSE 80

CMD ["node", "app.js"]