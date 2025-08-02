import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
} 