"use client";

import { useState, useEffect, useCallback } from "react";

interface Application {
  id: string;
  treatmentType: string;
  treatmentCost: number;
  status: string;
  offerMonthly: number | null;
  offerTerm: number | null;
  createdAt: string;
  patient: { name: string; phone: string; email: string };
  lender: { name: string } | null;
  clinic: { name: string };
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-yellow-100 text-yellow-700",
  prequalified: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  funded: "bg-purple-100 text-purple-700",
};

export default function ClinicDashboard() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clinic/applications", {
        headers: { "x-clinic-password": password },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setApplications(data);
    } catch {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [password]);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/clinic/applications", {
        headers: { "x-clinic-password": password },
      });
      if (res.status === 401) {
        setError("Invalid password");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setApplications(data);
      setAuthenticated(true);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchApplications();
    }
  }, [authenticated, fetchApplications]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-clinic-password": password,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchApplications();
    } catch {
      alert("Failed to update status");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Clinic Dashboard
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter clinic password"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Checking..." : "Login"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Clinic Dashboard</h1>
          <button
            onClick={() => {
              setAuthenticated(false);
              setPassword("");
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Applications ({applications.length})
          </h2>
          <button
            onClick={fetchApplications}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && applications.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No applications yet. Share the application link with patients to get started.
          </div>
        )}

        {!loading && applications.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Treatment</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Cost (AED)</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Lender</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{app.patient.name}</div>
                        <div className="text-gray-500 text-xs">{app.patient.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{app.treatmentType}</td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {app.treatmentCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {app.lender?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[app.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {app.status === "prequalified" && (
                            <>
                              <button
                                onClick={() => updateStatus(app.id, "approved")}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(app.id, "rejected")}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {app.status === "approved" && (
                            <button
                              onClick={() => updateStatus(app.id, "funded")}
                              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                            >
                              Mark Funded
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
