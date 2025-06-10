import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Log430',
      version: '1.0.0',
      description: 'Documentation de l’API Log430',
    },
    servers: [
      { url: 'http://localhost:3000/api/v2' }
    ],
  },
  apis: ['./src/routes/*.ts'], // Chemin vers tes fichiers de routes avec JSDoc
};

export default swaggerJSDoc(options);