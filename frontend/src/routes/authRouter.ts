import axios from 'axios';
import {NextFunction, Request, Response, Router} from 'express';

const router = Router();
const apiStore = axios.create({
  baseURL: 'http://kong:8000/store/api/v1',
});
const apiAuth = axios.create({
  baseURL: 'http://kong:8000/auth/api/v1',
});

router.get('/login', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Connexion';
    const apiGetStores = await apiStore.get('/stores');
    const stores = apiGetStores.data;
    res.render('auth/login', { title, stores });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = req.body.storeId;
    const email = req.body.email;
    const password = req.body.password;
    const apiGetConnection = await apiAuth.get('/users/' + email + '/password/' + password);
    const user = apiGetConnection.data;

    if (!user) {
      return res.status(400).render('/login', {
        title: 'Connexion',
        error: 'Problème de connexion, veuillez vérifier vos identifiants.',
      });
    }

    req.session.user = user;

    if (user.store_id) {
      req.session.isManager = true;
      const apiGetStore = await apiStore.get('/stores/' + user.store_id);
      req.session.selectedStore = apiGetStore.data;
      res.redirect('/dashboard');
    } else {
      req.session.isManager = false;
      const apiGetStore = await apiStore.get('/stores/' + storeId);
      req.session.selectedStore = apiGetStore.data;
      res.redirect('/');
    }

  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.selectedStore = undefined;
  res.redirect('/login');
});

export default router;