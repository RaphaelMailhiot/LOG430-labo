import {Router, Request, Response, NextFunction} from 'express';
import {SagaController} from '../controllers/sagaController';

export default function createApiSagaRouter(sagaController: SagaController) {
    const router = Router();

    /**
     * @openapi
     * /sagas:
     *   post:
     *     summary: Démarre une nouvelle saga
     *     tags:
     *       - Sagas
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       201:
     *         description: Saga démarrée
     */
    router.post('/sagas', (req: Request, res: Response, next: NextFunction) => {
        sagaController.startSaga(req, res).catch(next);
    });

    /**
     * @openapi
     * /sagas/{sagaId}/execute:
     *   post:
     *     summary: Exécute une saga par ID
     *     tags:
     *       - Sagas
     *     parameters:
     *       - in: path
     *         name: sagaId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Saga exécutée
     */
    router.post('/sagas/:sagaId/execute', (req: Request, res: Response, next: NextFunction) => {
        sagaController.executeSaga(req, res).catch(next);
    });

    /**
     * @openapi
     * /sagas/{sagaId}:
     *   get:
     *     summary: Récupère une saga par ID
     *     tags:
     *       - Sagas
     *     parameters:
     *       - in: path
     *         name: sagaId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Détails de la saga
     *       404:
     *         description: Saga non trouvée
     */
    router.get('/sagas/:sagaId', (req: Request, res: Response, next: NextFunction) => {
        sagaController.getSaga(req, res).catch(next);
    });

    /**
     * @openapi
     * /sagas:
     *   get:
     *     summary: Liste toutes les sagas
     *     tags:
     *       - Sagas
     *     responses:
     *       200:
     *         description: Liste des sagas
     */
    router.get('/sagas', (req: Request, res: Response, next: NextFunction) => {
        sagaController.getAllSagas(req, res).catch(next);
    });

    /**
     * @openapi
     * /sagas/{sagaId}/compensate:
     *   post:
     *     summary: Compense une saga par ID
     *     tags:
     *       - Sagas
     *     parameters:
     *       - in: path
     *         name: sagaId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Saga compensée
     */
    router.post('/sagas/:sagaId/compensate', (req: Request, res: Response, next: NextFunction) => {
        sagaController.compensateSaga(req, res).catch(next);
    });

    /**
     * @openapi
     * /sagas/{sagaId}/retry:
     *   post:
     *     summary: Relance une saga par ID
     *     tags:
     *       - Sagas
     *     parameters:
     *       - in: path
     *         name: sagaId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Saga relancée
     */
    router.post('/sagas/:sagaId/retry', (req: Request, res: Response, next: NextFunction) => {
        sagaController.retrySaga(req, res).catch(next);
    });

    return router;
}