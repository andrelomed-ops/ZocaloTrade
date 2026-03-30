# ZocaloTrade

E-commerce app con integración de transporte con ClincKargo.

## Integración con ClincKargo

ZocaloTrade usa ClincKargo como proveedor de transporte para entregas.

### Tipos de Vehículos Disponibles

| Tipo | Nombre | Capacidad | Precio Base | Por KM |
|------|--------|-----------|-------------|--------|
| scooter | Scooter | 30 kg | $20 | $6 |
| motorcycle | Motocicleta | 50 kg | $30 | $8 |
| bicycle | Bicicleta | 20 kg | $15 | $5 |
| car | Automóvil/Camioneta | 500 kg | $50 | $12 |
| van | Furgoneta | 1,000 kg | $80 | $18 |
| truck_small | Camión 3.5 Ton | 3,500 kg | $150 | $22 |
| truck_medium | Camión 5 Ton | 5,000 kg | $200 | $28 |
| truck_large | Camión 10+ Ton | 15,000 kg | $350 | $35 |

### Uso del Servicio

```typescript
import { createClincKargoOrder, quoteTransport, getClincKargoOrderStatus, syncOrderStatus } from './src/services/clinckargo';

// Cotizar transporte
const quote = await quoteTransport(pickupCoords, dropoffCoords, items);

// Crear orden
const result = await createClincKargoOrder({
    pedidoId: 'pedido-123',
    pickupAddress: 'Tienda ZocaloTrade',
    dropoffAddress: 'Dirección del cliente',
    items: [{ name: 'Producto', size: 'Mediano', quantity: 1 }]
});

// Sincronizar estado en tiempo real
const unsubscribe = syncOrderStatus('pedido-123', 'order-id', (status, etapa) => {
    console.log('Estado:', etapa);
});
```

### Variables de Entorno

```env
CLINKCARGO_SUPABASE_URL=https://uqxjpimokfalwewmvgxw.supabase.co
CLINKCARGO_ANON_KEY=your_anon_key
```
