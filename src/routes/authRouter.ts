import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// Login
router.get('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = 'Connexion';
    res.render('login', { title });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = req.body.storeId;
    if (!storeId) {
      return res.redirect('/login');
    }
    req.session.selectedStore = storeId;
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.selectedStore = undefined;
  res.redirect('/login');
});

export default router;