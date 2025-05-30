import { Router } from 'express';
import { ServicesController } from '../controllers/servicesController';

const router = Router();
const servicesController = new ServicesController();

router.post('/search-product', async (req, res, next) => {
  try {
    const results = await servicesController.handleSearch(req.body.productNameInput);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

router.post('/add-product', async (req, res, next) => {
  try {
    const { name, category, price, stock } = req.body;
    const success = await servicesController.handleAddProduct(name, category, price, stock);
    res.status(200).json({ success });
  } catch (err) {
    next(err);
  }
});

router.post('/record-sale', async (req, res, next) => {
  try {
    const result = await servicesController.handleSale(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/manage-return', async (req, res, next) => {
  try {
    const { saleId } = req.body;
    await servicesController.handleReturn(Number(saleId));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;