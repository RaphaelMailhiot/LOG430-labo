import { Router, Request, Response, NextFunction } from 'express';
import { ManagersController } from '../controllers/managersController';

const router = Router();
const managersController = new ManagersController();

/**
 * @openapi
 * /managers:
 *   get:
 *     summary: Liste tous les gérants
 *     tags:
 *       - Gérants
 *     responses:
 *       200:
 *         description: Liste des gérants
 */
router.get('/managers', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const managers = await managersController.getAllManagers();
        res.status(200).sendData(managers);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /managers:
 *   post:
 *     summary: Crée un nouveau gérant
 *     tags:
 *       - Gérants
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
 *         description: Gérant créé avec succès
 *       400:
 *         description: Requête invalide
 */
router.post('/managers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newManager = req.body;
        if (!newManager || !newManager.name) {
            return res.status(400).sendData({ error: 'Invalid manager data' });
        }
        const createdManager = await managersController.createManager(newManager);
        res.status(201).sendData(createdManager);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});
/**
 * @openapi
 * /managers/{managerId}:
 *   get:
 *     summary: Récupère un gérant par son ID
 *     tags:
 *       - Gérants
 *     parameters:
 *       - in: path
 *         name: managerId
 *         required: true
 *         description: ID du gérant à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du gérant
 *       404:
 *         description: Gérant non trouvé
 */
router.get('/managers/:managerId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const managerId = Number(req.params.managerId);
        const manager = await managersController.getManagerById(managerId);
        if (manager) {
            res.status(200).sendData(manager);
        } else {
            res.status(404).sendData({ error: 'Manager not found' });
        }
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});

export default router;