import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Auth',
      version: '1.0.0',
      description: 'Documentation de l’API d’authentification',
    },
    servers: [
      { url: '/sales/api/v1' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez **Bearer &lt;token>**',
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: [__dirname + '/../routes/*.ts'],
};

export default swaggerJSDoc(options);