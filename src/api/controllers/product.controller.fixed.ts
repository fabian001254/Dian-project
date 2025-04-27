import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Product } from '../../models/Product';
import { User, UserRole } from '../../models/User';

export class ProductController {
  /**
   * Buscar productos por término
   */
  public searchProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { term, companyId, customerId } = req.query;
      const productRepository = AppDataSource.getRepository(Product);
      const customerRepository = customerId ? AppDataSource.getRepository('customers') : null;
      
      if (!term) {
        return res.status(400).json({
          success: false,
          message: 'El término de búsqueda es requerido'
        });
      }
      
      // Construir la consulta
      const queryBuilder = productRepository.createQueryBuilder('product');
      
      // Agregar condiciones de búsqueda
      queryBuilder
        .where('LOWER(product.name) LIKE LOWER(:term)', { term: `%${term}%` })
        .orWhere('LOWER(product.description) LIKE LOWER(:term)', { term: `%${term}%` })
        .orWhere('LOWER(product.code) LIKE LOWER(:term)', { term: `%${term}%` });
      
      // Filtrar por compañía si se proporciona
      if (companyId) {
        queryBuilder.andWhere('product.companyId = :companyId', { companyId });
      }
      
      // Filtrar por cliente si se proporciona
      if (customerId) {
        // Caso especial para productos generales
        if (customerId === 'general') {
          console.log('Filtrando solo productos generales (sin cliente específico)');
          queryBuilder.andWhere('product.customerId IS NULL');
        } 
        // Caso para mostrar todos los productos
        else if (customerId === 'todos') {
          console.log('Mostrando todos los productos (generales y específicos)');
          // No aplicamos filtro adicional
        }
        else {
          console.log(`Filtrando productos para cliente ID: ${customerId}`);
          // IMPORTANTE: Mostrar SOLO los productos del cliente específico, SIN incluir los generales
          queryBuilder.andWhere('product.customerId = :customerId', { customerId });
        }
      }
      
      // Log detallado para depuración
      console.log(`Query SQL generada: ${queryBuilder.getSql()}`);
      console.log(`Parámetros: ${JSON.stringify(queryBuilder.getParameters())}`);
      
      
      // Obtener resultados
      const products = await queryBuilder
        .leftJoinAndSelect('product.taxRates', 'taxRates')
        .leftJoinAndSelect('product.company', 'company')
        .take(10) // Limitar a 10 resultados
        .getMany();
      
      // Transformar los datos para que taxRate sea un objeto en lugar de un array
      // y agregar información del cliente si está disponible
      const transformedProducts = await Promise.all(products.map(async (product: any) => {
        let taxRate = null;
        let customerName = null;
        
        if (product.taxRates && product.taxRates.length > 0) {
          taxRate = product.taxRates[0];
        }
        
        // Si el producto tiene un cliente asignado, obtener su nombre
        if (product.customerId && customerRepository) {
          try {
            const customer = await customerRepository.findOne({ where: { id: product.customerId } });
            if (customer) {
              customerName = customer.name;
            }
          } catch (error) {
            console.error('Error obteniendo información del cliente:', error);
          }
        }
        
        // Log para diagnóstico
        console.log(`Producto ${product.id} - customerId: ${product.customerId}, customerName: ${customerName}`);
        
        return {
          ...product,
          taxRate,
          customerName
        };
      }));
      
