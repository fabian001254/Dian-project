# Sistema Educativo de Facturación Electrónica DIAN

![Banner del Proyecto](https://via.placeholder.com/800x200/5272F2/FFFFFF?text=Sistema+de+Facturaci%C3%B3n+Electr%C3%B3nica+DIAN)

## 📋 Descripción

Sistema educativo que simula el proceso de facturación electrónica en Colombia según la normativa de la DIAN (Resolución 001092 del 1 de julio de 2022). Este proyecto está diseñado con fines educativos para comprender el flujo completo de la facturación electrónica, desde la emisión hasta la validación por parte de la autoridad fiscal.

## ✨ Características

- **Gestión completa de facturación electrónica**:
  - Emisión de facturas electrónicas
  - Generación de documentos XML según UBL 2.1
  - Representación gráfica en PDF
  - Simulación de envío a la DIAN y a clientes

- **Simuladores integrados**:
  - Servicios web de la DIAN
  - Certificados digitales
  - Envío de correos electrónicos

- **Módulos principales**:
  - Gestión de clientes
  - Gestión de productos y servicios
  - Gestión de vendedores
  - Facturación electrónica
  - Reportes y estadísticas
  - Proceso de habilitación como facturador

- **Interfaz de usuario**:
  - Diseño responsive
  - Tema claro/oscuro
  - Dashboard con estadísticas en tiempo real

## 🛠️ Tecnologías

- **Frontend**: React, TypeScript, Styled Components
- **Backend**: Node.js, Express, TypeScript
- **Base de datos**: SQLite con TypeORM
- **Arquitectura**: Monolítica con separación clara de responsabilidades

## 📦 Instalación

### Requisitos previos

- Node.js (v18 o superior)
- npm (v8 o superior)
- Git

### Pasos de instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/dian-facturacion-electronica.git
   cd dian-facturacion-electronica
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```
   PORT=10000
   NODE_ENV=development
   JWT_SECRET=tu_clave_secreta_para_jwt
   DATABASE_PATH=./database.sqlite
   ```

4. **Inicializar la base de datos**:
   ```bash
   npm run build
   node dist/ensure-data.js
   ```

5. **Iniciar la aplicación**:
   ```bash
   npm start
   ```

   O para desarrollo:
   ```bash
   npm run dev
   ```

## 🚀 Despliegue

El sistema está configurado para ser desplegado en Railway con una configuración monolítica que incluye tanto el frontend como el backend.

### Usando Docker

1. **Construir la imagen**:
   ```bash
   docker build -t dian-facturacion .
   ```

2. **Ejecutar el contenedor**:
   ```bash
   docker run -p 10000:10000 -d dian-facturacion
   ```

### Usando Railway

1. Conecta tu repositorio a Railway
2. Railway detectará automáticamente el Dockerfile y desplegará la aplicación
3. Configura las variables de entorno necesarias en el panel de Railway

## 📊 Estructura del Proyecto

```
dian-facturacion-electronica/
├── src/                    # Código fuente del backend
│   ├── config/             # Configuración de la aplicación
│   ├── controllers/        # Controladores de la API
│   ├── models/             # Modelos de datos (TypeORM)
│   ├── routes/             # Rutas de la API
│   ├── services/           # Servicios de negocio
│   ├── simulators/         # Simuladores (DIAN, certificados, email)
│   ├── utils/              # Utilidades (XML, PDF, etc.)
│   ├── ensure-data.ts      # Script para inicializar datos
│   └── index.ts            # Punto de entrada de la aplicación
├── frontend/               # Código fuente del frontend (React)
│   ├── public/             # Archivos estáticos
│   └── src/                # Código fuente React
│       ├── components/     # Componentes React
│       ├── context/        # Contextos de React (Auth, Theme)
│       ├── pages/          # Páginas de la aplicación
│       ├── services/       # Servicios de API
│       └── App.tsx         # Componente principal
├── dist/                   # Código compilado del backend
├── build-and-start.js      # Script para compilar frontend y backend
├── Dockerfile              # Configuración para Docker
├── .dockerignore           # Archivos ignorados por Docker
├── .railwayignore          # Archivos ignorados por Railway
└── package.json            # Dependencias y scripts
```

## 🔐 Autenticación

El sistema incluye un sistema de autenticación basado en JWT con los siguientes roles:

- **Administrador**: Acceso completo al sistema
- **Contador**: Acceso a facturación y reportes
- **Visualizador**: Solo lectura

### Credenciales predeterminadas

- **Administrador**: admin@sistema.com / admin123

## 📝 Modelos de Datos

El sistema utiliza los siguientes modelos principales:

1. **User**: Usuarios del sistema con roles
2. **Company**: Información de la empresa emisora
3. **Customer**: Clientes a quienes se emiten facturas
4. **Product**: Productos y servicios que se facturan
5. **TaxRate**: Tasas de impuestos aplicables
6. **Invoice**: Facturas electrónicas con su estado
7. **InvoiceItem**: Ítems de cada factura
8. **Certificate**: Certificados digitales simulados
9. **Vendor**: Vendedores asociados a la empresa

## 🧪 Datos de Ejemplo

Al iniciar por primera vez, el sistema crea automáticamente:

- Una empresa de ejemplo (Empresa Ejemplo S.A.S)
- Un usuario administrador
- Tasas de impuestos comunes
- Algunos clientes y productos de ejemplo
- Un certificado digital simulado

## 🔄 Scripts Disponibles

- `npm start`: Inicia la aplicación en modo producción
- `npm run dev`: Inicia la aplicación en modo desarrollo
- `npm run build`: Compila el código TypeScript
- `npm run seed`: Ejecuta el script de inicialización de datos
- `npm run full-start`: Compila el frontend y luego inicia el backend

## 📱 Capturas de Pantalla

![Dashboard](https://via.placeholder.com/800x450/5272F2/FFFFFF?text=Dashboard)

![Facturación](https://via.placeholder.com/800x450/5272F2/FFFFFF?text=Facturaci%C3%B3n)

![Clientes](https://via.placeholder.com/800x450/5272F2/FFFFFF?text=Clientes)

## 📄 Documentación

Para una guía completa de usuario, consulta el [Manual de Usuario](./Manual_de_Usuario_Sistema_Facturacion_DIAN.md).

## ⚠️ Aviso Importante

Este sistema es **educativo** y está diseñado para simular el proceso de facturación electrónica. No tiene valor legal ni fiscal y no debe utilizarse en entornos de producción reales.

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para sugerir cambios o mejoras.

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

---

Desarrollado con ❤️ para fines educativos | © 2025
