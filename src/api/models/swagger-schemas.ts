/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - role
 *         - companyId
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *         name:
 *           type: string
 *           description: Nombre completo del usuario
 *         role:
 *           type: string
 *           enum: [admin, accountant, viewer]
 *           description: Rol del usuario en el sistema
 *         companyId:
 *           type: string
 *           description: ID de la empresa a la que pertenece el usuario
 *         isActive:
 *           type: boolean
 *           description: Indica si el usuario está activo
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del último inicio de sesión
 *       example:
 *         id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *         email: "usuario@empresa.com"
 *         name: "Usuario Ejemplo"
 *         role: "admin"
 *         companyId: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *         isActive: true
 *         lastLogin: "2023-04-26T12:00:00Z"
 *     
 *     Company:
 *       type: object
 *       required:
 *         - name
 *         - nit
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la empresa
 *         name:
 *           type: string
 *           description: Nombre de la empresa
 *         nit:
 *           type: string
 *           description: NIT de la empresa
 *         address:
 *           type: string
 *           description: Dirección de la empresa
 *         phone:
 *           type: string
 *           description: Teléfono de contacto
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico de contacto
 *         isElectronicBiller:
 *           type: boolean
 *           description: Indica si la empresa está habilitada como facturador electrónico
 *       example:
 *         id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *         name: "Empresa Ejemplo S.A.S"
 *         nit: "900123456-7"
 *         address: "Calle 123 #45-67, Bogotá"
 *         phone: "601-1234567"
 *         email: "contacto@empresa.com"
 *         isElectronicBiller: true
 *     
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - identificationType
 *         - identificationNumber
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del cliente
 *         name:
 *           type: string
 *           description: Nombre o razón social del cliente
 *         identificationType:
 *           type: string
 *           enum: [CC, NIT, CE, PP]
 *           description: Tipo de documento de identificación
 *         identificationNumber:
 *           type: string
 *           description: Número de documento de identificación
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del cliente
 *         address:
 *           type: string
 *           description: Dirección del cliente
 *         city:
 *           type: string
 *           description: Ciudad del cliente
 *         department:
 *           type: string
 *           description: Departamento del cliente
 *         companyId:
 *           type: string
 *           description: ID de la empresa a la que pertenece el cliente
 *       example:
 *         id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *         name: "Cliente Ejemplo S.A.S"
 *         identificationType: "NIT"
 *         identificationNumber: "901234567-8"
 *         email: "contacto@cliente.com"
 *         address: "Carrera 45 #67-89, Medellín"
 *         city: "Medellín"
 *         department: "Antioquia"
 *         companyId: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *     
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - unitPrice
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del producto
 *         name:
 *           type: string
 *           description: Nombre del producto
 *         code:
 *           type: string
 *           description: Código del producto
 *         description:
 *           type: string
 *           description: Descripción del producto
 *         unitPrice:
 *           type: number
 *           description: Precio unitario del producto
 *         unit:
 *           type: string
 *           description: Unidad de medida
 *         customerId:
 *           type: string
 *           nullable: true
 *           description: ID del cliente específico (null para productos generales)
 *         companyId:
 *           type: string
 *           description: ID de la empresa a la que pertenece el producto
 *       example:
 *         id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *         name: "Producto Ejemplo"
 *         code: "PROD-001"
 *         description: "Descripción detallada del producto ejemplo"
 *         unitPrice: 100000
 *         unit: "UND"
 *         customerId: null
 *         companyId: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *     
 *     Invoice:
 *       type: object
 *       required:
 *         - customerId
 *         - items
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la factura
 *         number:
 *           type: string
 *           description: Número de la factura
 *         prefix:
 *           type: string
 *           description: Prefijo de la factura
 *         customerId:
 *           type: string
 *           description: ID del cliente
 *         issueDate:
 *           type: string
 *           format: date
 *           description: Fecha de emisión
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Fecha de vencimiento
 *         status:
 *           type: string
 *           enum: [draft, pending, approved, rejected]
 *           description: Estado de la factura
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvoiceItem'
 *           description: Ítems de la factura
 *         total:
 *           type: number
 *           description: Total de la factura
 *         subtotal:
 *           type: number
 *           description: Subtotal antes de impuestos
 *         taxTotal:
 *           type: number
 *           description: Total de impuestos
 *         companyId:
 *           type: string
 *           description: ID de la empresa emisora
 *       example:
 *         id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *         number: "001"
 *         prefix: "FE"
 *         customerId: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *         issueDate: "2023-04-26"
 *         dueDate: "2023-05-26"
 *         status: "approved"
 *         total: 119000
 *         subtotal: 100000
 *         taxTotal: 19000
 *         companyId: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *     
 *     InvoiceItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - unitPrice
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del ítem de factura
 *         productId:
 *           type: string
 *           description: ID del producto
 *         description:
 *           type: string
 *           description: Descripción del ítem
 *         quantity:
 *           type: number
 *           description: Cantidad
 *         unitPrice:
 *           type: number
 *           description: Precio unitario
 *         taxRateId:
 *           type: string
 *           nullable: true
 *           description: ID de la tasa de impuesto aplicada
 *         taxAmount:
 *           type: number
 *           description: Monto de impuesto
 *         subtotal:
 *           type: number
 *           description: Subtotal del ítem
 *         total:
 *           type: number
 *           description: Total del ítem con impuestos
 *       example:
 *         id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *         productId: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *         description: "Producto Ejemplo"
 *         quantity: 1
 *         unitPrice: 100000
 *         taxRateId: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *         taxAmount: 19000
 *         subtotal: 100000
 *         total: 119000
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario
 *       example:
 *         email: "admin@sistema.com"
 *         password: "admin123"
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Token JWT para autenticación
 *         user:
 *           $ref: '#/components/schemas/User'
 *       example:
 *         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *           email: "admin@sistema.com"
 *           name: "Administrador"
 *           role: "admin"
 *           companyId: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *           isActive: true
 *     
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensaje de error
 *         error:
 *           type: string
 *           description: Tipo de error
 *       example:
 *         message: "No autorizado"
 *         error: "Unauthorized"
 */
