/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: API para gestión de clientes
 * 
 * /api/customers:
 *   get:
 *     summary: Obtener todos los clientes de la empresa
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       401:
 *         description: No autorizado
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - identificationType
 *               - identificationNumber
 *             properties:
 *               name:
 *                 type: string
 *               identificationType:
 *                 type: string
 *                 enum: [CC, NIT, CE, PP]
 *               identificationNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               department:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 * 
 * /api/customers/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Cliente no encontrado
 *       401:
 *         description: No autorizado
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Cliente no encontrado
 *       401:
 *         description: No autorizado
 *   delete:
 *     summary: Eliminar un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *       404:
 *         description: Cliente no encontrado
 *       401:
 *         description: No autorizado
 */
