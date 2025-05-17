import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import UserDetailsForm from "@/components/shared/UserDetailsForm";
import { getUserById } from "@/lib/actions/user.actions";

async function Onboarding() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getUserById(userId);

  // If user has already completed profile, redirect to home
  if (user?.hasCompletedProfile) {
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