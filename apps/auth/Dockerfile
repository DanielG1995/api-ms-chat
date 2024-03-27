# Utiliza una imagen base adecuada para tu aplicación Node.js
FROM node:alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia el directorio dist de producción de api desde la raíz del proyecto
COPY ../../dist/apps/auth ./dist
COPY ./package.json ./
# Instala solo las dependencias necesarias para producción
RUN npm install --production
# Comando para iniciar la aplicación
CMD ["node", "./dist/main.js"]