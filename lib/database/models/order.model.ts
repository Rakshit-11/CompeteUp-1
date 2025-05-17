import { Schema, model, models, Model, Document } from 'mongoose'

export interface IOrderItem {
  _id: string
  createdAt: Date
  stripeId: string
  totalAmount: string
  eventTitle: string
  eventId: string
  buyerName: string
  buyerDetails: {
    email: string
    firstName: string
    lastName: string
    photo: string
    collegeName?: string
    degree?: string
    specialization?: string
    graduationStartYear?: number
    graduationEndYear?: number
    phoneNumber?: string
    username: string
  }
}

export interface IOrder extends Document {
  createdAt: Date
  stripeId: string
  totalAmount: string
  event: {
    _id: string
    title: string
  }
  buyer: {
    _id: string
    firstName: string
    lastName: string
  }
}

const OrderSchema = new Schema<IOrder>({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stripeId: {
    type: String,
    required: true,
    unique: true,
  },
  totalAmount: {
    type: String,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Compound index for event and buyer (prevents duplicate orders)
OrderSchema.index({ event: 1, buyer: 1 }, { unique: true });

// Index for createdAt (for sorting and date-based queries)
OrderSchema.index({ createdAt: -1 });

// Index for stripeId (for payment lookups)
OrderSchema.index({ stripeId: 1 }, { unique: true });

// Index for buyer (for user's orders queries)
OrderSchema.index({ buyer: 1 });

// Index for event (for event's orders queries)
OrderSchema.index({ event: 1 });

// Add error handling for duplicate orders
OrderSchema.post('save', function(error: any, doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('You have already registered for this event'));
  } else {
    next(error);
  }
});

const Order: Model<IOrder> = models?.Order || model<IOrder>('Order', OrderSchema);

export default Order;
