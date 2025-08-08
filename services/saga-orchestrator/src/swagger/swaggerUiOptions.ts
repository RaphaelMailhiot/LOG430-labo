export const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Saga Orchestrator API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (request: any) => {
      // Ajouter des headers par défaut si nécessaire
      request.headers['Content-Type'] = 'application/json';
      return request;
    },
    responseInterceptor: (response: any) => {
      // Log des réponses pour le debugging
      console.log('API Response:', response);
      return response;
    }
  }
}; 