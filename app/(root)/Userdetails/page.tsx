// /Userdetails/page.tsx

import Onboarding from '../../../components/shared/Onboarding'; // Import the Onboarding component

const UserDetailsPage = () => {
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Add Details </h3>
      </section>
      <div>
      <Onboarding /> {/* Render the Onboarding form */}
    </div>
    </>
  );
};

export default UserDetailsPage;
