import { logger } from './logger';
import { app } from './server';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur http://localhost:${PORT}`);
});