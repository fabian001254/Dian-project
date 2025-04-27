/**
 * @swagger
 * tags:
 *   name: Facturas
 *   description: API para gestión de facturas electrónicas
 * 
 * /api/invoices:
 *   get:
 *     summary: Obtener todas las facturas de la empresa
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending, approved, rejected]
 *         description: Filtrar facturas por estado
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filtrar facturas por cliente
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: No autorizado
 *   post:
 *     summary: Crear una nueva factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *             properties:
 *               customerId:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                     - unitPrice
 *                   properties:
 *                     productId:
 *                       type: string
 *                     description:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *                     taxRateId:
 *                       type: string
 *                       nullable: true
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 * 
 * /api/invoices/{id}:
 *   get:
 *     summary: Obtener una factura por ID
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 * 
 * /api/invoices/{id}/send-to-dian:
 *   post:
 *     summary: Enviar factura a la DIAN (simulado)
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura enviada exitosamente a la DIAN
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 invoice:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: La factura no está en estado válido para enviar
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 * 
 * /api/invoices/{id}/send-by-email:
 *   post:
 *     summary: Enviar factura por correo electrónico (simulado)
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura enviada exitosamente por correo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 emailId:
 *                   type: string
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 * 
 * /api/invoices/company/{companyId}:
 *   get:
 *     summary: Obtener todas las facturas de una empresa específica
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la empresa
 *     responses:
 *       200:
 *         description: Lista de facturas de la empresa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: No autorizado
 * 
 * /api/invoices/recent:
 *   get:
 *     summary: Obtener las facturas más recientes
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facturas recientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: No autorizado
 */
