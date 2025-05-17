import stripe from 'stripe'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createOrder } from '@/lib/actions/order.actions'
import { handleError, ErrorType } from '@/lib/utils'

export const runtime = 'nodejs'

// Maximum payload size for webhook (5MB)
const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024;

// Timeout for webhook processing (30 seconds)
const WEBHOOK_TIMEOUT = 30000;

export async function POST(request: Request) {
  try {
    const body = await request.text()

    // Check payload size
    if (request.headers.get('content-length') && 
        parseInt(request.headers.get('content-length')!) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      )
    }

    const headersList = headers();
    const sig = headersList.get('stripe-signature')

    if (!sig) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!endpointSecret) {
      throw new Error('Missing Stripe webhook secret')
    }

    // Add timeout to webhook processing
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Webhook processing timeout')), WEBHOOK_TIMEOUT)
    );

    const webhookPromise = (async () => {
      let event: stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
      } catch (err) {
        const error = err as Error
        console.error('Webhook signature verification failed:', error.message)
        return NextResponse.json(
          { error: 'Webhook signature verification failed' },
          { status: 400 }
        )
      }

      // Get the ID and type
      const eventType = event.type

      // Handle specific event types
      switch (eventType) {
        case 'checkout.session.completed': {
          const { id, amount_total, metadata } = event.data.object

          if (!metadata?.eventId || !metadata?.buyerId) {
            throw new Error('Missing required metadata in Stripe event')
          }

          const order = {
            stripeId: id,
            eventId: metadata.eventId,
            buyerId: metadata.buyerId,
            totalAmount: amount_total ? (amount_total / 100).toString() : '0',
            createdAt: new Date(),
          }

          try {
            const newOrder = await createOrder(order)
            return NextResponse.json({ message: 'OK', order: newOrder })
          } catch (error) {
            // Handle duplicate order error gracefully
            if (error instanceof Error && error.message.includes('already registered')) {
              return NextResponse.json(
                { message: 'Order already exists', error: error.message },
                { status: 409 }
              )
            }
            throw error
          }
        }

        // Add more event type handlers as needed
        default:
          console.log(`Unhandled event type: ${eventType}`)
          return NextResponse.json({ message: 'Unhandled event type' }, { status: 200 })
      }
    })();

    // Race between timeout and webhook processing
    await Promise.race([webhookPromise, timeoutPromise]);

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.type === ErrorType.VALIDATION ? 400 : 500 }
    )
  }
}
