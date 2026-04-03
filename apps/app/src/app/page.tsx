import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function App() {
  return (
    <>
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-xl font-bold">Kavah</span>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="redirect">
              <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Log In
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
      <main className="flex flex-1 flex-col items-center justify-center min-h-[calc(100vh-65px)]">
        <SignedOut>
          <h1 className="text-4xl font-bold">Kavah</h1>
          <p className="mt-4 text-lg text-gray-600">
            Join a community and find your match.
          </p>
        </SignedOut>
        <SignedIn>
          <h1 className="text-4xl font-bold">Welcome back</h1>
          <p className="mt-4 text-lg text-gray-600">
            Join a community and find your match.
          </p>
        </SignedIn>
      </main>
    </>
  );
}
