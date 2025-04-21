import { Router } from 'express';
import { CompanyController } from '../controllers';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const companyController = new CompanyController();

// Rutas para empresas
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);
router.post('/', authMiddleware, companyController.createCompany);
router.put('/:id', authMiddleware, companyController.updateCompany);
router.delete('/:id', authMiddleware, companyController.deleteCompany);

export default router;
