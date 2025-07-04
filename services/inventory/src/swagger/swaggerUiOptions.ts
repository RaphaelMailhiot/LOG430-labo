export const swaggerUiOptions = {
    swaggerOptions: {
        authAction: {
            bearerAuth: {
                name: 'bearerAuth',
                schema: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'Token',
                },
                value: process.env.API_STATIC_TOKEN,
            }
        }
    }
};