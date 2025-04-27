FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json del backend
COPY package.json package-lock.json* ./

# Instalar dependencias del backend
RUN npm install

# Copiar el código fuente del backend
COPY . .

# Compilar TypeScript del backend
RUN npm run build

# Verificar si existe el directorio frontend y compilarlo
RUN if [ -d "frontend" ]; then \
      echo "Instalando dependencias del frontend..." && \
      cd frontend && \
      npm install && \
      echo "Compilando frontend..." && \
      npm run build && \
      cd .. && \
      echo "Frontend compilado correctamente"; \
    else \
      echo "No se encontró el directorio frontend"; \
    fi

# Crear directorio para datos persistentes
# Railway recomienda usar sus volúmenes en lugar de la directiva VOLUME
RUN mkdir -p /data

# Exponer el puerto
EXPOSE 10000

# Iniciar la aplicación usando el nuevo script
CMD ["npm", "start"]
