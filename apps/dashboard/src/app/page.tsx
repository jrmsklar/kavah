import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Kavah Dashboard</h1>
      <p className="text-lg text-gray-600">
        Manage your community and create matches.
      </p>
      <UserButton />
    </main>
  );
}
