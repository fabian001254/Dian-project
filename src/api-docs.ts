/**
 * Documentación básica de la API del Sistema Educativo de Facturación Electrónica DIAN
 */

export const apiDocumentation = {
  openapi: '3.0.1',
  info: {
    version: '1.0.0',
    title: 'API de Facturación Electrónica DIAN',
    description: 'Documentación de la API del Sistema Educativo de Facturación Electrónica DIAN',
    contact: {
      name: 'Soporte',
      email: 'soporte@sistema.com'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'Servidor de desarrollo'
    }
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Endpoints de autenticación'
    },
    {
      name: 'Users',
      description: 'Gestión de usuarios'
    },
    {
      name: 'Companies',
      description: 'Gestión de empresas'
    },
    {
      name: 'Customers',
      description: 'Gestión de clientes'
    },
    {
      name: 'Products',
      description: 'Gestión de productos'
    },
    {
      name: 'Invoices',
      description: 'Gestión de facturas'
    },
    {
      name: 'Certificates',
      description: 'Gestión de certificados digitales'
    },
    {
      name: 'DIAN Simulator',
      description: 'Simulador de servicios DIAN'
    }
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    example: 'admin@sistema.com'
                  },
                  password: {
                    type: 'string',
                    example: 'admin123'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Inicio de sesión exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Inicio de sesión exitoso'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        token: {
                          type: 'string',
                          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        },
                        user: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: '1'
                            },
                            firstName: {
                              type: 'string',
                              example: 'Admin'
                            },
                            lastName: {
                              type: 'string',
                              example: 'Sistema'
                            },
                            email: {
                              type: 'string',
                              example: 'admin@sistema.com'
                            },
                            role: {
                              type: 'string',
                              example: 'admin'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Credenciales inválidas'
          }
        }
      }
    },
    '/customers': {
      get: {
        tags: ['Customers'],
        summary: 'Obtener lista de clientes',
        parameters: [
          {
            name: 'companyId',
            in: 'query',
            schema: {
              type: 'string'
            },
            description: 'ID de la empresa'
          }
        ],
        responses: {
          '200': {
            description: 'Lista de clientes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: '1'
                          },
                          name: {
                            type: 'string',
                            example: 'Cliente Ejemplo'
                          },
                          identificationType: {
                            type: 'string',
                            example: 'NIT'
                          },
                          identificationNumber: {
                            type: 'string',
                            example: '900123456'
                          },
                          email: {
                            type: 'string',
                            example: 'cliente@ejemplo.com'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Customers'],
        summary: 'Crear un nuevo cliente',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'Nuevo Cliente'
                  },
                  identificationType: {
                    type: 'string',
                    example: 'NIT'
                  },
                  identificationNumber: {
                    type: 'string',
                    example: '901234567'
                  },
                  email: {
                    type: 'string',
                    example: 'nuevo@cliente.com'
                  },
                  phone: {
                    type: 'string',
                    example: '3001234567'
                  },
                  address: {
                    type: 'string',
                    example: 'Calle 123 #45-67'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Cliente creado exitosamente'
          },
          '400': {
            description: 'Datos inválidos'
          }
        }
      }
    },
    '/invoices': {
      get: {
        tags: ['Invoices'],
        summary: 'Obtener lista de facturas',
        responses: {
          '200': {
            description: 'Lista de facturas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: '1'
                          },
                          number: {
                            type: 'string',
                            example: '001'
                          },
                          prefix: {
                            type: 'string',
                            example: 'SETP'
                          },
                          issueDate: {
                            type: 'string',
                            example: '2023-01-01'
                          },
                          status: {
                            type: 'string',
                            example: 'DRAFT'
                          },
                          total: {
                            type: 'number',
                            example: 119000
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Verificar estado del servidor',
        responses: {
          '200': {
            description: 'Estado del servidor',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok'
                    },
                    message: {
                      type: 'string',
                      example: 'Servidor disponible'
                    },
                    time: {
                      type: 'string',
                      example: '2023-01-01T12:00:00.000Z'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export const generateApiDocsHtml = () => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Docs - Sistema Facturación DIAN</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .topbar {
      display: none;
    }
    .swagger-ui .info {
      margin: 30px 0;
    }
    .swagger-ui .info .title {
      color: #3b4151;
    }
    .swagger-ui .scheme-container {
      padding: 15px 0;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(apiDocumentation)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        docExpansion: "list",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        displayRequestDuration: true
      });
      window.ui = ui;
    };
  </script>
</body>
</html>
  `;
};

export const generateApiStatusHtml = () => {
  const currentTime = new Date().toISOString();
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Status - Sistema Facturación DIAN</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .status-card {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .status-indicator {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .status-online {
      background-color: #28a745;
    }
    .status-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .status-item:last-child {
      border-bottom: none;
    }
    .status-label {
      font-weight: 500;
    }
    .status-value {
      color: #6c757d;
    }
    .api-routes {
      margin-top: 30px;
    }
    .route-item {
      background-color: #e9ecef;
      padding: 10px 15px;
      border-radius: 4px;
      margin-bottom: 10px;
      font-family: monospace;
    }
    .method {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      color: white;
      font-size: 12px;
      font-weight: bold;
      margin-right: 8px;
    }
    .get { background-color: #61affe; }
    .post { background-color: #49cc90; }
    .put { background-color: #fca130; }
    .delete { background-color: #f93e3e; }
  </style>
</head>
<body>
  <h1>Sistema Facturación DIAN - Estado de la API</h1>
  
  <div class="status-card">
    <div class="status-item">
      <span class="status-label">Estado</span>
      <span class="status-value"><span class="status-indicator status-online"></span> En línea</span>
    </div>
    <div class="status-item">
      <span class="status-label">Tiempo actual</span>
      <span class="status-value">${currentTime}</span>
    </div>
    <div class="status-item">
      <span class="status-label">Tiempo de actividad</span>
      <span class="status-value">${uptimeString}</span>
    </div>
    <div class="status-item">
      <span class="status-label">Versión Node.js</span>
      <span class="status-value">${process.version}</span>
    </div>
    <div class="status-item">
      <span class="status-label">Memoria utilizada</span>
      <span class="status-value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100} MB</span>
    </div>
  </div>
  
  <h2>Rutas principales</h2>
  <div class="api-routes">
    <div class="route-item">
      <span class="method get">GET</span> /api/health - Estado del servidor
    </div>
    <div class="route-item">
      <span class="method post">POST</span> /api/auth/login - Autenticación
    </div>
    <div class="route-item">
      <span class="method get">GET</span> /api/customers - Obtener clientes
    </div>
    <div class="route-item">
      <span class="method get">GET</span> /api/products - Obtener productos
    </div>
    <div class="route-item">
      <span class="method get">GET</span> /api/invoices - Obtener facturas
    </div>
  </div>
  
  <p style="margin-top: 30px; text-align: center; color: #6c757d;">
    <a href="/api-docs" style="color: #007bff; text-decoration: none;">Ver documentación completa</a>
  </p>
</body>
</html>
  `;
};
