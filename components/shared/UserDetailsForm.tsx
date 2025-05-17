"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { updateUser } from "@/lib/actions/user.actions"

const formSchema = z.object({
  collegeName: z.string().min(2, { message: "College name must be at least 2 characters" }),
  degree: z.string().min(1, { message: "Please select your degree" }),
  specialization: z.string().min(2, { message: "Specialization must be at least 2 characters" }),
  graduationStartYear: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 2000 && Number(val) <= new Date().getFullYear(), {
      message: "Please enter a valid year from 2000 onwards"
    }),
  graduationEndYear: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 2000, {
      message: "Please enter a valid year from 2000 onwards"
    }),
  phoneNumber: z.string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number must not exceed 15 digits" })
})

type UserDetailsFormProps = {
  userId: string
}

const degrees = [
  "B.Tech", "B.E.", "B.Sc", "B.Com", "BBA", "BCA", "M.Tech", "M.E.", "M.Sc", "M.Com", "MBA", "MCA", "Other"
]

export default function UserDetailsForm({ userId }: UserDetailsFormProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collegeName: "",
      degree: "",
      specialization: "",
      graduationStartYear: "",
      graduationEndYear: "",
      phoneNumber: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateUser(userId, {
        ...values,
        graduationStartYear: parseInt(values.graduationStartYear),
        graduationEndYear: parseInt(values.graduationEndYear),
        hasCompletedProfile: true
      })

      router.push('/')
    } catch (error) {
      console.error("Error updating user details:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="collegeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>College Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your college name" {...field} className="input-field" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="degree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Degree</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your degree" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {degrees.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization</FormLabel>
              <FormControl>
                <Input placeholder="Enter your specialization (e.g., Computer Science, Finance)" {...field} className="input-field" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="graduationStartYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Year</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="YYYY" {...field} className="input-field" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="graduationEndYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Year</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="YYYY" {...field} className="input-field" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Enter your phone number" {...field} className="input-field" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {form.formState.isSubmitting ? "Saving..." : "Save Details"}
        </Button>
      </form>
    </Form>
  )
} 