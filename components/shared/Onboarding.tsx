'use client'
import { useUser } from '@clerk/nextjs'
import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingFormData {
  collegeName: string;
  gradStartYear: string;
  gradEndYear: string;
  phoneNumber: string;
  gender: string;
  Course: string;
  specialization: string;
}

const Onboarding = () => {
  const { user } = useUser(); // Access user from Clerk
  const router = useRouter();
  const [formData, setFormData] = useState<OnboardingFormData>({
    collegeName: '',
    gradStartYear: '',
    gradEndYear: '',
    phoneNumber: '',
    gender: '',
    Course: '',
    specialization: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch the existing data when the component mounts
  useEffect(() => {
    if (user) {
      const { unsafeMetadata } = user;

      // Ensure values are strings (fallback to empty string if undefined)
      setFormData({
        collegeName: String(unsafeMetadata?.collegeName || ''),
        gradStartYear: String(unsafeMetadata?.graduationStartYear || ''),
        gradEndYear: String(unsafeMetadata?.graduationEndYear || ''),
        phoneNumber: String(unsafeMetadata?.phoneNumber || ''),
        gender: String(unsafeMetadata?.gender || ''),
        Course: String(unsafeMetadata?.Course || ''),
        specialization: String(unsafeMetadata?.specialization || ''),
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate phone number
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        setError('Please enter a valid 10-digit phone number.');
        setIsLoading(false);
        return;
      }

      // Check if user is available
      if (!user) {
        setError('User is not authenticated.');
        setIsLoading(false);
        return;
      }

      // Update Clerk user's unsafeMetadata
      await user.update({
        unsafeMetadata: {
          collegeName: formData.collegeName,
          graduationStartYear: formData.gradStartYear,
          graduationEndYear: formData.gradEndYear,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          Course: formData.Course,
          specialization: formData.specialization,
        },
      });

      router.push('/'); // Redirect after success
    } catch (error) {
      console.error("Error updating user metadata:", error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto p-5">
      {error && <div className="text-red-500 mb-3">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* College Name */}
        <div className="flex flex-col">
          <label htmlFor="collegeName" className="mb-2 font-semibold">College Name</label>
          <input
            id="collegeName"
            type="text"
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        {/* Graduation Start Year */}
        <div className="flex flex-col">
          <label htmlFor="gradStartYear" className="mb-2 font-semibold">Graduation Start Year</label>
          <input
            id="gradStartYear"
            type="number"
            name="gradStartYear"
            value={formData.gradStartYear}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        {/* Graduation End Year */}
        <div className="flex flex-col">
          <label htmlFor="gradEndYear" className="mb-2 font-semibold">Graduation End Year</label>
          <input
            id="gradEndYear"
            type="number"
            name="gradEndYear"
            value={formData.gradEndYear}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        {/* Phone Number */}
        <div className="flex flex-col">
          <label htmlFor="phoneNumber" className="mb-2 font-semibold">Phone Number</label>
          <input
            id="phoneNumber"
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col">
          <label htmlFor="gender" className="mb-2 font-semibold">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Stream */}
        <div className="flex flex-col">
          <label htmlFor="Course" className="mb-2 font-semibold">Course</label>
          <input
            id="Course"
            type="text"
            name="Course"
            value={formData.Course}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        {/* Specialization */}
        <div className="flex flex-col">
          <label htmlFor="specialization" className="mb-2 font-semibold">Specialization</label>
          <input
            id="specialization"
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="button w-full mt-5"
      >
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default Onboarding;
