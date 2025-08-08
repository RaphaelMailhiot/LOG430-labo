import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

export const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'saga-orchestrator' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Si on n'est pas en production, log aussi dans un fichier
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.File({ 
        filename: 'logs/saga-orchestrator.log',
        level: 'debug'
    }));
} 