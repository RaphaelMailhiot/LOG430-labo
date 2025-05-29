import { Router } from 'express';
import { ServicesController } from '../controllers/servicesController';

const router = Router();
const servicesController = new ServicesController();

router.post('/search-product', async (req, res, next) => {
  try {
    const results = await servicesController.handleSearch(req.body.productNameInput);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.post('/add-product', async (req, res, next) => {
  try {
    const { name, category, price, stock } = req.body;
    const success = await servicesController.handleAddProduct(name, category, price, stock);
    res.json({ success });
  } catch (err) {
    next(err);
  }
});

export default router;