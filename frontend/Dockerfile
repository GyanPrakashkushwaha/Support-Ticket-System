FROM node:20-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]