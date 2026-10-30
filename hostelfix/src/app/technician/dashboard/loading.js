export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

        <h2 className="mt-5 text-xl font-semibold text-gray-800">
          Loading Technician Dashboard
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Fetching your assigned complaints...
        </p>
      </div>
    </main>
  );
}