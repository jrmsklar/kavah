import { UserButton } from "@clerk/nextjs";

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Kavah</h1>
      <p className="text-lg text-gray-600">
        Join a community and find your match.
      </p>
      <UserButton />
    </main>
  );
}
