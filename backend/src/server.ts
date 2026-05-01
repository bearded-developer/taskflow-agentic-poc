import { createApp } from './app';
import logger from './logger';

const PORT = process.env.PORT || 3001;
const app = createApp();

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
