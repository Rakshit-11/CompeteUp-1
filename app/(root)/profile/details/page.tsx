import { auth } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.actions";

async function ProfileDetails() {
  const { userId } = auth();
  
  if (!userId) {
    return <div>Please log in to view your profile details.</div>;
  }

  const user = await getUserById(userId);

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Profile Details</h3>
      </section>

      <section className="wrapper mt-8">
        <div className="flex flex-col gap-8 md:gap-10">
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Basic Info */}
            <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-bold text-xl">Basic Information</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={user.photo} 
                    alt={user.firstName}
                    className="rounded-full w-20 h-20 object-cover"
                  />
                  <div>
                    <p className="p-medium-16 text-gray-600">Name</p>
                    <p className="p-medium-18">{user.firstName} {user.lastName}</p>
                  </div>
                </div>
                <div>
                  <p className="p-medium-16 text-gray-600">Email</p>
                  <p className="p-medium-18">{user.email}</p>
                </div>
                <div>
                  <p className="p-medium-16 text-gray-600">Username</p>
                  <p className="p-medium-18">{user.username}</p>
                </div>
              </div>
            </div>

            {/* Education Details */}
            <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-bold text-xl">Education Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="p-medium-16 text-gray-600">College Name</p>
                  <p className="p-medium-18">{user.collegeName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="p-medium-16 text-gray-600">Degree</p>
                  <p className="p-medium-18">{user.degree || 'Not provided'}</p>
                </div>
                <div>
                  <p className="p-medium-16 text-gray-600">Specialization</p>
                  <p className="p-medium-18">{user.specialization || 'Not provided'}</p>
                </div>
                <div>
                  <p className="p-medium-16 text-gray-600">Duration</p>
                  <p className="p-medium-18">
                    {user.graduationStartYear ? `${user.graduationStartYear} - ${user.graduationEndYear || 'Present'}` : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-bold text-xl">Contact Details</h2>
              <div>
                <p className="p-medium-16 text-gray-600">Phone Number</p>
                <p className="p-medium-18">{user.phoneNumber || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ProfileDetails; 