import { Router } from 'express';
import { ProductController } from '../controllers';

const router = Router();
const productController = new ProductController();

// Rutas para productos
router.get('/search', productController.searchProducts);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
