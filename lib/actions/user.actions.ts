'use server'

import { revalidatePath } from 'next/cache'
import { connectToDatabase } from '@/lib/database'
import { ObjectId } from 'mongodb'
import { handleError } from '@/lib/utils'
import { CreateUserParams, UpdateUserParams } from '@/types'

export async function createUser(user: CreateUserParams) {
  try {
    const { db } = await connectToDatabase()
    const usersCollection = db.collection('users')

    const newUser = await usersCollection.insertOne({
      ...user,
      events: [],
      orders: [],
      createdAt: new Date()
    })

    return { ...user, _id: newUser.insertedId }
  } catch (error) {
    handleError(error)
  }
}

export async function getUserById(userId: string) {
  try {
    const { db } = await connectToDatabase()
    const usersCollection = db.collection('users')

    const user = await usersCollection.findOne({ clerkId: userId })

    if (!user) throw new Error('User not found')
    return user
  } catch (error) {
    handleError(error)
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    const { db } = await connectToDatabase()
    const usersCollection = db.collection('users')

    const existingUser = await usersCollection.findOne({ clerkId })

    if (!existingUser) {
      throw new Error('User not found')
    }

    const updatedUser = await usersCollection.findOneAndUpdate(
      { clerkId },
      { $set: user },
      { returnDocument: 'after' }
    )

    if (!updatedUser.value) throw new Error('User update failed')
    return updatedUser.value
  } catch (error) {
    handleError(error)
  }
}

export async function deleteUser(clerkId: string) {
  try {
    const { db } = await connectToDatabase()
    const usersCollection = db.collection('users')
    const eventsCollection = db.collection('events')
    const ordersCollection = db.collection('orders')

    // Find user to delete
    const userToDelete = await usersCollection.findOne({ clerkId })

    if (!userToDelete) {
      throw new Error('User not found')
    }

    // Unlink relationships
    await Promise.all([
      // Update the 'events' collection to remove references to the user
      eventsCollection.updateMany(
        { _id: { $in: userToDelete.events?.map((id: string) => new ObjectId(id)) || [] } },
        { $pull: { organizer: userToDelete._id } }
      ),

      // Update the 'orders' collection to remove references to the user
      ordersCollection.updateMany(
        { _id: { $in: userToDelete.orders?.map((id: string) => new ObjectId(id)) || [] } },
        { $unset: { buyer: 1 } }
      ),
    ])

    // Delete user
    const deletedUser = await usersCollection.findOneAndDelete({ _id: userToDelete._id })
    revalidatePath('/')

    return deletedUser.value
  } catch (error) {
    handleError(error)
  }
}
