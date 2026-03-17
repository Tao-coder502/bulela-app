
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key, {
      apiVersion: '2023-10-16' as any, // Use a stable version
    });
  }
  return stripeClient;
}

export class StripeService {
  private get stripe() {
    return getStripe();
  }

  async createCheckoutSession(userId: string, userEmail: string, successUrl: string, cancelUrl: string) {
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) throw new Error('STRIPE_PRO_PRICE_ID is not configured');

    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
      },
    });
  }

  async createPortalSession(customerId: string, returnUrl: string) {
    return await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  constructEvent(payload: string | Buffer, sig: string, secret: string) {
    return this.stripe.webhooks.constructEvent(payload, sig, secret);
  }
}
