// Servicio de MercadoPago para pagos con tarjeta
// Credenciales de prueba

const MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-8131117743674592-030101-f87bf7ab28d81ee7272275c1837add17-3234523389';
const MERCADOPAGO_PUBLIC_KEY = 'APP_USR-0056b858-208a-4436-a49f-b307524d183d';

export interface PaymentData {
  transactionAmount: number;
  description: string;
  paymentMethodId: string;
  email: string;
  cardholderName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  // Para split payment
  splitAmount?: number;
  splitCollectorId?: string;
}

export interface PaymentData {
  transactionAmount: number;
  description: string;
  paymentMethodId: string;
  email: string;
  cardholderName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
}

export async function createPayment(data: PaymentData): Promise<{ status: string; id?: string; error?: string }> {
  try {
    // Generar token de tarjeta
    const tokenResponse = await fetch('https://api.mercadopago.com/v1/card_tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        card_number: data.cardNumber,
        security_code: data.securityCode,
        expiration_month: data.expirationMonth,
        expiration_year: data.expirationYear,
        cardholder_name: data.cardholderName,
        identification_type: 'RFC',
        identification_number: 'XAXX010101000'
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return { status: 'error', error: tokenData.error.message };
    }

    // Crear pago con split (dispersión automática)
    const paymentBody: any = {
      transaction_amount: data.transactionAmount,
      description: data.description,
      payment_method_id: data.paymentMethodId,
      payer: {
        email: data.email
      },
      card_token_id: tokenData.id,
      application_fee: data.splitAmount || 0, // Comisión de ZocaloTrade
      capture: true
    };

    // Si hay split configurado
    if (data.splitAmount && data.splitCollectorId) {
      paymentBody.disbursements = [{
        collector_id: data.splitCollectorId,
        amount: data.transactionAmount - (data.splitAmount || 0),
        application_fee: 0
      }];
    }

    const paymentResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify(paymentBody)
    });

    const paymentData = await paymentResponse.json();
    
    if (paymentData.status === 'approved') {
      return { status: 'success', id: paymentData.id };
    } else if (paymentData.status === 'pending' || paymentData.status === 'in_process') {
      return { status: 'pending', id: paymentData.id };
    } else {
      return { status: 'error', error: paymentData.status_detail || 'Pago rechazado' };
    }
  } catch (error) {
    return { status: 'error', error: 'Error de conexión' };
  }
}

// Obtener métodos de pago disponibles
export async function getPaymentMethods(): Promise<any[]> {
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payment_methods?access_token=${MERCADOPAGO_ACCESS_TOKEN}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

// Crear preferencia de pago (para checkout simple)
export async function createPreference(items: any[], email: string): Promise<{ id?: string; error?: string }> {
  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items,
        payer: { email },
        back_urls: {
          success: 'zocalotrade://success',
          failure: 'zocalotrade://failure'
        }
      })
    });

    const data = await response.json();
    
    if (data.id) {
      return { id: data.id };
    } else {
      return { error: 'Error al crear preferencia' };
    }
  } catch (error) {
    return { error: 'Error de conexión' };
  }
}
