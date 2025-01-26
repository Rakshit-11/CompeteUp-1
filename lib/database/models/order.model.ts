import { Schema, model, models, Document } from 'mongoose'

export interface IOrder extends Document {
  createdAt: Date
  stripeId: string
  totalAmount: number
  event: {
    _id: string
    title: string
    metadata?: {
      collegeName?: string
      graduationStartYear?: string
      graduationEndYear?: string
      phoneNumber?: string
      gender?: string
      stream?: string
      specialization?: string
    }
  }
  buyer: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
}

export type IOrderItem = {
  _id: string
  totalAmount: number
  createdAt: Date
  eventTitle: string
  eventId: string
  buyer: string
  email: string
  metadata?: {
    collegeName?: string
    graduationStartYear?: string
    graduationEndYear?: string
    phoneNumber?: string
    gender?: string
    stream?: string
    specialization?: string
  }
}

const OrderSchema = new Schema({
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
    type: Number,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
})

OrderSchema.index({ event: 1, buyer: 1 }, { unique: true });

const Order = models.Order || model('Order', OrderSchema)

export default Order
