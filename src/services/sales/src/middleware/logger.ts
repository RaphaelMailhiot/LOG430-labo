import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info', // niveau minimum à loguer (info, warn, error, etc.)
  format: winston.format.json(), // format structuré JSON
  transports: [
    new winston.transports.Console(), // affiche dans la console
  ],
});