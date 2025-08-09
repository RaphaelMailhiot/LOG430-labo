# Exemples d'Utilisation de l'API Saga via Kong

## Accès via Kong Gateway

Toutes les requêtes passent maintenant par Kong à l'adresse : `http://localhost:8000/saga`

## 1. Démarrer une Saga d'Achat

```bash
curl -X POST http://localhost:8000/saga-orchestrator/api/v1/sagas \
  -H "Content-Type: application/json" \
  -d '{
    "type": "purchase_saga",
    "data": {
      "store_id": 1,
      "customer_id": 123,
      "items": [
        {
          "product_id": 456,
          "quantity": 2,
          "price": 29.99
        }
      ],
      "payment_method": "credit_card",
      "amount": 59.98
    }
  }'
```

**Réponse :**
```json
{
  "message": "Saga démarrée avec succès",
  "saga": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "purchase_saga",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## 2. Exécuter une Saga

```bash
curl -X POST http://localhost:8000/saga-orchestrator/api/v1/sagas/550e8400-e29b-41d4-a716-446655440000/execute
```

**Réponse :**
```json
{
  "message": "Saga exécutée avec succès",
  "saga": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "purchase_saga",
    "status": "completed",
    "completed_at": "2024-01-15T10:31:00Z",
    "steps": [
      {
        "id": "step-1",
        "type": "validate_inventory",
        "status": "completed",
        "step_order": 1,
        "started_at": "2024-01-15T10:30:30Z",
        "completed_at": "2024-01-15T10:30:35Z"
      },
      {
        "id": "step-2",
        "type": "reserve_inventory",
        "status": "completed",
        "step_order": 2,
        "started_at": "2024-01-15T10:30:35Z",
        "completed_at": "2024-01-15T10:30:40Z"
      },
      {
        "id": "step-3",
        "type": "process_payment",
        "status": "completed",
        "step_order": 3,
        "started_at": "2024-01-15T10:30:40Z",
        "completed_at": "2024-01-15T10:30:45Z"
      },
      {
        "id": "step-4",
        "type": "create_sale",
        "status": "completed",
        "step_order": 4,
        "started_at": "2024-01-15T10:30:45Z",
        "completed_at": "2024-01-15T10:30:50Z"
      },
      {
        "id": "step-5",
        "type": "update_inventory",
        "status": "completed",
        "step_order": 5,
        "started_at": "2024-01-15T10:30:50Z",
        "completed_at": "2024-01-15T10:30:55Z"
      }
    ]
  }
}
```

## 3. Consulter une Saga

```bash
curl -X GET http://localhost:8000/saga-orchestrator/api/v1/sagas/550e8400-e29b-41d4-a716-446655440000
```

## 4. Lister toutes les Sagas

```bash
# Toutes les sagas
curl -X GET http://localhost:8000/saga-orchestrator/api/v1/sagas

# Sagas filtrées
curl -X GET "http://localhost:8000/saga-orchestrator/api/v1/sagas?status=completed&type=purchase_saga&limit=10&offset=0"
```

## 5. Compenser une Saga Échouée

```bash
curl -X POST http://localhost:8000/saga-orchestrator/api/v1/sagas/550e8400-e29b-41d4-a716-446655440000/compensate
```

## 6. Retenter une Saga

```bash
curl -X POST http://localhost:8000/saga-orchestrator/api/v1/sagas/550e8400-e29b-41d4-a716-446655440000/retry
```

## 7. Saga de Retour

```bash
# Démarrer une saga de retour
curl -X POST http://localhost:8000/saga-orchestrator/api/v1/sagas \
  -H "Content-Type: application/json" \
  -d '{
    "type": "return_saga",
    "data": {
      "sale_id": 789,
      "customer_id": 123,
      "items": [
        {
          "product_id": 456,
          "quantity": 1,
          "reason": "defective"
        }
      ],
      "refund_amount": 29.99
    }
  }'
```

## 8. Health Check via Kong

```bash
curl -X GET http://localhost:8000/saga/health
```

**Réponse :**
```json
{
  "status": "healthy",
  "service": "saga-orchestrator",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 9. Métriques via Kong

```bash
curl -X GET http://localhost:8000/saga/metrics
```

## Avantages de l'Utilisation de Kong

### 🔒 **Sécurité**
- **Rate Limiting** : Protection contre les abus
- **CORS** : Gestion des origines autorisées
- **Authentication** : Possibilité d'ajouter l'authentification

### 📊 **Monitoring**
- **Logs centralisés** : Toutes les requêtes sont loggées
- **Métriques** : Monitoring des performances
- **Tracing** : Suivi des requêtes

### 🔄 **Load Balancing**
- **Round-robin** : Distribution automatique entre les instances
- **Haute disponibilité** : Redondance des services
- **Failover** : Basculement automatique en cas d'échec

### 🚀 **Performance**
- **Cache** : Mise en cache des réponses
- **Compression** : Réduction de la taille des réponses
- **SSL Termination** : Gestion centralisée du SSL

## Configuration Kong

### Upstream
```yaml
- name: saga-orchestrator-upstream
  algorithm: round-robin
  targets:
    - target: saga-orchestrator-1:3000
    - target: saga-orchestrator-2:3000
```

### Service
```yaml
- name: saga-orchestrator
  host: saga-orchestrator-upstream
  port: 3000
  routes:
    - name: saga-orchestrator-service
      paths:
        - /saga
      strip_path: true
```

### Plugins
- **CORS** : Gestion des origines
- **Rate Limiting** : Limitation des requêtes
- **Logging** : Logs centralisés
- **Prometheus** : Métriques

## Tests de Performance

```bash
# Test de charge simple
ab -n 1000 -c 10 http://localhost:8000/saga/health

# Test avec données
ab -n 100 -c 5 -p saga-data.json -T application/json \
   http://localhost:8000/saga-orchestrator/api/v1/sagas
```

## Monitoring

### Grafana Dashboard
- **Saga Metrics** : Nombre de sagas par type/statut
- **Performance** : Temps de réponse des étapes
- **Errors** : Taux d'échec et compensations
- **Throughput** : Sagas par minute

### Alertes
- **Saga Failures** : Alertes en cas d'échec
- **High Latency** : Temps de réponse élevé
- **Service Down** : Service non disponible 