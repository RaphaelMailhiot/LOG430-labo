import { app } from './server';
import { logger } from './logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur http://localhost:${PORT}`);
});