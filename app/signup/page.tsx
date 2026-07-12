import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Transit Ops</h1>
        <p className="text-center text-gray-500 mb-8">Create your account</p>
        <form className="space-y-5">
          <div>
            <label className="block mb-2 font-medium">Full Name</label>
            <input
              disabled
              type="text"
              placeholder="Enter your name"
              className="w-full border rounded-lg px-4 py-3 bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input
              disabled
              type="email"
              placeholder="Enter your email"
              className="w-full border rounded-lg px-4 py-3 bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Password</label>
            <input
              disabled
              type="password"
              placeholder="Set password from your invite link"
              className="w-full border rounded-lg px-4 py-3 bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <button
            type="button"
            disabled
            className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg cursor-not-allowed"
          >
            Invitation Required
          </button>
        </form>
        <div className="mt-6 rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
          Transit Ops accounts are created by administrators. Ask your administrator to send an invitation link, then use that link to set your password.
        </div>
        <p className="text-center mt-6">
          Already have an account? <Link href="/login" className="font-semibold underline">Sign In</Link>
        </p>
      </div>
    </main>
  );
}
