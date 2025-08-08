import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Saga Orchestrator API',
      version: '1.0.0',
      description: 'API pour la gestion des sagas de transactions distribuées',
      contact: {
        name: 'Raphaël Mailhiot',
        email: 'raphael.mailhiot@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000/saga',
        description: 'Serveur de développement via Kong'
      },
      {
        url: 'http://localhost:3601',
        description: 'Serveur direct saga-orchestrator-1'
      },
      {
        url: 'http://localhost:3602',
        description: 'Serveur direct saga-orchestrator-2'
      }
    ],
    components: {
      schemas: {
        Saga: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { 
              type: 'string', 
              enum: ['purchase_saga', 'return_saga', 'inventory_update_saga', 'payment_saga'] 
            },
            status: { 
              type: 'string', 
              enum: ['pending', 'in_progress', 'completed', 'failed', 'compensated'] 
            },
            data: { type: 'object' },
            error_message: { type: 'string' },
            retry_count: { type: 'integer' },
            max_retries: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            completed_at: { type: 'string', format: 'date-time' }
          }
        },
        SagaStep: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            saga_id: { type: 'string', format: 'uuid' },
            step_order: { type: 'integer' },
            type: { type: 'string' },
            status: { 
              type: 'string', 
              enum: ['pending', 'in_progress', 'completed', 'failed', 'compensated'] 
            },
            input_data: { type: 'object' },
            output_data: { type: 'object' },
            error_message: { type: 'string' },
            retry_count: { type: 'integer' },
            started_at: { type: 'string', format: 'date-time' },
            completed_at: { type: 'string', format: 'date-time' },
            compensated_at: { type: 'string', format: 'date-time' }
          }
        },
        CreateSagaRequest: {
          type: 'object',
          required: ['type', 'data'],
          properties: {
            type: { 
              type: 'string', 
              enum: ['purchase_saga', 'return_saga', 'inventory_update_saga', 'payment_saga'] 
            },
            data: { type: 'object' }
          }
        },
        PurchaseSagaData: {
          type: 'object',
          required: ['store_id', 'customer_id', 'items', 'payment_method', 'amount'],
          properties: {
            store_id: { type: 'integer' },
            customer_id: { type: 'integer' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_id: { type: 'integer' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' }
                }
              }
            },
            payment_method: { type: 'string' },
            amount: { type: 'number' }
          }
        },
        ReturnSagaData: {
          type: 'object',
          required: ['sale_id', 'customer_id', 'items', 'refund_amount'],
          properties: {
            sale_id: { type: 'integer' },
            customer_id: { type: 'integer' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_id: { type: 'integer' },
                  quantity: { type: 'integer' },
                  reason: { type: 'string' }
                }
              }
            },
            refund_amount: { type: 'number' }
          }
        }
      }
    }
  },
  apis: ['./src/controllers/*.ts', './src/index.ts']
};

export default swaggerJsdoc(options); 