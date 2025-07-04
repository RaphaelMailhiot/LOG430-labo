import { Router, Request, Response, NextFunction } from 'express';
import { UsersController } from '../controllers/usersController';

const router = Router();
const usersController = new UsersController();

router.get('/users', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await usersController.getAllUsers();
        res.status(200).sendData(users);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});

router.get('/users/:userEmail/password/:userPassword', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await usersController.getUserConnection(req.params.userEmail, req.params.userPassword);
        res.status(200).sendData(users);
    } catch (err) {
        (err as any).status = 400;
        (err as any).error = 'Bad Request';
        next(err);
    }
});

export default router;