import { Router, Request, Response, NextFunction } from 'express';
import { SupplyRequestsController } from '../controllers/supplyRequestsController';

const router = Router();
const supplyRequestsController = new SupplyRequestsController();

//TODO implémenter la logique router

export default router;