import { NextRequest, NextResponse } from 'next/server';

interface ClinkargoWebhookPayload {
    event: string;
    timestamp: string;
    order: {
        id: string;
        partner_order_id: string;
        status: string;
        pickup_address: string;
        dropoff_address: string;
        driver_name?: string;
        driver_phone?: string;
        eta?: number;
        price?: number;
    };
}

const WEBHOOK_SECRET = process.env.CLINKARGO_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
    try {
        const payload: ClinkargoWebhookPayload = await request.json();
        const signature = request.headers.get('x-clinkargo-signature');

        if (!signature || signature !== WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        console.log('[Clinkargo Webhook] Received event:', payload.event, 'Order:', payload.order?.id);

        switch (payload.event) {
            case 'order.created':
                console.log('[Clinkargo] Order created:', payload.order.partner_order_id);
                break;

            case 'order.assigned':
                console.log('[Clinkargo] Driver assigned:', payload.order.driver_name, 'Order:', payload.order.partner_order_id);
                break;

            case 'order.picked_up':
                console.log('[Clinkargo] Order picked up:', payload.order.partner_order_id);
                break;

            case 'order.in_transit':
                console.log('[Clinkargo] Order in transit:', payload.order.partner_order_id);
                break;

            case 'order.delivered':
                console.log('[Clinkargo] Order delivered:', payload.order.partner_order_id);
                break;

            case 'order.cancelled':
                console.log('[Clinkargo] Order cancelled:', payload.order.partner_order_id);
                break;

            default:
                console.log('[Clinkargo] Unknown event:', payload.event);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('[Clinkargo Webhook] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ 
        status: 'Webhook endpoint active',
        events: ['order.created', 'order.assigned', 'order.picked_up', 'order.in_transit', 'order.delivered', 'order.cancelled']
    });
}
