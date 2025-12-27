export default function DashboardPage() {
    return (
        <div>
            <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Placeholder cards */}
                <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">$0.00</p>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Orders</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
            </div>
        </div>
    );
}
