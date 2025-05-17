import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import UserDetailsForm from "@/components/shared/UserDetailsForm";

interface CustomPublicMetadata {
  hasCompletedProfile?: boolean;
}

export const runtime = 'nodejs';

async function Onboarding() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Check profile completion status from Clerk metadata
  const metadata = user.publicMetadata as CustomPublicMetadata;
  const hasCompletedProfile = metadata.hasCompletedProfile;

  // If user has already completed profile, redirect to home
  if (hasCompletedProfile) {
    redirect('/');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Complete Your Profile</h1>
      <div className="w-full max-w-md">
        <UserDetailsForm userId={userId} />
      </div>
    </main>
  );
}

export default Onboarding; 