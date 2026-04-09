FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

WORKDIR /app

CMD ["sh", "-c", "npm run build; npx cap copy android; cd android; ./gradlew assembleRelease"]