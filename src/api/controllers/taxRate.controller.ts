import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { TaxRate } from '../../models/TaxRate';

export class TaxRateController {
  /**
   * Obtener todas las tasas de impuestos
   */
  public getAllTaxRates = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const taxRateRepository = AppDataSource.getRepository(TaxRate);
      const taxRates = await taxRateRepository.find();

      return res.status(200).json({
        success: true,
        data: taxRates
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener tasas de impuestos',
        error: error.message
      });
    }
  };

  /**
   * Obtener una tasa de impuesto por su ID
   */
  public getTaxRateById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const taxRateRepository = AppDataSource.getRepository(TaxRate);
      const taxRate = await taxRateRepository.findOne({ where: { id } });

      if (!taxRate) {
        return res.status(404).json({
          success: false,
          message: 'Tasa de impuesto no encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: taxRate
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener la tasa de impuesto',
        error: error.message
      });
    }
  };

  /**
   * Crear una nueva tasa de impuesto
   */
  public createTaxRate = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, rate, code, description } = req.body;
      
      // Validar datos
      if (!name || rate === undefined || !code) {
        return res.status(400).json({
          success: false,
          message: 'El nombre, tasa y código son obligatorios'
        });
      }

      const taxRateRepository = AppDataSource.getRepository(TaxRate);
      
      // Verificar si ya existe una tasa con el mismo código
      const existingTaxRate = await taxRateRepository.findOne({ where: { code } });
      if (existingTaxRate) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una tasa de impuesto con este código'
        });
      }

      // Crear la tasa de impuesto
      const taxRate = new TaxRate();
      taxRate.name = name;
      taxRate.rate = rate;
      taxRate.code = code;
      taxRate.description = description || '';

      await taxRateRepository.save(taxRate);

      return res.status(201).json({
        success: true,
        message: 'Tasa de impuesto creada exitosamente',
        data: taxRate
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al crear la tasa de impuesto',
        error: error.message
      });
    }
  };

  /**
   * Actualizar una tasa de impuesto existente
   */
  public updateTaxRate = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { name, rate, code, description } = req.body;
      
      const taxRateRepository = AppDataSource.getRepository(TaxRate);
      const taxRate = await taxRateRepository.findOne({ where: { id } });

      if (!taxRate) {
        return res.status(404).json({
          success: false,
          message: 'Tasa de impuesto no encontrada'
        });
      }

      // Actualizar campos
      if (name) taxRate.name = name;
      if (rate !== undefined) taxRate.rate = rate;
      if (code) taxRate.code = code;
      if (description !== undefined) taxRate.description = description;

      await taxRateRepository.save(taxRate);

      return res.status(200).json({
        success: true,
        message: 'Tasa de impuesto actualizada exitosamente',
        data: taxRate
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar la tasa de impuesto',
        error: error.message
      });
    }
  };

  /**
   * Eliminar una tasa de impuesto
   */
  public deleteTaxRate = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const taxRateRepository = AppDataSource.getRepository(TaxRate);
      
      const taxRate = await taxRateRepository.findOne({ where: { id } });
      if (!taxRate) {
        return res.status(404).json({
          success: false,
          message: 'Tasa de impuesto no encontrada'
        });
      }

      await taxRateRepository.remove(taxRate);

      return res.status(200).json({
        success: true,
        message: 'Tasa de impuesto eliminada exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar la tasa de impuesto',
        error: error.message
      });
    }
  };
}
