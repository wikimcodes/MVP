export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Payma</h1>
        <p className="text-lg text-gray-600 mb-8">
          UAE Healthcare Financing Pre-Eligibility Platform
        </p>
        <a
          href="/clinic/dashboard"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Clinic Dashboard
        </a>
      </div>
    </div>
  );
}
