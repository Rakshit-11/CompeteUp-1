"use server"

import Stripe from 'stripe';
import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from "@/types"
import { redirect } from 'next/navigation';
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import Order from '../database/models/order.model';
import Event from '../database/models/event.model';
import {ObjectId} from 'mongodb';
import User from '../database/models/user.model';
import { getUserUnsafeMetadata } from "../utils";

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const price = order.isFree ? 0 : Number(order.price) * 100;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: price,
            product_data: {
              name: order.eventTitle
            }
          },
          quantity: 1
        },
      ],
      metadata: {
        eventId: order.eventId,
        buyerId: order.buyerId,
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
    });

    redirect(session.url!)
  } catch (error) {
    throw error;
  }
}



export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase();

    // Check if the user is already registered for the event
    const existingOrder = await Order.findOne({
      event: order.eventId,
      buyer: order.buyerId,
    });

    if (existingOrder) {
      throw new Error("User is already registered for this event.");
    }

    // Fetch user metadata from Clerk
    const metadata = await getUserUnsafeMetadata(order.buyerId);

    // Create a new order with metadata
    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: order.buyerId,
      metadata, // Save metadata directly to the order
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
    throw error; // Ensure the error is propagated to the frontend
  }
};


export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
  try {
    await connectToDatabase();

    if (!eventId) throw new Error("Event ID is required");
    const eventObjectId = new ObjectId(eventId);

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyer",
        },
      },
      {
        $unwind: "$buyer",
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      {
        $unwind: "$event",
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: "$event.title",
          eventId: "$event._id",
          buyerId: "$buyer._id",
          email: "$buyer.email",
        },
      },
      {
        $match: {
          $and: [
            { eventId: eventObjectId },
            { buyerId: { $regex: RegExp(searchString, "i") } },
          ],
        },
      },
    ]);

    // Fetch metadata for each buyer
    const ordersWithMetadata = await Promise.all(
      orders.map(async (order) => {
        const metadata = await getUserUnsafeMetadata(order.buyerId);
        return { ...order, metadata }; // Attach metadata to the order
      })
    );

    return JSON.parse(JSON.stringify(ordersWithMetadata));
  } catch (error) {
    handleError(error);
  }
}


// GET ORDERS BY USER
export async function getOrdersByUser({ userId, limit = 3, page }: GetOrdersByUserParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = { buyer: userId };

    const orders = await Order.distinct("event._id")
      .find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: "event",
        model: Event,
        populate: {
          path: "organizer",
          model: User,
          select: "_id firstName lastName",
        },
      });

    const ordersCount = await Order.distinct("event._id").countDocuments(conditions);

    // Fetch metadata for the buyer
    const ordersWithMetadata = await Promise.all(
      orders.map(async (order) => {
        if (!userId) {
          throw new Error("User ID is required");
        }
        const metadata = await getUserUnsafeMetadata(userId);
        return { ...order, metadata }; // Attach metadata
      })
    );

    return {
      data: JSON.parse(JSON.stringify(ordersWithMetadata)),
      totalPages: Math.ceil(ordersCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}