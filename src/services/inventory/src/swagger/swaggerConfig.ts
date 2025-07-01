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
      { url: 'http://localhost:3001/api/v2' }
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
  apis: ['./src/services/auth/routes/*.ts'],
};

export default swaggerJSDoc(options);