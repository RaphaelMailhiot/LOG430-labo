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
    res.render('auth/login', { title, stores, error: null });
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
      const apiGetStores = await apiStore.get('/stores');
      const stores = apiGetStores.data;
      return res.status(400).render('auth/login', {
        title: 'Connexion',
        stores,
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

router.get('/register', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Inscription';
    res.render('auth/register', { title, error: null });
  } catch (err) {
    next(err);
  }
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newUser = req.body;
        if (!newUser || !newUser.name || !newUser.email || !newUser.password) {
        return res.status(400).render('auth/register', {
            title: 'Inscription',
            error: 'Veuillez remplir tous les champs.',
        });
        }

        const apiCreateCustomer = await apiAuth.post('/customers', newUser);
        const createdCustomer = apiCreateCustomer.data;

        if (!createdCustomer) {
        return res.status(400).render('auth/register', {
            title: 'Inscription',
            error: 'Problème lors de la création du compte, veuillez réessayer.',
        });
        }

        res.redirect('/login');
    } catch (err) {
        next(err);
    }
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.selectedStore = undefined;
  res.redirect('/login');
});

export default router;