import { Router, Request, Response, NextFunction } from 'express';
import { CustomersController } from '../controllers/customersController';

const router = Router();
const customersController = new CustomersController();

/**
 * @openapi
 * /customers:
 *   get:
 *     summary: Liste tous les clients
 *     tags:
 *       - Clients
 *     responses:
 *       200:
 *         description: Liste des clients
 */
router.get('/customers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customers = await customersController.getAllCustomers();
        res.status(200).sendData(customers);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /customers:
 *   post:
 *     summary: Crée un nouveau client
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client créé avec succès
 *       400:
 *         description: Requête invalide
 */
router.post('/customers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newCustomer = req.body;
        if (!newCustomer || !newCustomer.name) {
            return res.status(400).sendData({ error: 'Invalid customer data' });
        }
        const createdCustomer = await customersController.createCustomer(newCustomer);
        res.status(201).sendData(createdCustomer);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /customers/{customerId}:
 *   get:
 *     summary: Récupère un client par son ID
 *     tags:
 *       - Clients
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: ID du client à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du client
 *       404:
 *         description: Client non trouvé
 */
router.get('/customers/:customerId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = Number(req.params.customerId);
        const customer = await customersController.getCustomerById(customerId);
        if (customer) {
            res.status(200).sendData(customer);
        } else {
            res.status(404).sendData({ error: 'Customer not found' });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});

export default router;