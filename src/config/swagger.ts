import swaggerJsdoc from 'swagger-jsdoc';

const options: any = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Facturación Electrónica DIAN',
      version: '1.0.0',
      description: 'API para el sistema educativo de facturación electrónica que simula el cumplimiento con la normativa DIAN colombiana',
      contact: {
        name: 'Soporte',
        email: 'soporte@facturacionelectronica.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/api/routes/*.swagger.ts',
    './src/api/models/swagger-schemas.ts',
    './src/api/routes/*.ts',
    './src/api/controllers/*.ts',
    './src/api/models/*.ts'
  ]
};

export const specs = swaggerJsdoc(options);
