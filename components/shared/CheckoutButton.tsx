"use client"

import { IEvent } from '@/lib/database/models/event.model'
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import Checkout from './Checkout'

const CheckoutButton = ({ event }: { event: IEvent }) => {
  const { user } = useUser();
  const userId = user?.publicMetadata.userId as string;
  const hasEventFinished = new Date(event.endDateTime) < new Date();

  // Check if the user is the organizer
  const isOrganizer = userId === event.organizer._id;

  if (hasEventFinished) {
    return <p className="p-2 text-red-400">Sorry, tickets are no longer available.</p>;
  }

  if (isOrganizer) {
    return <p className="p-2 text-red-400">You cannot register for your own event.</p>;
  }

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <SignedIn>
          <Checkout event={event} userId={userId} />
        </SignedIn>
      ) : (
        <SignedOut>
          <Button asChild className="button rounded-full" size="lg">
            <Link href="/sign-in">Register</Link>
          </Button>
        </SignedOut>
      )}
    </div>
  );
};

export default CheckoutButton;
