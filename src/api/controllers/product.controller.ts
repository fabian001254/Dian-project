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
      const { companyId, customerId } = req.query;
      const productRepository = AppDataSource.getRepository(Product);
      const taxRateRepository = AppDataSource.getRepository('tax_rates');
      const customerRepository = customerId ? AppDataSource.getRepository('customers') : null;
      
      let products;
      let whereCondition: any = {};
      
      // Agregar filtro por compañía si se proporciona
      if (companyId) {
        whereCondition.companyId = companyId as string;
      }
      
      // Filtrar por cliente si se proporciona
      if (customerId) {
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
      console.log('Datos recibidos en createProduct:', JSON.stringify(req.body, null, 2));
      
      const { name, description, code, price, taxRateId } = req.body;
      const user = req.user as User;
      if (user.role !== UserRole.VENDOR) {
        return res.status(403).json({ success: false, message: 'Solo vendedores pueden crear productos' });
      }
      
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
      // asignar empresa y vendedor
      product.companyId = user.companyId;
      product.vendorId = user.id;
      
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