      return res.status(200).json({
        success: true,
        data: transformedProducts
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al buscar productos',
        error: error.message
      });
    }
  };
  
  /**
   * Obtener todos los productos
   */
  public getAllProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { companyId, customerId, vendorId, userId } = req.query;
      const productRepository = AppDataSource.getRepository(Product);
      const taxRateRepository = AppDataSource.getRepository('tax_rates');
      const customerRepository = customerId ? AppDataSource.getRepository('customers') : null;
      
      // Obtener el usuario autenticado del request
      const authReq = req as any;
      const currentUser = authReq.user;
      
      let products;
      let whereCondition: any = {};
      
      // Agregar filtro por compañía si se proporciona
      if (companyId) {
        whereCondition.companyId = companyId as string;
      }
      
      // Si el usuario tiene rol de vendor, mostrar ÚNICAMENTE sus productos
      if (currentUser && currentUser.role === UserRole.VENDOR) {
        console.log(`Usuario con rol vendor (${currentUser.id}): mostrando ÚNICAMENTE sus productos creados`);
        whereCondition.vendorId = currentUser.id;
        const queryBuilder = productRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.taxRates', 'taxRates')
          .leftJoinAndSelect('product.company', 'company')
          .leftJoinAndSelect('product.customer', 'customer')
          .where('product.vendorId = :vendorId', { vendorId: currentUser.id });
          
        console.log('Consulta SQL para vendedor (solo sus productos):', queryBuilder.getSql());
        console.log('Parámetros de la consulta:', { vendorId: currentUser.id });
        
        // Verificar todos los vendorId en productos para diagnóstico
        const allVendorIds = await productRepository
          .createQueryBuilder('product')
          .select('product.vendorId')
          .distinct(true)
          .getRawMany();
        
        console.log('Todos los vendorId en productos:', allVendorIds.map((v: { product_vendorId: string }) => v.product_vendorId));
        
        // Agregar filtro por compañía si se proporciona
        if (companyId) {
          queryBuilder.andWhere('product.companyId = :companyId', { companyId });
        }
        
        // Agregar filtro por cliente si se proporciona
        if (customerId) {
          if (customerId === 'general' || customerId === 'none') {
            queryBuilder.andWhere('(product.customerId IS NULL OR product.customerId = "")');
          } else if (customerId !== 'todos') {
            queryBuilder.andWhere('product.customerId = :customerId', { customerId });
          }
        }
        
        // Obtener el conteo para diagnóstico
        const vendorProductCount = await queryBuilder.getCount();
        console.log(`Cantidad de productos encontrados para vendorId=${currentUser.id}: ${vendorProductCount}`);
        
        products = await queryBuilder.getMany();
      }
      // Filtrar por userId (para vendedores que usan su ID de usuario directamente)
      else if (userId) {
        console.log(`Filtrando productos para usuario con ID: ${userId}`);
        
        // Primero intentamos buscar si existe un vendedor asociado a este userId
        const vendorRepository = AppDataSource.getRepository('vendors');
        const vendor = await vendorRepository.findOne({
          where: { userId: userId as string }
        });
        
        let vendorIdToUse;
        
        if (vendor) {
          console.log(`Encontrado vendedor con ID: ${vendor.id} para usuario: ${userId}`);
          vendorIdToUse = vendor.id;
        } else {
          console.log(`No se encontró vendedor para usuario: ${userId}, usando userId como respaldo`);
          vendorIdToUse = userId;
        }
        
        products = await productRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.taxRates', 'taxRates')
          .leftJoinAndSelect('product.company', 'company')
          .leftJoinAndSelect('product.customer', 'customer')
          .where('product.vendorId = :vendorId', { vendorId: vendorIdToUse })
          .andWhere('product.companyId = :companyId', { companyId })
          .getMany();
      }
      // Filtrar por vendedor si se proporciona explícitamente
      else if (vendorId) {
        console.log(`Filtrando productos para vendedor ID: ${vendorId}`);
        products = await productRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.taxRates', 'taxRates')
          .leftJoinAndSelect('product.company', 'company')
          .leftJoinAndSelect('product.customer', 'customer')
          .where('product.vendorId = :vendorId', { vendorId })
          .andWhere('product.companyId = :companyId', { companyId })
          .getMany();
      } else if (customerId) {
        // Verificar si es el caso especial de "general"
        if (customerId === 'general' || customerId === 'none') {
          console.log('Filtrando productos generales (sin cliente específico)');
          products = await productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.taxRates', 'taxRates')
            .leftJoinAndSelect('product.company', 'company')
            .leftJoinAndSelect('product.customer', 'customer')
            .where('(product.customerId IS NULL OR product.customerId = "")')
            .andWhere('product.companyId = :companyId', { companyId })
            .getMany();
        } else {
          console.log(`Filtrando productos específicos para el cliente: ${customerId}`);
          // Obtener SOLO productos específicos del cliente (no incluir generales)
          products = await productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.taxRates', 'taxRates')
            .leftJoinAndSelect('product.company', 'company')
            .leftJoinAndSelect('product.customer', 'customer')
            .where('product.customerId = :customerId', { customerId })
            .andWhere('product.companyId = :companyId', { companyId })
            .getMany();
        }
      } else if (companyId) {
        // Filtrar solo por compañía
        products = await productRepository.find({ 
          where: whereCondition,
          relations: ['taxRates', 'company', 'customer'] // Añadir relación con el cliente
        });
      } else {
        // Obtener todos los productos
        products = await productRepository.find({
          relations: ['taxRates', 'company', 'customer'] // Añadir relación con el cliente
        });
      }
      
  
      // Transformar los datos para que taxRate sea un objeto en lugar de un array
      const transformedProducts = await Promise.all(products.map(async (product: any) => {
        let taxRate = null;
        let customerName = null;
        
        // Si el producto tiene taxRateId pero no tiene taxRates, buscamos la tasa de impuesto
        if (product.taxRateId && (!product.taxRates || product.taxRates.length === 0)) {
          try {
            const taxRateData = await taxRateRepository.findOne({ where: { id: product.taxRateId } });
            if (taxRateData) {
              taxRate = taxRateData;
            }
          } catch (error) {
            console.error('Error obteniendo tasa de impuesto:', error);
          }
        } else if (product.taxRates && product.taxRates.length > 0) {
          taxRate = product.taxRates[0];
        }
        
        // Si el producto tiene un cliente asignado, obtener su nombre
        // Primero intentamos usar la relación cargada
        if (product.customer) {
          customerName = product.customer.name;
        }
        // Si no hay relación pero hay customerId, intentamos buscar el cliente
        else if (product.customerId && customerRepository) {
          try {
            const customer = await customerRepository.findOne({ where: { id: product.customerId } });
            if (customer) {
              customerName = customer.name;
            }
          } catch (error) {
            console.error('Error obteniendo cliente:', error);
          }
        } else {
          console.log(`Producto sin cliente asignado: ${product.id}`);
        }
        
        return {
          ...product,
          taxRate,
          customerName
        };
      }));
      
      products = transformedProducts;

      return res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener productos',
        error: error.message
      });
    }
  };

  /**
   * Obtener un producto por su ID
   */
  public getProductById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const productRepository = AppDataSource.getRepository(Product);
      const product = await productRepository.findOne({ 
        where: { id },
        relations: ['taxRates']
      });
      
      // Transformar para incluir taxRate
      if (product && product.taxRates) {
        const taxRate = product.taxRates.length > 0 ? product.taxRates[0] : null;
        (product as any).taxRate = taxRate;
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el producto',
        error: error.message
      });
    }
  };

  /**
   * Crear un nuevo producto
   */
  public createProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Log completo de los datos recibidos para diagnóstico
      console.log('Datos recibidos en createProduct:', req.body);
      
      const { name, description, code, price, taxRateId, vendorId } = req.body;
      // Permitir que cualquier usuario pueda crear productos
      // Necesitamos hacer un cast para que TypeScript reconozca la propiedad user
      const user = (req as any).user as User;
      // Quitamos la restricción de rol para permitir que cualquier usuario pueda crear productos
      
      // Validar datos
      if (!name || !price || !taxRateId) {
        return res.status(400).json({
          success: false,
          message: 'El nombre, precio y tasa de impuesto son obligatorios'
        });
      }

      const productRepository = AppDataSource.getRepository(Product);
      
      // Verificar si el producto ya existe con el mismo código en la misma empresa
      if (code) {
        const existingProduct = await productRepository.findOne({ 
          where: { 
            code,
            companyId: user.companyId
          } 
        });
        
        if (existingProduct) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un producto con este código en esta empresa'
          });
        }
      }

      // Crear el producto
      const product = new Product();
      product.name = name;
      product.description = description || '';
      product.code = code || '';
      product.price = price;
      product.unitPrice = price; // Asegurarse de que unitPrice tenga el mismo valor que price
      product.unit = 'Unidad'; // Valor predeterminado para unit
      product.taxRateId = taxRateId;
      // asignar empresa
      product.companyId = user.companyId;
      
      // IMPORTANTE: Siempre asignar el ID del usuario actual como vendorId si tiene rol de vendedor
      if (user && user.role === UserRole.VENDOR) {
        console.log(`Usuario con rol vendedor, asignando su ID como vendorId: ${user.id}`);
        product.vendorId = user.id; // Guardar el ID del usuario directamente
        console.log(`Producto asignado al vendedor (userId): ${product.vendorId}`);
      } 
      // Si el usuario no es vendedor pero se proporciona un vendorId, lo procesamos
      else if (vendorId) {
        console.log(`Usuario no es vendedor, pero se proporcionó un vendorId: ${vendorId}`);
        product.vendorId = vendorId; // Usar directamente el ID proporcionado
        console.log(`Producto asignado al vendorId: ${product.vendorId}`);
      } 
      // Si no hay vendorId y el usuario no es vendedor
      else {
        console.log('No se proporcionó vendorId y el usuario no es vendedor');
        product.vendorId = undefined as any;
        console.log('Producto sin vendedor asignado');
      }
      
      console.log('Objeto producto antes de guardar:', JSON.stringify(product, null, 2));
      
      try {
        // Guardar el producto
        const savedProduct = await productRepository.save(product);
        console.log('Producto guardado con ID:', savedProduct.id);
        
        // Verificar que se guardó correctamente
        const verifyProduct = await productRepository.findOne({ 
          where: { id: savedProduct.id },
          relations: ['customer']
        });
        
        console.log('Producto verificado desde la base de datos:', JSON.stringify(verifyProduct, null, 2));
        console.log('customerId guardado en la base de datos:', verifyProduct.customerId);
        console.log('Relación con cliente:', verifyProduct.customer ? 'Sí' : 'No');
        
        return res.status(201).json({
          success: true,
          message: 'Producto creado exitosamente',
          data: savedProduct
        });
      } catch (error) {
        console.error('Error al guardar el producto:', error);
        throw error;
      }

      // Este return no se ejecutará porque ya se maneja en el bloque try/catch anterior
    } catch (error) {
      console.error('Error detallado al crear producto:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear el producto',
        error: error.message,
        stack: error.stack,
        details: JSON.stringify(error)
      });
    }
  };

  /**
   * Actualizar un producto existente
   */
  public updateProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        code,
        price,
        taxRateId
      } = req.body;
      
      const productRepository = AppDataSource.getRepository(Product);
      const product = await productRepository.findOne({ where: { id } });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Actualizar campos
      if (name) product.name = name;
      if (description !== undefined) product.description = description;
      if (code) product.code = code;
      if (price) {
        product.price = price;
        product.unitPrice = price; // Actualizar también el precio unitario
      }
      if (taxRateId) product.taxRateId = taxRateId;
      
      console.log('Producto actualizado:', {
        id: product.id,
        name: product.name,
        price: product.price,
        unitPrice: product.unitPrice,
        taxRateId: product.taxRateId
      });

      await productRepository.save(product);

      return res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el producto',
        error: error.message
      });
    }
  };

  /**
   * Eliminar un producto
   */
  public deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const productRepository = AppDataSource.getRepository(Product);
      
      const product = await productRepository.findOne({ where: { id } });
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      await productRepository.remove(product);

      return res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el producto',
        error: error.message
      });
    }
  };
}
