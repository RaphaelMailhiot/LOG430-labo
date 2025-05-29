import { Router, Request, Response, NextFunction } from 'express';
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

export default router;