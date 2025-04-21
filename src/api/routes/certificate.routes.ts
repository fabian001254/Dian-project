import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';

const router = Router();
const certificateController = new CertificateController();

// Rutas para certificados digitales
router.get('/', certificateController.getAllCertificates);
router.get('/:id', certificateController.getCertificateById);
router.post('/', certificateController.createCertificate);
router.put('/:id', certificateController.updateCertificate);
router.delete('/:id', certificateController.deleteCertificate);
router.get('/company/:companyId', certificateController.getCertificatesByCompany);

export default router;
